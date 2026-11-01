import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { consultations } from "@/lib/db/schema";
import { assertRoomAccess } from "@/lib/teleconsultation-auth";

const signalingSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("offer"),
    sdp: z.string().min(1, "SDP offer cannot be empty").max(100_000, "SDP payload too large"),
  }),
  z.object({
    type: z.literal("answer"),
    sdp: z.string().min(1, "SDP answer cannot be empty").max(100_000, "SDP payload too large"),
  }),
  z.object({
    type: z.literal("end"),
    sdp: z.string().max(100_000).optional(),
  }),
]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;
  const access = await assertRoomAccess(roomCode);
  if (!access.ok) return access.response;

  return NextResponse.json({
    status: access.consultation.status,
    offerSdp: access.consultation.offerSdp,
    answerSdp: access.consultation.answerSdp,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;
  const access = await assertRoomAccess(roomCode);
  if (!access.ok) return access.response;

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = signalingSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Requirement 2.3: Only admin can end the session
  if (data.type === "end") {
    if (access.session.role !== "admin") {
      return NextResponse.json(
        { error: "forbidden", message: "Seul le praticien peut terminer la séance." },
        { status: 403 }
      );
    }

    await db
      .update(consultations)
      .set({ status: "completed", endedAt: new Date() })
      .where(eq(consultations.roomCode, roomCode));

    return NextResponse.json({ ok: true });
  }

  await db
    .update(consultations)
    .set(
      data.type === "offer"
        ? {
            offerSdp: data.sdp,
            status: "ongoing",
            startedAt: access.consultation.startedAt ?? new Date(),
          }
        : { answerSdp: data.sdp }
    )
    .where(eq(consultations.roomCode, roomCode));

  return NextResponse.json({ ok: true });
}
