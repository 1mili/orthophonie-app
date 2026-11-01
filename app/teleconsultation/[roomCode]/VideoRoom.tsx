"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  RefreshCw,
  StickyNote,
} from "lucide-react";

type Role = "parent" | "orthophoniste";
type ChatMessage = { id: number; sender: Role; content: string; createdAt: string };
type Doc = { id: number; fileName: string; fileUrl: string; uploadedBy: string };
type ConnectionStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

const STUN_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];
const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function VideoRoom({
  roomCode,
  role,
  initialNotes = "",
}: {
  roomCode: string;
  role: Role;
  initialNotes?: string;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const lastCandidateId = useRef(0);
  const lastMessageId = useRef(0);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [draft, setDraft] = useState("");
  const [notes, setNotes] = useState(initialNotes);
  const [notesStatus, setNotesStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scheduleReconnectRef = useRef<() => void>(() => {});

  const otherRole: Role = role === "parent" ? "orthophoniste" : "parent";

  // ─── Peer Connection setup ────────────────────────────────────────────────
  const setupPeerConnection = useCallback(() => {
    // Close existing connection cleanly
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        fetch(`/api/teleconsultation/${roomCode}/candidates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sender: role, candidate: JSON.stringify(e.candidate) }),
        }).catch(() => {/* network error — ignore */});
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = e.streams[0];
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === "connected") {
        setConnectionStatus("connected");
        reconnectAttemptsRef.current = 0;
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      } else if (state === "failed" || state === "disconnected") {
        setConnectionStatus("disconnected");
        scheduleReconnectRef.current();
      }
    };

    pcRef.current = pc;
    return pc;
  }, [roomCode, role]);

  // ─── Auto-reconnect ───────────────────────────────────────────────────────
  const scheduleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setError("La connexion a été perdue. Veuillez rafraîchir la page.");
      return;
    }
    reconnectAttemptsRef.current += 1;
    setConnectionStatus("reconnecting");

    reconnectTimerRef.current = setTimeout(async () => {
      try {
        const pc = setupPeerConnection();
        const stream = localStreamRef.current;
        if (stream) {
          stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        }
        if (role === "parent") {
          const offer = await pc.createOffer({ iceRestart: true });
          await pc.setLocalDescription(offer);
          await fetch(`/api/teleconsultation/${roomCode}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "offer", sdp: offer.sdp }),
          });
        }
      } catch {
        setError("Impossible de se reconnecter. Vérifiez votre connexion internet.");
      }
    }, RECONNECT_DELAY_MS);
  }, [role, roomCode, setupPeerConnection]);

  useEffect(() => {
    scheduleReconnectRef.current = scheduleReconnect;
  }, [scheduleReconnect]);

  // ─── Initial media + signaling ────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = setupPeerConnection();
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        if (role === "parent") {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await fetch(`/api/teleconsultation/${roomCode}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "offer", sdp: offer.sdp }),
          });
        }
      } catch (err) {
        console.warn("Camera/mic access failed, attempting audio fallback:", err);
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          if (cancelled) return;
          localStreamRef.current = audioStream;
          setCamOn(false);
          const pc = setupPeerConnection();
          audioStream.getTracks().forEach((track) => pc.addTrack(track, audioStream));
        } catch {
          setError(
            "Impossible d'accéder à la caméra/micro. Vérifiez les permissions du navigateur."
          );
        }
      }
    }

    start();

    // Signaling polling
    const signalInterval = setInterval(async () => {
      const pc = pcRef.current;
      if (!pc) return;

      try {
        const res = await fetch(`/api/teleconsultation/${roomCode}`).then((r) => r.json());

        if (role === "orthophoniste" && res.offerSdp && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription({ type: "offer", sdp: res.offerSdp });
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await fetch(`/api/teleconsultation/${roomCode}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "answer", sdp: answer.sdp }),
          });
        }

        if (role === "parent" && res.answerSdp && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription({ type: "answer", sdp: res.answerSdp });
        }

        const candRes = await fetch(
          `/api/teleconsultation/${roomCode}/candidates?as=${role}&since=${lastCandidateId.current}`
        ).then((r) => r.json());

        for (const c of candRes.candidates ?? []) {
          lastCandidateId.current = Math.max(lastCandidateId.current, c.id);
          try {
            await pc.addIceCandidate(JSON.parse(c.candidate));
          } catch {
            // ignore invalid/late candidates
          }
        }
      } catch {
        // network error during signaling — will retry next interval
      }
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(signalInterval);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      pcRef.current?.close();
    };
  }, [roomCode, role, setupPeerConnection]);

  // ─── Chat + docs polling ──────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const chatRes = await fetch(
          `/api/teleconsultation/${roomCode}/messages?since=${lastMessageId.current}`
        ).then((r) => r.json());
        if (chatRes.messages?.length) {
          lastMessageId.current = Math.max(
            lastMessageId.current,
            ...chatRes.messages.map((m: ChatMessage) => m.id)
          );
          setMessages((prev) => [...prev, ...chatRes.messages]);
        }

        const docRes = await fetch(`/api/teleconsultation/${roomCode}/documents`).then((r) =>
          r.json()
        );
        if (docRes.documents) setDocs(docRes.documents);
      } catch {
        // polling error — ignore
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [roomCode]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Controls ────────────────────────────────────────────────────────────
  function toggleMic() {
    localStreamRef.current?.getAudioTracks().forEach((t) => (t.enabled = !micOn));
    setMicOn((v) => !v);
  }

  function toggleCam() {
    localStreamRef.current?.getVideoTracks().forEach((t) => (t.enabled = !camOn));
    setCamOn((v) => !v);
  }

  async function toggleScreenShare() {
    const pc = pcRef.current;
    if (!pc) return;

    if (screenSharing) {
      // Stop screen sharing — restore camera track
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;

      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(camTrack);
      }
      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      setScreenSharing(false);
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        screenStreamRef.current = displayStream;

        const screenTrack = displayStream.getVideoTracks()[0];
        const sender = pc.getSenders().find((s) => s.track?.kind === "video");
        if (sender) await sender.replaceTrack(screenTrack);

        // Show screen in local preview
        if (localVideoRef.current) {
          const previewStream = new MediaStream([screenTrack]);
          localVideoRef.current.srcObject = previewStream;
        }

        // Auto-stop when the OS native dialog is closed
        screenTrack.onended = () => {
          setScreenSharing(false);
          screenStreamRef.current = null;
          const camTrack = localStreamRef.current?.getVideoTracks()[0];
          if (camTrack) {
            const s = pc.getSenders().find((s) => s.track?.kind === "video");
            if (s) s.replaceTrack(camTrack).catch(() => {/* ignore */});
          }
          if (localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
        };

        setScreenSharing(true);
      } catch {
        // User cancelled screen selection — ignore
      }
    }
  }

  async function sendMessage() {
    if (!draft.trim()) return;
    try {
      const res = await fetch(`/api/teleconsultation/${roomCode}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: role, content: draft }),
      }).then((r) => r.json());
      if (res.message) {
        lastMessageId.current = Math.max(lastMessageId.current, res.message.id);
        setMessages((prev) => [...prev, res.message]);
      }
    } catch {
      // ignore send error
    }
    setDraft("");
  }

  async function uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("uploadedBy", role);
    try {
      await fetch(`/api/teleconsultation/${roomCode}/documents`, {
        method: "POST",
        body: fd,
      });
    } catch {
      // ignore upload error
    }
  }

  async function saveNotes() {
    if (role !== "orthophoniste") return;
    setNotesStatus("saving");
    try {
      const res = await fetch(`/api/teleconsultation/${roomCode}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      setNotesStatus(res.ok ? "saved" : "error");
    } catch {
      setNotesStatus("error");
    }
  }

  async function hangUp() {
    if (role === "orthophoniste") {
      try {
        await fetch(`/api/teleconsultation/${roomCode}/notes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notes }),
        });
        await fetch(`/api/teleconsultation/${roomCode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "end" }),
        });
      } catch {
        // hang-up should still leave the room
      }
    }
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    screenStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
    window.location.href =
      role === "orthophoniste" ? "/admin/teleconsultations" : "/espace-parent/teleconsultations";
  }

  function retryNow() {
    setError(null);
    reconnectAttemptsRef.current = 0;
    scheduleReconnect();
  }

  // ─── Status badge ─────────────────────────────────────────────────────────
  const statusLabel: Record<ConnectionStatus, string> = {
    connecting: "Connexion en cours…",
    connected: "Connecté",
    disconnected: "Connexion perdue",
    reconnecting: "Reconnexion en cours…",
  };
  const statusColor: Record<ConnectionStatus, string> = {
    connecting: "bg-marigold/15 text-marigold",
    connected: "bg-sage/10 text-sage-deep",
    disconnected: "bg-coral/10 text-coral",
    reconnecting: "bg-marigold/15 text-marigold",
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div>
        {/* Video area */}
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
          {connectionStatus !== "connected" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-sm text-white/60">
              {connectionStatus === "reconnecting" && (
                <RefreshCw className="h-6 w-6 animate-spin" />
              )}
              <span>
                {connectionStatus === "connecting"
                  ? `En attente de ${otherRole === "parent" ? "la famille" : "l'orthophoniste"}…`
                  : statusLabel[connectionStatus]}
              </span>
            </div>
          )}
          {/* Local preview (camera or screen) */}
          <div className="absolute end-4 bottom-4 h-28 w-40 overflow-hidden rounded-xl border-2 border-white/20 bg-ink shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`h-full w-full object-cover transition-opacity duration-200 ${
                camOn ? "opacity-100" : "opacity-0"
              }`}
            />
            {!camOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-paper-warm p-2 text-ink">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-coral/10 text-coral">
                  <VideoOff className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold text-ink/75">
                  {role === "orthophoniste" ? "Orthophoniste" : "Parent"}
                </span>
              </div>
            )}
          </div>
          {/* Connection status badge */}
          <div
            className={`absolute start-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor[connectionStatus]}`}
          >
            {statusLabel[connectionStatus]}
          </div>
        </div>

        {error && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-coral/10 px-4 py-3 text-sm text-coral">
            <p>{error}</p>
            <button
              onClick={retryNow}
              className="rounded-full border border-coral px-3 py-1 text-xs font-semibold hover:bg-coral hover:text-white"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Controls */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            onClick={toggleMic}
            title={micOn ? "Couper le micro" : "Activer le micro"}
            className={`flex h-11 w-11 items-center justify-center rounded-full border ${micOn ? "border-line bg-white" : "border-coral bg-coral text-white"}`}
          >
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleCam}
            title={camOn ? "Éteindre la caméra" : "Allumer la caméra"}
            className={`flex h-11 w-11 items-center justify-center rounded-full border ${camOn ? "border-line bg-white" : "border-coral bg-coral text-white"}`}
          >
            {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleScreenShare}
            title={screenSharing ? "Arrêter le partage d'écran" : "Partager l'écran"}
            className={`flex h-11 w-11 items-center justify-center rounded-full border ${screenSharing ? "border-sage bg-sage text-white" : "border-line bg-white"}`}
          >
            {screenSharing ? (
              <MonitorOff className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={hangUp}
            title="Raccrocher"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white hover:brightness-95"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>

        {/* Shared documents */}
        <div className="mt-6 rounded-2xl border border-line bg-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Documents partagés</h3>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-coral">
              <Paperclip className="h-3.5 w-3.5" /> Ajouter
              <input
                type="file"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
              />
            </label>
          </div>
          <ul className="mt-3 space-y-2">
            {docs.length === 0 && (
              <li className="text-xs text-ink/40">Aucun document partagé pour l&apos;instant.</li>
            )}
            {docs.map((d) => (
              <li key={d.id}>
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-ink/75 hover:text-coral"
                >
                  <FileText className="h-4 w-4 shrink-0" />
                  <span className="truncate">{d.fileName}</span>
                  <span className="ms-auto shrink-0 text-xs text-ink/40">
                    par {d.uploadedBy}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {role === "orthophoniste" && (
          <div className="mt-6 rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <StickyNote className="h-4 w-4 text-coral" />
                Notes de séance
              </h3>
              {notesStatus === "saved" && (
                <span className="text-xs font-semibold text-sage-deep">Enregistré</span>
              )}
              {notesStatus === "error" && (
                <span className="text-xs font-semibold text-coral">Échec</span>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setNotesStatus("idle");
              }}
              rows={4}
              placeholder="Observations visibles ensuite dans l'historique patient…"
              className="mt-3 w-full rounded-xl border border-line px-3 py-2 text-sm outline-none focus:border-coral"
            />
            <button
              onClick={saveNotes}
              disabled={notesStatus === "saving"}
              className="mt-3 rounded-full bg-coral px-4 py-2 text-xs font-semibold text-white hover:brightness-95 disabled:opacity-60"
            >
              {notesStatus === "saving" ? "Enregistrement…" : "Enregistrer les notes"}
            </button>
          </div>
        )}
      </div>

      {/* Chat panel */}
      <div className="flex flex-col rounded-2xl border border-line bg-white">
        <div className="border-b border-line p-4">
          <h3 className="text-sm font-semibold">Messagerie</h3>
        </div>
        <div
          className="flex-1 space-y-2 overflow-y-auto p-4"
          style={{ maxHeight: 420 }}
        >
          {messages.length === 0 && (
            <p className="text-xs text-ink/40">Aucun message pour l&apos;instant.</p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                m.sender === role
                  ? "ms-auto bg-coral text-white"
                  : "bg-paper-warm text-ink/80"
              }`}
            >
              <p>{m.content}</p>
              <p
                className={`mt-1 text-end text-[10px] ${
                  m.sender === role ? "text-white/60" : "text-ink/40"
                }`}
              >
                {new Date(m.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="flex items-center gap-2 border-t border-line p-3">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Écrire un message…"
            className="flex-1 rounded-full border border-line px-3 py-2 text-sm outline-none focus:border-coral"
          />
          <button
            onClick={sendMessage}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral text-white"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
