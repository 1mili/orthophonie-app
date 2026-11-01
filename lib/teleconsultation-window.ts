export const TELECONSULTATION_WINDOW_BEFORE_MINUTES = 10;
export const TELECONSULTATION_WINDOW_AFTER_MINUTES = 60;

export type TeleconsultationWindowStatus = {
  joinable: boolean;
  reason: "ok" | "not_tele" | "closed" | "before" | "after";
  labelFr: string;
  labelAr: string;
};

/**
 * Appointment date and time are stored as strings in the DB:
 *  - dateStr: "YYYY-MM-DD"
 *  - timeStr: "HH:mm"
 * These represent local consultation times in Tunisia (Africa/Tunis).
 * Tunisia operates on UTC+1 (Central European Time) year-round without Daylight Saving Time.
 * 
 * By constructing the ISO 8601 string `${dateStr}T${timeStr}:00+01:00`, Date.parse()
 * yields the exact UTC timestamp regardless of the host server's local timezone.
 * We then compare it against Date.now() in UTC milliseconds.
 */
export function getTeleconsultationWindowStatus(
  dateStr: string, // YYYY-MM-DD
  timeStr: string, // HH:mm
  status?: string, // scheduled | ongoing | completed | cancelled
  mode?: string, // teleconsultation | cabinet
  userRole?: "admin" | "parent"
): TeleconsultationWindowStatus {
  // Admin is never subject to the time window
  if (userRole === "admin") {
    if (status === "completed" || status === "cancelled") {
      return {
        joinable: false,
        reason: "closed",
        labelFr: "Séance terminée · Salle fermée",
        labelAr: "انتهت الجلسة · القاعة مغلقة",
      };
    }
    return {
      joinable: true,
      reason: "ok",
      labelFr: "Rejoindre la séance (Praticien)",
      labelAr: "دخول القاعة (الأخصائي)",
    };
  }

  if (mode && mode !== "teleconsultation") {
    return {
      joinable: false,
      reason: "not_tele",
      labelFr: "Consultation en cabinet",
      labelAr: "في العيادة",
    };
  }

  if (status === "completed" || status === "cancelled") {
    return {
      joinable: false,
      reason: "closed",
      labelFr: "Séance terminée · Salle fermée",
      labelAr: "انتهت الجلسة · القاعة مغلقة",
    };
  }

  // Parse using Africa/Tunis offset (+01:00)
  const isoTunisString = `${dateStr.trim()}T${timeStr.trim()}:00+01:00`;
  const scheduledTimeMs = Date.parse(isoTunisString);

  if (isNaN(scheduledTimeMs)) {
    return {
      joinable: false,
      reason: "closed",
      labelFr: "Horaire indisponible",
      labelAr: "الموعد غير متوفر",
    };
  }

  const nowMs = Date.now();
  const diffMinutes = (nowMs - scheduledTimeMs) / (1000 * 60);

  if (diffMinutes < -TELECONSULTATION_WINDOW_BEFORE_MINUTES) {
    return {
      joinable: false,
      reason: "before",
      labelFr: `Disponible ${TELECONSULTATION_WINDOW_BEFORE_MINUTES} min avant la séance`,
      labelAr: `متاح قبل ${TELECONSULTATION_WINDOW_BEFORE_MINUTES} دقائق من الموعد`,
    };
  }

  if (diffMinutes > TELECONSULTATION_WINDOW_AFTER_MINUTES) {
    return {
      joinable: false,
      reason: "after",
      labelFr: "Séance expirée · Salle fermée",
      labelAr: "انتهى وقت الجلسة · القاعة مغلقة",
    };
  }

  return {
    joinable: true,
    reason: "ok",
    labelFr: "Rejoindre la séance en vidéo (1-clic)",
    labelAr: "دخول فوري للاستشارة المرئية",
  };
}
