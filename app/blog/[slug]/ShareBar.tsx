"use client";

import { MessageCircle, Link2 } from "lucide-react";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M14 8h3V4h-3c-2.8 0-5 2.2-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.6.4-1 1-1Z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24Z" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.7 10.3 20.4 3h-1.6l-5.8 6.3L8.4 3H3.1l7 9.5L3.1 21h1.6l6.1-6.7 4.9 6.7h5.3l-7.3-10.7ZM11.6 13.4l-.7-1-5.7-7.6h2.5l4.6 6.2.7 1 6 8h-2.5l-4.9-6.6Z" />
    </svg>
  );
}

export function ShareBar({ title, locale = "fr" }: { title: string; locale?: Locale }) {
  const [copied, setCopied] = useState(false);
  const copy = t(locale).blog;

  function currentUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  function share(network: "facebook" | "whatsapp" | "linkedin" | "x") {
    const url = encodeURIComponent(currentUrl());
    const text = encodeURIComponent(title);
    const shareUrl =
      network === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
        : network === "whatsapp"
          ? `https://wa.me/?text=${text}%20${url}`
          : network === "linkedin"
            ? `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
            : `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-ink/60 hover:border-coral hover:text-coral";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-ink/45">
        {copy.shareTitle}
      </span>
      <button onClick={() => share("facebook")} aria-label="Facebook" className={btn}>
        <FacebookIcon className="h-4 w-4" />
      </button>
      <button onClick={() => share("whatsapp")} aria-label="WhatsApp" className={btn}>
        <MessageCircle className="h-4 w-4" />
      </button>
      <button onClick={() => share("linkedin")} aria-label="LinkedIn" className={btn}>
        <LinkedinIcon className="h-4 w-4" />
      </button>
      <button onClick={() => share("x")} aria-label="X" className={btn}>
        <XIcon className="h-3.5 w-3.5" />
      </button>
      <button onClick={copyLink} aria-label={copy.copyLink} className={btn}>
        <Link2 className="h-4 w-4" />
      </button>
      {copied && <span className="text-xs text-sage-deep">{copy.linkCopied}</span>}
    </div>
  );
}
