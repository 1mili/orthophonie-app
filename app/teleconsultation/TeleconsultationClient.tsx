"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Send,
  Paperclip,
  FileText,
  Monitor,
  MonitorOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  BookOpen,
  MessageSquare,
  Smile,
  Volume2,
  RotateCcw,
} from "lucide-react";
import { Waveform, WaveDivider } from "@/components/Waveform";
import type { Locale } from "@/lib/i18n";

type Role = "parent" | "orthophoniste";

interface ChatMessage {
  id: string;
  sender: Role;
  name: string;
  content: string;
  time: string;
}

interface SharedDocument {
  id: string;
  title: string;
  type: "exercise" | "pdf" | "image";
  size: string;
  date: string;
}

interface TeleconsultationClientProps {
  locale: Locale;
  initialRole?: Role;
  userFullName?: string;
}

export function TeleconsultationClient({
  locale,
  initialRole = "parent",
  userFullName = "Parent",
}: TeleconsultationClientProps) {
  const isAr = locale === "ar";

  // Navigation states
  const [inCall, setInCall] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "exercises" | "docs" | "notes">("chat");

  // Media states
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const camOn = videoEnabled;
  const micOn = audioEnabled;
  const [screenSharing, setScreenSharing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Call duration
  const [callDuration, setCallDuration] = useState(0);

  // Selected exercise for projection
  const [activeExercise, setActiveExercise] = useState<string | null>(null);

  // Room code input
  const [roomInput, setRoomInput] = useState("");

  // Refs for media
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const localCallVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "orthophoniste",
      name: isAr ? "الأخصائية سارة" : "Mme Sarra (Orthophoniste)",
      content: isAr
        ? "مرحبًا بكم في جلسة تقويم النطق عن بُعد! هل الصوت والصورة واضحان لديكم؟"
        : "Bonjour et bienvenue à cette séance de téléconsultation ! M'entendez-vous et me voyez-vous bien ?",
      time: "10:00",
    },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Documents state
  const [documents, setDocuments] = useState<SharedDocument[]>([
    {
      id: "doc-1",
      title: isAr ? "بطاقات صورية - مخارج الحروف (س / ش / ر)" : "Imagier d'articulation — Phonèmes [s], [ch], [r]",
      type: "exercise",
      size: "1.4 Mo",
      date: "Aujourd'hui",
    },
    {
      id: "doc-2",
      title: isAr ? "تمرين التمييز السمعي والوعي الصوتي" : "Fiche de discrimination phonologique (P/B, T/D)",
      type: "pdf",
      size: "820 Ko",
      date: "Aujourd'hui",
    },
    {
      id: "doc-3",
      title: isAr ? "تمارين التنفس وحركات اللسان والشفتين" : "Exercice de souffle et praxies bucco-faciales",
      type: "exercise",
      size: "2.1 Mo",
      date: "Aujourd'hui",
    },
  ]);

  // Notes state
  const [sessionNotes, setSessionNotes] = useState(
    isAr
      ? "ملاحظات الجلسة: تفاعل إيجابي للطفل، تحسن ملحوظ في نطق حرف السين، مواصلة تمارين النفخ."
      : "Notes de la séance : Très bon engagement de l'enfant. Amélioration nette sur la tenue du son [s]. Continuer les praxies à la maison."
  );

  // Translations
  const t = {
    badge: isAr ? "العيادة الرقمية" : "Plateforme Médicale Sécurisée",
    title: isAr ? "فضاء الاستشارة عن بُعد" : "Téléconsultation Orthophonique",
    subtitle: isAr
      ? "جلسات فردية تفاعلية بتقنية الفيديو عالي الدقة ومشاركة الأنشطة التربوية من المنزل."
      : "Séances d'orthophonie interactives en visio HD, avec partage d'exercices et accompagnement parental sur mesure.",
    preCallTitle: isAr ? "التحضير قبل بدء الجلسة" : "Préparation avant la séance",
    preCallDesc: isAr
      ? "تحقق من الكاميرا والميكروفون لضمان أفضل تجربة لطفلك."
      : "Vérifiez votre caméra et votre micro pour offrir la meilleure expérience à votre enfant.",
    camActive: isAr ? "الكاميرا تعمل" : "Caméra active",
    camDisabled: isAr ? "الكاميرا متوقفة" : "Caméra désactivée",
    micActive: isAr ? "الميكروفون يلتقط الصوت" : "Microphone actif",
    micDisabled: isAr ? "الميكروفون مكتوم" : "Microphone muet",
    testVoicePrompt: isAr ? "تحدث لاختبار مستوى الصوت" : "Parlez pour tester le niveau sonore",
    startCall: isAr ? "بدء الجلسة الآن" : "Démarrer la séance en direct",
    roomCodePlaceholder: isAr ? "رمز الجلسة (اختياري)..." : "Code de consultation (optionnel)...",
    joinWithCode: isAr ? "انضمام برمز" : "Rejoindre",
    checklistTitle: isAr ? "إرشادات الجلسة الناجحة" : "Conseils pour une séance réussie",
    check1: isAr ? "إضاءة جيدة تُظهر وجه وفم الطفل بوضوح" : "Éclairage direct sur le visage de l'enfant pour observer l'articulation",
    check2: isAr ? "مكان هادئ بدون مشتتات أو شاشات أخرى" : "Environnement calme sans télévision ni bruits parasites",
    check3: isAr ? "استخدام سماعات رأس أو مكبر صوت مناسب" : "Casque ou haut-parleur adapté pour une écoute confortable",
    check4: isAr ? "حضور أحد الوالدين لتشجيع الطفل ومرافقته" : "Présence bienveillante d'un parent pour accompagner l'enfant",
    inCallBadge: isAr ? "جلسة جارية · اتصال مشفر WebRTC" : "Séance en direct · Chiffrement WebRTC E2E",
    remoteDoctorName: isAr ? "الأخصائية سارة بن عمار" : "Mme Sarra Ben Ammar (Orthophoniste)",
    childSpeaking: isAr ? "الطفل يتحدث الآن" : "Enfant connecté",
    hangup: isAr ? "إنهاء الجلسة" : "Quitter la séance",
    screenShare: isAr ? "مشاركة الشاشة" : "Partager l'écran",
    screenSharing: isAr ? "إيقاف المشاركة" : "Arrêter le partage",
    chatTab: isAr ? "المحادثة" : "Chat direct",
    exercisesTab: isAr ? "التمارين" : "Exercices",
    docsTab: isAr ? "الملفات" : "Documents",
    notesTab: isAr ? "الملاحظات" : "Notes de suivi",
    chatPlaceholder: isAr ? "اكتب رسالة هنا..." : "Écrire un message pour la séance...",
    send: isAr ? "إرسال" : "Envoyer",
    quickFeedback: isAr ? "عبارات تشجيع سريعة :" : "Encouragements rapides :",
    quick1: isAr ? "ممتاز جداً ! 🌟" : "Bravo, c'est super ! 🌟",
    quick2: isAr ? "انظر إلى حركة شفتي 👄" : "Regarde bien ma bouche 👄",
    quick3: isAr ? "كرر بهدوء وببطء 🐢" : "Répète doucement 🐢",
    quick4: isAr ? "نفس عميق ثم انطق 💨" : "Grand souffle d'abord 💨",
    launchExercise: isAr ? "عرض التمرين على الشاشة" : "Projeter l'exercice",
    closeExercise: isAr ? "إغلاق العرض" : "Fermer l'exercice",
    uploadDoc: isAr ? "إضافة ملف" : "Ajouter un fichier",
    backToPrep: isAr ? "العودة إلى الإعدادات" : "Retour aux réglages",
  };

  // ─── Initialize User Media ────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    try {
      setMediaError(null);
      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setMediaError(
          isAr
            ? "المتصفح لا يدعم الوصول المباشر إلى الكاميرا والميكروفون."
            : "Périphérique média non supporté par ce navigateur."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true,
      });

      localStreamRef.current = stream;

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }
      if (localCallVideoRef.current) {
        localCallVideoRef.current.srcObject = stream;
      }
      setVideoEnabled(true);
      setAudioEnabled(true);

      // Audio analysis for volume level meter
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkAudio = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      } catch {
        // AudioContext not supported or restricted — ignore silently
      }
    } catch (err) {
      console.warn("Camera/mic access error:", err);
      // Fallback: try audio-only if camera is unavailable or denied
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        localStreamRef.current = audioStream;
        setVideoEnabled(false);
        setAudioEnabled(true);
        setMediaError(
          isAr
            ? "تم تفعيل الميكروفون فقط (الكاميرا غير متاحة أو تم رفض الإذن)."
            : "Microphone activé seul (caméra indisponible ou refusée)."
        );
      } catch (audioErr) {
        console.warn("Complete media access denied:", audioErr);
        setVideoEnabled(false);
        setAudioEnabled(false);
        setMediaError(
          isAr
            ? "تعذر الوصول إلى الكاميرا أو الميكروفون. يرجى السماح بالإذن في المتصفح للمتابعة."
            : "Veuillez autoriser l'accès à la caméra et au microphone pour continuer."
        );
      }
    }
  }, [isAr]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void startCamera();
    }, 0);

    return () => {
      clearTimeout(timer);
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
      screenStreamRef.current?.getTracks().forEach((track) => track.stop());
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [startCamera]);

  // Connect local stream to video ref when transitioning to inCall
  useEffect(() => {
    if (inCall && localStreamRef.current && localCallVideoRef.current) {
      localCallVideoRef.current.srcObject = localStreamRef.current;
    }
  }, [inCall]);

  // Call timer
  useEffect(() => {
    if (!inCall) return;
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [inCall]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Controls
  function toggleMic() {
    const next = !audioEnabled;
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = next;
      });
    }
    setAudioEnabled(next);
  }

  function toggleCam() {
    const next = !videoEnabled;
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = next;
      });
    }
    setVideoEnabled(next);
  }

  async function toggleScreenShare() {
    if (screenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      if (localCallVideoRef.current && localStreamRef.current) {
        localCallVideoRef.current.srcObject = localStreamRef.current;
      }
      setScreenSharing(false);
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = displayStream;
        if (localCallVideoRef.current) {
          localCallVideoRef.current.srcObject = displayStream;
        }
        displayStream.getVideoTracks()[0].onended = () => {
          setScreenSharing(false);
          screenStreamRef.current = null;
          if (localCallVideoRef.current && localStreamRef.current) {
            localCallVideoRef.current.srcObject = localStreamRef.current;
          }
        };
        setScreenSharing(true);
      } catch {
        // User cancelled picker
      }
    }
  }

  function handleStartCall() {
    setInCall(true);
    setCallDuration(0);
  }

  function handleHangUp() {
    setInCall(false);
    setScreenSharing(false);
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current = null;
  }

  const handleSendMessage = useCallback(
    (contentToSend?: string) => {
      const txt = contentToSend || messageInput.trim();
      if (!txt) return;

      const newMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sender: initialRole,
        name: userFullName,
        content: txt,
        time: new Date().toLocaleTimeString(isAr ? "ar-TN" : "fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, newMsg]);
      if (!contentToSend) setMessageInput("");

      setTimeout(() => {
        chatScrollRef.current?.scrollTo({
          top: chatScrollRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    },
    [initialRole, isAr, messageInput, userFullName]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const newDoc: SharedDocument = {
        id: `doc-${crypto.randomUUID()}`,
        title: file.name,
        type: file.type.includes("pdf") ? "pdf" : "image",
        size: `${Math.round(file.size / 1024)} Ko`,
        date: isAr ? "الآن" : "À l'instant",
      };

      setDocuments((prev) => [newDoc, ...prev]);

      handleSendMessage(
        isAr
          ? `📎 تمت مشاركة ملف جديد: ${file.name}`
          : `📎 Document partagé pour la séance : ${file.name}`
      );
    },
    [handleSendMessage, isAr]
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage-deep">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t.badge}
            </span>
            {inCall && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-coral/10 px-3 py-1 font-mono-num text-xs font-semibold text-coral">
                <Clock className="h-3.5 w-3.5" />
                {formatTimer(callDuration)}
              </span>
            )}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">
            {t.title}
          </h1>
          <p className="mt-1 text-sm text-ink/65">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/espace-parent/teleconsultations"
            className="rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-ink/70 hover:border-ink/30"
          >
            {isAr ? "مواعيدي القادمة" : "Mes téléconsultations"}
          </Link>
          <Link
            href="/rdv"
            className="rounded-full bg-coral px-5 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-95"
          >
            {isAr ? "حجز موعد جديد" : "Prendre RDV"}
          </Link>
        </div>
      </div>

      {/* Main Body: Either Pre-call Check OR In-call Virtual Room */}
      {!inCall ? (
        /* ══════════════════════════════════════════════════════════════════
           1. SECTION DE PRÉPARATION AVANT L'APPEL (Vérification Caméra/Micro)
           ══════════════════════════════════════════════════════════════════ */
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left: Video Preview & Hardware Meters */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold text-ink">
                    {t.preCallTitle}
                  </h2>
                  <span className="flex items-center gap-1.5 text-xs text-sage-deep">
                    <CheckCircle2 className="h-4 w-4" />
                    WebRTC Ready
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink/60">{t.preCallDesc}</p>

                {/* Video Monitor */}
                <div className="relative mt-5 aspect-video overflow-hidden rounded-2xl bg-ink">
                  <video
                    ref={previewVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`h-full w-full object-cover transition-opacity duration-300 ${
                      camOn ? "opacity-100" : "opacity-0"
                    }`}
                  />

                  {!camOn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-paper-warm to-white p-6 text-ink">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-coral/10 text-coral shadow-inner">
                        <VideoOff className="h-10 w-10 text-coral" />
                      </div>
                      <div className="text-center">
                        <div className="font-display text-base font-semibold text-ink">
                          {userFullName}
                        </div>
                        <p className="mt-1 text-xs text-ink/50">
                          {t.camDisabled}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Overlaid status tags */}
                  <div className="absolute start-4 top-4 flex items-center gap-2">
                    <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      {camOn ? t.camActive : t.camDisabled}
                    </span>
                  </div>

                  {/* Floating test controls */}
                  <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-transform hover:scale-105 ${
                        micOn
                          ? "border-white/30 bg-white/90 text-ink backdrop-blur"
                          : "border-coral bg-coral text-white"
                      }`}
                      aria-label="Toggle Microphone"
                    >
                      {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={toggleCam}
                      className={`flex h-12 w-12 items-center justify-center rounded-full border shadow-lg transition-transform hover:scale-105 ${
                        camOn
                          ? "border-white/30 bg-white/90 text-ink backdrop-blur"
                          : "border-coral bg-coral text-white"
                      }`}
                      aria-label="Toggle Camera"
                    >
                      {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {mediaError && (
                  <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-coral/30 bg-coral/10 p-3.5 text-xs text-coral">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{mediaError}</span>
                  </div>
                )}

                {/* Audio Level Meter */}
                <div className="mt-5 rounded-2xl border border-line bg-paper-warm p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-ink/75">
                      <Volume2 className="h-4 w-4 text-coral" />
                      {micOn ? t.micActive : t.micDisabled}
                    </span>
                    <span className="font-mono-num text-ink/50">{audioLevel}%</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className="h-full rounded-full bg-coral transition-all duration-75"
                      style={{ width: micOn ? `${audioLevel}%` : "0%" }}
                    />
                  </div>
                  <p className="mt-2 text-center text-[11px] text-ink/50">
                    {t.testVoicePrompt}
                  </p>
                </div>
              </div>

              {/* Action: Enter Virtual Room */}
              <div className="border-t border-line bg-paper-warm/50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value)}
                      placeholder={t.roomCodePlaceholder}
                      className="w-full rounded-full border border-line bg-white px-4 py-3 text-xs outline-none focus:border-coral sm:max-w-xs"
                    />
                    {roomInput.trim() && (
                      <Link
                        href={`/teleconsultation/${encodeURIComponent(roomInput.trim())}`}
                        className="rounded-full border border-line bg-white px-4 py-3 text-xs font-semibold text-ink/75 hover:border-coral hover:text-coral"
                      >
                        {t.joinWithCode}
                      </Link>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleStartCall}
                    className="flex items-center justify-center gap-2 rounded-full bg-coral px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:brightness-95 hover:shadow-lg"
                  >
                    <span>{t.startCall}</span>
                    <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Checklist & Clinical Guidance */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-5">
            <div className="rounded-3xl border border-line bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-coral" />
                <h3 className="font-display text-base font-semibold text-ink">
                  {t.checklistTitle}
                </h3>
              </div>
              <ul className="mt-5 space-y-4 text-xs leading-relaxed text-ink/75">
                {[t.check1, t.check2, t.check3, t.check4].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage/15 text-sage-deep">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Demo Exercises Preview */}
            <div className="rounded-3xl border border-line bg-paper-warm p-6">
              <h4 className="font-display text-sm font-semibold text-ink">
                {isAr ? "الأدوات البيداغوجية المدمجة" : "Supports pédagogiques inclus"}
              </h4>
              <p className="mt-1 text-xs text-ink/60">
                {isAr
                  ? "تتضمن الجلسة إمكانية فتح بطاقات تفاعلية لتمرين مخارج الحروف مع الطفل مباشرة."
                  : "Durant la séance, l'orthophoniste projette des imagiers et jeux interactifs pour stimuler la communication."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs text-ink/70">
                  🗂️ {isAr ? "بطاقات صورية" : "Imagier sons"}
                </span>
                <span className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs text-ink/70">
                  🎲 {isAr ? "ألعاب التمييز" : "Loto phonétique"}
                </span>
                <span className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs text-ink/70">
                  ⏳ {isAr ? "تمارين التنفس" : "Praxies & Souffle"}
                </span>
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 text-xs text-ink/60">
              <ShieldCheck className="h-6 w-6 text-sage shrink-0" />
              <span>
                {isAr
                  ? "الجلسة محمية ببروتوكول WebRTC مشفر بالكامل ولا يتم تسجيل الفيديو دون موافقة مسبقة."
                  : "Consultation 100% conforme RGPD et secret médical. Flux chiffré de bout en bout."}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════
           2 & 3. SALLE VIRTUELLE + VISIOCONFÉRENCE WEBRTC + CHAT & EXERCICES
           ══════════════════════════════════════════════════════════════════ */
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Main Video Conference Area */}
          <div className="lg:col-span-8">
            <div className="relative aspect-video overflow-hidden rounded-3xl border border-line bg-ink shadow-lg">
              {/* Remote Participant Screen (Orthophoniste / Patient) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                {activeExercise ? (
                  /* Projected Exercise on Main Screen */
                  <div className="relative flex h-full w-full flex-col items-center justify-center rounded-2xl bg-paper p-6 text-ink">
                    <button
                      type="button"
                      onClick={() => setActiveExercise(null)}
                      className="absolute end-4 top-4 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-coral hover:bg-coral hover:text-white"
                    >
                      {t.closeExercise} ✕
                    </button>
                    <span className="text-4xl">🗂️</span>
                    <h3 className="mt-3 font-display text-xl font-bold">
                      {isAr ? "تمرين نطق حرف السين [S]" : "Exercice : Discrimination du phonème [S]"}
                    </h3>
                    <p className="mt-2 max-w-md text-xs text-ink/65">
                      {isAr
                        ? "اطلب من الطفل تسمية الصور التالية مع التركيز على تصفير الأسنان : سَمَكَة - سَيَّارَة - شَمْس."
                        : "Répétez ensemble les mots cibles : Soleil ☀️, Serpent 🐍, Sourire 😊. L'air doit glisser au milieu des dents."}
                    </p>
                    <div className="mt-4 flex gap-4">
                      {["☀️ Soleil", "🐍 Serpent", "🥣 Soupe"].map((w, i) => (
                        <div
                          key={i}
                          className="rounded-xl border border-line bg-white px-4 py-2 font-display text-sm font-semibold shadow-sm"
                        >
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Standard Doctor / Patient View Simulation */
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-sage-deep/80 text-white shadow-xl">
                      <Waveform animated className="h-10 text-white" />
                      <span className="absolute -bottom-1 -end-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                        ✓
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="font-display text-lg font-semibold text-white">
                        {t.remoteDoctorName}
                      </h3>
                      <p className="text-xs text-white/60">{t.childSpeaking}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Banner inside Call */}
              <div className="absolute inset-x-4 top-4 flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  {t.inCallBadge}
                </span>
                <span className="rounded-full bg-black/50 px-3 py-1 font-mono-num backdrop-blur">
                  {formatTimer(callDuration)}
                </span>
              </div>

              {/* Local Video Thumbnail (PiP) */}
              <div className="absolute bottom-20 end-4 h-28 w-44 overflow-hidden rounded-2xl border-2 border-white/30 bg-ink shadow-2xl transition hover:scale-105">
                <video
                  ref={localCallVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover ${camOn ? "opacity-100" : "opacity-0"}`}
                />
                {!camOn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-paper-warm p-2 text-ink">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-coral/10 text-coral shadow-sm">
                      <VideoOff className="h-5 w-5 text-coral" />
                    </div>
                    <span className="max-w-full truncate px-1 text-[10px] font-semibold text-ink/75">
                      {userFullName}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-1.5 start-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
                  {userFullName}
                </div>
              </div>

              {/* Interactive Call Controls Bar */}
              <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-3 px-4">
                <div className="flex items-center gap-3 rounded-full border border-white/15 bg-black/60 p-2 shadow-2xl backdrop-blur-md">
                  <button
                    type="button"
                    onClick={toggleMic}
                    title={micOn ? "Couper le micro" : "Activer le micro"}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                      micOn
                        ? "border border-white/20 bg-white/20 text-white hover:bg-white/30"
                        : "bg-coral text-white"
                    }`}
                  >
                    {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleCam}
                    title={camOn ? "Couper la caméra" : "Activer la caméra"}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                      camOn
                        ? "border border-white/20 bg-white/20 text-white hover:bg-white/30"
                        : "bg-coral text-white"
                    }`}
                  >
                    {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleScreenShare}
                    title={screenSharing ? t.screenSharing : t.screenShare}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                      screenSharing
                        ? "bg-sage text-white"
                        : "border border-white/20 bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    {screenSharing ? (
                      <MonitorOff className="h-5 w-5" />
                    ) : (
                      <Monitor className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveExercise("demo")}
                    title={t.launchExercise}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                      activeExercise
                        ? "bg-marigold text-white"
                        : "border border-white/20 bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    <BookOpen className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    onClick={handleHangUp}
                    title={t.hangup}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition hover:bg-red-700 hover:scale-105"
                  >
                    <PhoneOff className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Helper below Video */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4">
              <div className="flex items-center gap-2 text-xs text-ink/70">
                <Smile className="h-4 w-4 text-marigold" />
                <span>{t.quickFeedback}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[t.quick1, t.quick2, t.quick3, t.quick4].map((phrase, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(phrase)}
                    className="rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink/75 transition hover:border-coral hover:text-coral"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Chat, Exercises, Docs & Notes */}
          <div className="flex flex-col lg:col-span-4">
            <div className="flex h-[620px] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm">
              {/* Tab Navigation */}
              <div className="flex border-b border-line bg-paper-warm/60 p-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                    activeTab === "chat"
                      ? "bg-white text-coral shadow-sm"
                      : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {t.chatTab}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("exercises")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                    activeTab === "exercises"
                      ? "bg-white text-coral shadow-sm"
                      : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  {t.exercisesTab}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("docs")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                    activeTab === "docs"
                      ? "bg-white text-coral shadow-sm"
                      : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  {t.docsTab}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                    activeTab === "notes"
                      ? "bg-white text-coral shadow-sm"
                      : "text-ink/60 hover:text-ink"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {t.notesTab}
                </button>
              </div>

              {/* Tab Content 1: Live Chat */}
              {activeTab === "chat" && (
                <div className="flex flex-1 flex-col justify-between overflow-hidden p-4">
                  <div
                    ref={chatScrollRef}
                    className="flex-1 space-y-3 overflow-y-auto pe-1 text-xs"
                  >
                    {messages.map((m) => {
                      const isMe = m.sender === initialRole;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div className="mb-1 flex items-center gap-1.5 text-[10px] text-ink/45">
                            <span>{m.name}</span>
                            <span>·</span>
                            <span>{m.time}</span>
                          </div>
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed ${
                              isMe
                                ? "bg-coral text-white rounded-ee-none"
                                : "border border-line bg-paper-warm text-ink rounded-es-none"
                            }`}
                          >
                            {m.content}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="mt-3 flex items-center gap-2 border-t border-line pt-3"
                  >
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder={t.chatPlaceholder}
                      className="flex-1 rounded-full border border-line bg-paper-warm px-4 py-2.5 text-xs outline-none focus:border-coral"
                    />
                    <button
                      type="submit"
                      disabled={!messageInput.trim()}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white transition hover:brightness-95 disabled:opacity-40"
                    >
                      <Send className="h-4 w-4 rtl:rotate-180" />
                    </button>
                  </form>
                </div>
              )}

              {/* Tab Content 2: Exercises Library */}
              {activeTab === "exercises" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <p className="text-xs text-ink/60">
                    {isAr
                      ? "اختر تمريناً لعرضه على شاشة الفيديو أمام الطفل مباشرة :"
                      : "Cliquez sur un exercice pour le projeter sur l'écran partagé :"}
                  </p>

                  {[
                    {
                      id: "ex-1",
                      title: isAr ? "1. مخارج حروف الصفير (س - ز - ص)" : "1. Sons de sifflement : S / Z / CH",
                      desc: isAr ? "تمييز صوت الصفير وتكرار الكلمات المصورة" : "Repérage phonétique et répétition ludique",
                      icon: "🐍",
                    },
                    {
                      id: "ex-2",
                      title: isAr ? "2. حركات اللسان وتقوية عضلات النطق" : "2. Gymnastique linguale & Praxies",
                      desc: isAr ? "حركات الفم ومرونة عضلات اللسان والشفتين" : "Musculation linguale et mobilité labiale",
                      icon: "👅",
                    },
                    {
                      id: "ex-3",
                      title: isAr ? "3. تمييز الأصوات المتقاربة (ب / ت / د)" : "3. Paires minimales : B vs P, D vs T",
                      desc: isAr ? "بطاقات صورية للمقارنة بين الكلمات المتشابهة" : "Écoute attentive pour différencier les sons proches",
                      icon: "👂",
                    },
                    {
                      id: "ex-4",
                      title: isAr ? "4. تمرين التحكم في التنفس والزفير" : "4. Exercice de souffle & fluidité",
                      desc: isAr ? "إطالة النفس والتحكم في إيقاع التكلم" : "Contrôle du débit expiratoire et gestion du bégaiement",
                      icon: "💨",
                    },
                  ].map((ex) => (
                    <div
                      key={ex.id}
                      onClick={() => setActiveExercise(ex.id)}
                      className={`cursor-pointer rounded-2xl border p-3.5 transition hover:border-coral ${
                        activeExercise === ex.id
                          ? "border-coral bg-coral/5"
                          : "border-line bg-paper-warm"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{ex.icon}</span>
                        <div className="flex-1">
                          <h4 className="text-xs font-semibold text-ink">{ex.title}</h4>
                          <p className="mt-1 text-[11px] text-ink/60">{ex.desc}</p>
                          <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-coral">
                            {t.launchExercise} →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab Content 3: Shared Documents */}
              {activeTab === "docs" && (
                <div className="flex flex-1 flex-col justify-between overflow-hidden p-4">
                  <div className="space-y-2.5 overflow-y-auto">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-xl border border-line bg-paper-warm p-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-coral shrink-0" />
                          <div>
                            <div className="font-semibold text-ink line-clamp-1">
                              {doc.title}
                            </div>
                            <div className="font-mono-num text-[10px] text-ink/45">
                              {doc.size} · {doc.date}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-full border border-dashed border-coral bg-coral/5 py-3 text-xs font-semibold text-coral hover:bg-coral/10">
                    <Paperclip className="h-4 w-4" />
                    <span>{t.uploadDoc}</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              )}

              {/* Tab Content 4: Notes */}
              {activeTab === "notes" && (
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div className="flex-1">
                    <p className="text-xs text-ink/60 mb-2">
                      {isAr
                        ? "ملاحظات سريرية حول تفاعل الطفل وتطور النطق :"
                        : "Observations cliniques sur l'évolution de la séance :"}
                    </p>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      rows={12}
                      className="w-full rounded-2xl border border-line bg-paper-warm p-3 text-xs leading-relaxed text-ink outline-none focus:border-coral"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleSendMessage(
                        isAr
                          ? `📝 تم حفظ ملاحظات الجلسة بنجاح.`
                          : `📝 Notes de consultation enregistrées au dossier.`
                      );
                    }}
                    className="mt-3 rounded-full bg-coral py-2.5 text-center text-xs font-semibold text-white hover:brightness-95"
                  >
                    {isAr ? "حفظ الملاحظات" : "Enregistrer les notes"}
                  </button>
                </div>
              )}
            </div>

            {/* Back button */}
            <button
              type="button"
              onClick={handleHangUp}
              className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-line bg-white py-2.5 text-xs font-semibold text-ink/65 hover:border-ink/30"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {t.backToPrep}
            </button>
          </div>
        </div>
      )}

      {/* Decorative Wave Divider at Bottom */}
      <div className="mt-16">
        <WaveDivider className="max-w-md mx-auto" />
      </div>
    </div>
  );
}
