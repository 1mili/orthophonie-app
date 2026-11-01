import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { consultations } from "@/lib/db/schema";
import { assertRoomAccess } from "@/lib/teleconsultation-auth";

const notesSchema = z.object({
  notes: z.string().max(10_000, "Notes trop volumineuses").optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;
  const access = await assertRoomAccess(roomCode, { allowEnded: true });
  if (!access.ok) return access.response;

  // Requirement 2.3: Only admin can read clinical notes
  if (access.session.role !== "admin") {
    return NextResponse.json(
      { error: "forbidden", message: "Seul le praticien peut consulter les notes cliniques." },
      { status: 403 }
    );
  }

  return NextResponse.json({ notes: access.consultation.notes ?? "" });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;
  const access = await assertRoomAccess(roomCode, { allowEnded: true });
  if (!access.ok) return access.response;

  // Requirement 2.3: Only admin can write clinical notes
  if (access.session.role !== "admin") {
    return NextResponse.json(
      { error: "forbidden", message: "Seul le praticien peut enregistrer des notes cliniques." },
      { status: 403 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = notesSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const notes = parsed.data.notes?.trim() || null;

  await db
    .update(consultations)
    .set({ notes })
    .where(eq(consultations.roomCode, roomCode));

  return NextResponse.json({ ok: true, notes: notes ?? "" });
}
