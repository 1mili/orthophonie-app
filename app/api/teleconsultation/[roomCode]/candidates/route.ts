import { NextRequest, NextResponse } from "next/server";
import { eq, and, ne, gt } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { consultationCandidates } from "@/lib/db/schema";
import { assertRoomAccess } from "@/lib/teleconsultation-auth";

const candidatePostSchema = z.object({
  candidate: z.string().min(1, "Candidate cannot be empty").max(10_000, "Candidate too large"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  const { roomCode } = await params;
  const access = await assertRoomAccess(roomCode);
  if (!access.ok) return access.response;

  const url = new URL(req.url);
  const sinceParam = Number(url.searchParams.get("since") ?? 0);
  const since = !isNaN(sinceParam) && sinceParam >= 0 ? sinceParam : 0;

  // Requirement 2.2: sender role is derived from the server session, never trusted from client
  const rows = await db
    .select()
    .from(consultationCandidates)
    .where(
      and(
        eq(consultationCandidates.consultationId, access.consultation.id),
        ne(consultationCandidates.sender, access.role),
        gt(consultationCandidates.id, since)
      )
    );

  return NextResponse.json({
    candidates: rows.map((r) => ({ id: r.id, candidate: r.candidate })),
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

  const parsed = candidatePostSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Requirement 2.2: sender comes strictly from access.role
  await db.insert(consultationCandidates).values({
    consultationId: access.consultation.id,
    sender: access.role,
    candidate: parsed.data.candidate,
  });

  return NextResponse.json({ ok: true });
}
