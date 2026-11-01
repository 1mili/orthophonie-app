import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";
import { sendConfirmationEmail, sendConfirmationSms } from "@/lib/notifications";

/**
 * Sends a reminder for every appointment scheduled for tomorrow that hasn't
 * had one sent yet. Designed to be triggered once a day by an external
 * scheduler (Vercel Cron, a system crontab, GitHub Actions, etc.) hitting:
 *
 *   GET /api/cron/reminders
 *   Authorization: Bearer <CRON_SECRET>
 *
 * This sandboxed dev environment has no scheduler running, so this route
 * exists but is never triggered automatically here — wire it up at deploy time.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;

  // Strict cron authentication: CRON_SECRET must be set and matched
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().slice(0, 10);

  const due = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.date, dateStr), isNull(appointments.reminderSentAt)));

  let sent = 0;
  for (const a of due) {
    await Promise.all([
      sendConfirmationEmail({
        to: a.email,
        parentName: a.parentName,
        date: a.date,
        time: a.time,
        service: `Rappel — ${a.service}`,
      }),
      sendConfirmationSms({ to: a.phone, date: a.date, time: a.time }),
    ]);
    await db
      .update(appointments)
      .set({ reminderSentAt: new Date() })
      .where(eq(appointments.id, a.id));
    sent++;
  }

  return NextResponse.json({ checked: due.length, sent });
}
