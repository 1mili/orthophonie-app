import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { consultations, appointments } from "@/lib/db/schema";
import { getSession, type SessionPayload } from "@/lib/auth";

export type RoomRole = "orthophoniste" | "parent";

export type RoomAccessSuccess = {
  ok: true;
  session: SessionPayload;
  role: RoomRole;
  consultation: typeof consultations.$inferSelect;
  appointment: typeof appointments.$inferSelect;
};

export type RoomAccessFailure = {
  ok: false;
  response: NextResponse;
};

export type RoomAccessResult = RoomAccessSuccess | RoomAccessFailure;

/**
 * Validates session, consultation status, and participant authorization for a teleconsultation room.
 *
 * Rules:
 *  - Must have a valid session (401 if missing).
 *  - Consultation must exist (404 if not found).
 *  - Consultation must NOT be completed or cancelled (403 if closed, unless allowEnded is true).
 *  - Admin has role "orthophoniste".
 *  - Parent must own the associated appointment (403 if not owner). Role is "parent".
 */
export async function assertRoomAccess(
  roomCode: string,
  options?: { allowClosed?: boolean; allowEnded?: boolean }
): Promise<RoomAccessResult> {
  const session = await getSession();
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  const consultation = await db.query.consultations.findFirst({
    where: eq(consultations.roomCode, roomCode),
  });

  if (!consultation) {
    return {
      ok: false,
      response: NextResponse.json({ error: "not_found" }, { status: 404 }),
    };
  }

  const allowClosed = Boolean(options?.allowClosed ?? options?.allowEnded);

  if (
    !allowClosed &&
    (consultation.status === "completed" || consultation.status === "cancelled")
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "consultation_closed", status: consultation.status },
        { status: 403 }
      ),
    };
  }

  const appointment = await db.query.appointments.findFirst({
    where: eq(appointments.id, consultation.appointmentId),
  });

  if (!appointment) {
    return {
      ok: false,
      response: NextResponse.json({ error: "appointment_not_found" }, { status: 404 }),
    };
  }

  if (session.role === "admin") {
    return {
      ok: true,
      session,
      role: "orthophoniste",
      consultation,
      appointment,
    };
  }

  // Parent access: verify ownership
  const isOwner =
    appointment.parentId === session.userId ||
    Boolean(
      appointment.email &&
        appointment.email.trim().toLowerCase() === session.email.trim().toLowerCase()
    );

  if (!isOwner) {
    return {
      ok: false,
      response: NextResponse.json({ error: "forbidden" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    session,
    role: "parent",
    consultation,
    appointment,
  };
}
