import { NextRequest, NextResponse } from "next/server";
import { eq, and, or } from "drizzle-orm";
import { promises as fs } from "fs";
import path from "path";
import { db } from "@/lib/db";
import { consultationDocuments } from "@/lib/db/schema";
import { assertRoomAccess } from "@/lib/teleconsultation-auth";

const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "storage", "teleconsultation-documents");
const LEGACY_DIR = path.join(process.cwd(), "public", "uploads");

const MIME_MAP: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomCode: string; documentId: string }> }
) {
  const { roomCode, documentId } = await params;

  // Requirement: Servis par une route authentifiée qui appelle assertRoomAccess avec allowClosed: true
  const access = await assertRoomAccess(roomCode, { allowClosed: true });
  if (!access.ok) return access.response;

  const numId = Number(documentId);
  const isNumeric = !isNaN(numId) && numId > 0;

  // Locate the document in database
  const doc = await db.query.consultationDocuments.findFirst({
    where: and(
      eq(consultationDocuments.consultationId, access.consultation.id),
      isNumeric
        ? eq(consultationDocuments.id, numId)
        : eq(consultationDocuments.fileUrl, `/api/teleconsultation/${roomCode}/documents/${documentId}`)
    ),
  });

  if (!doc) {
    return NextResponse.json({ error: "document_not_found" }, { status: 404 });
  }

  // Extract disk filename safely (prevent directory traversal)
  const diskFileName = path.basename(doc.fileUrl);
  let filePath = path.join(UPLOAD_DIR, diskFileName);

  let fileBuffer: Buffer | null = null;
  try {
    fileBuffer = await fs.readFile(filePath);
  } catch {
    // Fallback: check legacy directory if uploaded before migration
    try {
      filePath = path.join(LEGACY_DIR, diskFileName);
      fileBuffer = await fs.readFile(filePath);
    } catch {
      return NextResponse.json({ error: "file_not_found_on_disk" }, { status: 404 });
    }
  }

  const ext = path.extname(diskFileName).toLowerCase();
  const contentType = MIME_MAP[ext] || "application/octet-stream";

  return new Response(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.fileName)}"`,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
