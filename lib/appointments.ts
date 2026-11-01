import { db } from "@/lib/db";
import { appointments } from "@/lib/db/schema";

export type Appointment = typeof appointments.$inferSelect;

const OPEN_HOURS = {
  weekday: ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
  saturday: ["09:00", "10:00", "11:00"],
};

export type DaySlots = {
  date: string;
  weekdayLabel: string;
  dayNumber: string;
  monthLabel: string;
  slots: { time: string; available: boolean }[];
};

const WEEKDAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const MONTH_LABELS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
];

export async function saveAppointment(
  data: Omit<typeof appointments.$inferInsert, "id" | "createdAt">
): Promise<Appointment> {
  const [row] = await db.insert(appointments).values(data).returning();
  return row;
}

export async function getAvailability(daysAhead = 14): Promise<DaySlots[]> {
  const allAppointments = await db.select().from(appointments);
  const bookedByDate = new Map<string, Set<string>>();
  for (const a of allAppointments) {
    if (!bookedByDate.has(a.date)) bookedByDate.set(a.date, new Set());
    bookedByDate.get(a.date)!.add(a.time);
  }

  const result: DaySlots[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= daysAhead; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dow = d.getDay();
    if (dow === 0) continue;

    const dateStr = d.toISOString().slice(0, 10);
    const hours = dow === 6 ? OPEN_HOURS.saturday : OPEN_HOURS.weekday;
    const booked = bookedByDate.get(dateStr) ?? new Set();

    result.push({
      date: dateStr,
      weekdayLabel: WEEKDAY_LABELS[dow],
      dayNumber: String(d.getDate()),
      monthLabel: MONTH_LABELS[d.getMonth()],
      slots: hours.map((time) => ({ time, available: !booked.has(time) })),
    });
  }

  return result;
}
