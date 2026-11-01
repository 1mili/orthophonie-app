"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Video,
  Calendar,
  Search,
  FolderOpen,
  Clock,
  MapPin,
} from "lucide-react";

export type SessionRow = {
  id: number;
  date: string;
  time: string;
  childName: string;
  childAge?: string | null;
  parentName: string;
  phone: string;
  email: string;
  service: string;
  mode: string;
  parentId?: number | null;
  roomCode?: string | null;
  consultationStatus?: string | null;
};

export function OrthoSessionsTable({
  sessions,
  todayStr,
  isRtl = false,
}: {
  sessions: SessionRow[];
  todayStr: string;
  isRtl?: boolean;
}) {
  const [filterMode, setFilterMode] = useState<"all" | "today" | "tele" | "cabinet">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Filter by mode/day
      if (filterMode === "today" && s.date !== todayStr) return false;
      if (filterMode === "tele" && s.mode !== "teleconsultation") return false;
      if (filterMode === "cabinet" && s.mode === "teleconsultation") return false;

      // Filter by search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesChild = s.childName.toLowerCase().includes(query);
        const matchesParent = s.parentName.toLowerCase().includes(query);
        const matchesService = s.service.toLowerCase().includes(query);
        if (!matchesChild && !matchesParent && !matchesService) return false;
      }

      return true;
    });
  }, [sessions, filterMode, searchTerm, todayStr]);

  const countToday = sessions.filter((s) => s.date === todayStr).length;
  const countTele = sessions.filter((s) => s.mode === "teleconsultation").length;

  return (
    <div className="space-y-4">
      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills Pastel */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterMode("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filterMode === "all"
                ? "bg-[#2d6a4f] text-white shadow-xs"
                : "bg-white text-[#2d6a4f] border-2 border-[#d4ebd0] hover:bg-[#e8f5e5]"
            }`}
          >
            {isRtl ? `الكل (${sessions.length})` : `Toutes (${sessions.length})`}
          </button>

          <button
            onClick={() => setFilterMode("today")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filterMode === "today"
                ? "bg-[#e0684b] text-white shadow-xs"
                : "bg-[#fff3f0] text-[#e0684b] border-2 border-[#fcd5ce] hover:bg-[#fcd5ce]"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {isRtl ? `اليوم (${countToday})` : `Aujourd'hui (${countToday})`}
          </button>

          <button
            onClick={() => setFilterMode("tele")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filterMode === "tele"
                ? "bg-[#f8a98c] text-white shadow-xs"
                : "bg-[#fff3f0] text-[#e0684b] border-2 border-[#fcd5ce] hover:bg-[#fcd5ce]"
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            {isRtl ? `عن بُعد (${countTele})` : `Téléconsultations (${countTele})`}
          </button>

          <button
            onClick={() => setFilterMode("cabinet")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filterMode === "cabinet"
                ? "bg-[#2d6a4f] text-white shadow-xs"
                : "bg-[#e8f5e5] text-[#2d6a4f] border-2 border-[#d4ebd0] hover:bg-[#d4ebd0]"
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            {isRtl ? "في العيادة" : "En cabinet"}
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[220px]">
          <Search className="absolute start-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isRtl ? "بحث عن مريض أو جلسة..." : "Rechercher patient, enfant..."}
            className="w-full rounded-full border-2 border-[#d4ebd0] bg-white ps-9 pe-4 py-2 text-xs text-[#2d3748] placeholder:text-[#94a3b8] outline-none focus:border-[#f8a98c] focus:ring-1 focus:ring-[#f8a98c]"
          />
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto rounded-3xl border-2 border-[#d4ebd0] bg-white shadow-xs">
        <table className="w-full text-start text-xs">
          <thead className="border-b-2 border-[#d4ebd0] bg-[#e8f5e5] text-[11px] font-bold uppercase tracking-wider text-[#2d6a4f]">
            <tr>
              <th className="px-5 py-4">{isRtl ? "التاريخ والتوقيت" : "Date & Heure"}</th>
              <th className="px-5 py-4">{isRtl ? "الطفل" : "Enfant"}</th>
              <th className="px-5 py-4">{isRtl ? "الولي" : "Parent / Contact"}</th>
              <th className="px-5 py-4">{isRtl ? "نوع الجلسة" : "Service"}</th>
              <th className="px-5 py-4">{isRtl ? "طريقة الجلسة" : "Mode"}</th>
              <th className="px-5 py-4 text-end">{isRtl ? "إجراء سريع" : "Actions rapides"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2ede0]">
            {filteredSessions.map((s) => {
              const isToday = s.date === todayStr;
              const isTele = s.mode === "teleconsultation";

              return (
                <tr
                  key={s.id}
                  className={`transition hover:bg-[#f4faf2] ${
                    isToday ? "bg-[#fff3f0]/50" : ""
                  }`}
                >
                  {/* Date & Time */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isToday && (
                        <span className="flex h-2 w-2 rounded-full bg-[#f8a98c] animate-pulse" />
                      )}
                      <div>
                        <div className="font-bold font-mono-num text-[#2d3748]">
                          {s.date}
                        </div>
                        <div className="font-semibold text-[#64748b] font-mono-num">
                          {s.time}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Child */}
                  <td className="px-5 py-4">
                    <div className="font-bold text-[#2d3748]">{s.childName}</div>
                    {s.childAge && (
                      <span className="rounded-full bg-[#fef08a] px-2 py-0.5 text-[10px] font-bold text-[#713f12]">
                        {s.childAge}
                      </span>
                    )}
                  </td>

                  {/* Parent & Phone */}
                  <td className="px-5 py-4">
                    <div className="font-medium text-[#2d3748]">{s.parentName}</div>
                    <div className="text-[11px] text-[#64748b] font-mono-num">
                      {s.phone}
                    </div>
                  </td>

                  {/* Service */}
                  <td className="px-5 py-4">
                    <span className="font-medium text-[#2d3748]">{s.service}</span>
                  </td>

                  {/* Mode */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    {isTele ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff3f0] border-2 border-[#fcd5ce] px-2.5 py-1 text-[11px] font-bold text-[#e0684b]">
                        <Video className="h-3 w-3" />
                        {isRtl ? "عن بُعد" : "Téléconsultation"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f5e5] border-2 border-[#d4ebd0] px-2.5 py-1 text-[11px] font-bold text-[#2d6a4f]">
                        <MapPin className="h-3 w-3" />
                        {isRtl ? "في العيادة" : "En cabinet"}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-end whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {/* WebRTC Launch Button */}
                      {isTele && s.roomCode ? (
                        <Link
                          href={`/teleconsultation/${s.roomCode}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-[#f8a98c] px-3.5 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-[#e0684b] active:scale-95 transition"
                        >
                          <Video className="h-3.5 w-3.5" />
                          {isRtl ? "بدء WebRTC" : "Lancer WebRTC"}
                        </Link>
                      ) : null}

                      {/* Patient File Link */}
                      {s.parentId ? (
                        <Link
                          href={`/admin/patients/${s.parentId}`}
                          className="inline-flex items-center gap-1 rounded-full border-2 border-[#d4ebd0] bg-[#e8f5e5] px-3 py-1.5 text-[11px] font-bold text-[#2d6a4f] hover:bg-[#d4ebd0] transition"
                        >
                          <FolderOpen className="h-3.5 w-3.5" />
                          {isRtl ? "الملف" : "Dossier"}
                        </Link>
                      ) : (
                        <span className="text-[10px] text-[#94a3b8]">
                          {isRtl ? "زائر" : "Invité"}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredSessions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[#64748b]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Calendar className="h-8 w-8 text-[#94a3b8]" />
                    <p className="text-xs">
                      {isRtl
                        ? "لا توجد جلسات تطابق خيارات التصفية المحددة."
                        : "Aucune séance ne correspond aux critères sélectionnés."}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
