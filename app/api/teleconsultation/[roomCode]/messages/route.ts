import { NextRequest, NextResponse } from "next/server";
import { eq, gt, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { consultationMessages } from "@/lib/db/schema";
import { assertRoomAccess } from "@/lib/teleconsultation-auth";
import { checkRateLimit } from "@/lib/rate-limit";

const messagePostSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Le message ne peut pas être vide.")
    .max(2000, "Le message ne peut pas dépasser 2000 caractères."),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;
  const access = await assertRoomAccess(roomCode, { allowClosed: true });
  if (!access.ok) return access.response;

  const url = new URL(req.url);
  const sinceParam = Number(url.searchParams.get("since") ?? 0);
  const since = !isNaN(sinceParam) && sinceParam >= 0 ? sinceParam : 0;

  const rows = await db
    .select()
    .from(consultationMessages)
    .where(
      and(
        eq(consultationMessages.consultationId, access.consultation.id),
        gt(consultationMessages.id, since)
      )
    )
    .orderBy(consultationMessages.id);

  return NextResponse.json({ messages: rows });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;
  const access = await assertRoomAccess(roomCode);
  if (!access.ok) return access.response;

  // Rate limiting on chat: max 30 messages per 60 seconds per user (key = userId + roomCode)
  const rl = await checkRateLimit(
    `chat:${access.session.userId}:${roomCode}`,
    { max: 30, windowSeconds: 60 }
  );
  if (!rl.allowed) {
    return NextResponse.json(
      {
        error: "too_many_requests",
        message: `Trop de messages. Réessayez dans ${rl.retryAfterSeconds}s.`,
      },
      { status: 429 }
    );
  }

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = messagePostSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Requirement 2.2: sender comes strictly from access.role
  const [row] = await db
    .insert(consultationMessages)
    .values({
      consultationId: access.consultation.id,
      sender: access.role,
      content: parsed.data.content,
    })
    .returning();

  return NextResponse.json({ message: row });
}
