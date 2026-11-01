import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { consultationDocuments } from "@/lib/db/schema";
import { assertRoomAccess } from "@/lib/teleconsultation-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "teleconsultation-documents");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validates real file type from binary magic bytes (signature sniffing).
 * Prevents Content-Type spoofing and malicious file uploads.
 */
function detectFileType(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 12) return null;

  // PDF signature: %PDF (0x25, 0x50, 0x44, 0x46)
  if (
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46
  ) {
    return { ext: ".pdf", mime: "application/pdf" };
  }

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: ".png", mime: "image/png" };
  }

  // JPEG signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }

  // WebP signature: "RIFF" .... "WEBP"
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { ext: ".webp", mime: "image/webp" };
  }

  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;
  const access = await assertRoomAccess(roomCode, { allowClosed: true });
  if (!access.ok) return access.response;

  const rows = await db
    .select()
    .from(consultationDocuments)
    .where(eq(consultationDocuments.consultationId, access.consultation.id));

  return NextResponse.json({ documents: rows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;
  const access = await assertRoomAccess(roomCode);
  if (!access.ok) return access.response;

  // Rate limiting on document upload: max 10 uploads per 60s (key = userId + roomCode)
  const rl = await checkRateLimit(
    `upload:${access.session.userId}:${roomCode}`,
    { max: 10, windowSeconds: 60 }
  );
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: "too_many_requests",
        message: `Trop d'envois de fichiers. Réessayez dans ${rl.retryAfterSeconds}s.`,
      },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "invalid_form_data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "file_too_large", message: "Le fichier ne doit pas dépasser 10 Mo." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectFileType(buffer);

  if (!detected) {
    return NextResponse.json(
      {
        error: "invalid_file_signature",
        message:
          "Type de fichier non autorisé. Seuls les fichiers PDF, PNG, JPEG et WebP réels sont acceptés.",
      },
      { status: 400 }
    );
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  // Filename is strictly a server-generated random UUID + validated extension.
  // The client-supplied filename is NEVER used in the filesystem path.
  const diskFileName = `${crypto.randomUUID()}${detected.ext}`;
  const diskFilePath = path.join(UPLOAD_DIR, diskFileName);

  await fs.writeFile(diskFilePath, buffer);

  // Store metadata in DB: client fileName is sanitized and kept only for display
  const [row] = await db
    .insert(consultationDocuments)
    .values({
      consultationId: access.consultation.id,
      fileName: file.name.slice(0, 255),
      fileUrl: `/api/teleconsultation/${roomCode}/documents/${diskFileName}`,
      uploadedBy: access.role,
    })
    .returning();

  return NextResponse.json({ document: row });
}
