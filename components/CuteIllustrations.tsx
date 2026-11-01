import React from "react";

interface MascotProps {
  className?: string;
  size?: number;
}

/**
 * 🐰 Rabbit Mascot - Lapin Joyeux
 * Playful, cute bunny with pink inner ears, blushing cheeks and sparkly eyes.
 */
export function RabbitMascot({ className = "", size = 120 }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Lapin mignon"
    >
      <defs>
        <radialGradient id="rabbitCheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb3ba" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffb3ba" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="rabbitEarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffccd5" />
          <stop offset="100%" stopColor="#fff0f3" />
        </linearGradient>
      </defs>

      {/* Ears */}
      <g>
        {/* Left Ear */}
        <path
          d="M 52 75 C 38 20, 60 5, 68 25 C 74 42, 68 65, 62 78 Z"
          fill="#ffffff"
          stroke="#f1f5f9"
          strokeWidth="3"
        />
        <path
          d="M 54 68 C 45 30, 60 18, 64 32 C 68 45, 63 60, 59 70 Z"
          fill="url(#rabbitEarGrad)"
        />

        {/* Right Ear - tilted playfully */}
        <path
          d="M 108 75 C 122 20, 100 5, 92 25 C 86 42, 92 65, 98 78 Z"
          fill="#ffffff"
          stroke="#f1f5f9"
          strokeWidth="3"
        />
        <path
          d="M 106 68 C 115 30, 100 18, 96 32 C 92 45, 97 60, 101 70 Z"
          fill="url(#rabbitEarGrad)"
        />
      </g>

      {/* Body */}
      <ellipse cx="80" cy="128" rx="42" ry="28" fill="#ffffff" stroke="#f1f5f9" strokeWidth="3" />
      <ellipse cx="80" cy="132" rx="26" ry="18" fill="#fff5f5" />

      {/* Head */}
      <ellipse cx="80" cy="92" rx="46" ry="40" fill="#ffffff" stroke="#f1f5f9" strokeWidth="3" />

      {/* Rosy Cheeks */}
      <circle cx="54" cy="98" r="10" fill="url(#rabbitCheek)" />
      <circle cx="106" cy="98" r="10" fill="url(#rabbitCheek)" />

      {/* Eyes */}
      <g>
        {/* Left Eye */}
        <circle cx="62" cy="88" r="5.5" fill="#1e293b" />
        <circle cx="60.5" cy="86" r="2" fill="#ffffff" />
        <circle cx="64" cy="90" r="1" fill="#ffffff" />

        {/* Right Eye */}
        <circle cx="98" cy="88" r="5.5" fill="#1e293b" />
        <circle cx="96.5" cy="86" r="2" fill="#ffffff" />
        <circle cx="100" cy="90" r="1" fill="#ffffff" />
      </g>

      {/* Nose & Mouth */}
      <polygon points="76,96 84,96 80,101" fill="#ff758f" />
      <path
        d="M 80 101 L 80 105 C 77 107, 72 107, 71 104 M 80 105 C 83 107, 88 107, 89 104"
        stroke="#475569"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Little Star in hand / Speech Star */}
      <g transform="translate(112, 108) scale(0.8)">
        <path
          d="M 12 0 L 15 8 L 24 9 L 17 15 L 19 24 L 12 19 L 5 24 L 7 15 L 0 9 L 9 8 Z"
          fill="#fbbf24"
        />
        <circle cx="12" cy="12" r="3" fill="#fef3c7" />
      </g>
    </svg>
  );
}

/**
 * 🐻 Bear Mascot - Ourson Câlin
 * Gentle, warm caramel bear with sweet smile, cuddly ears, and a cute pastel scarf.
 */
export function BearMascot({ className = "", size = 120 }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Ourson doux"
    >
      <defs>
        <radialGradient id="bearCheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb3ba" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffb3ba" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Round Ears */}
      <g>
        {/* Left Ear */}
        <circle cx="48" cy="46" r="20" fill="#d97706" />
        <circle cx="48" cy="46" r="12" fill="#fef3c7" />

        {/* Right Ear */}
        <circle cx="112" cy="46" r="20" fill="#d97706" />
        <circle cx="112" cy="46" r="12" fill="#fef3c7" />
      </g>

      {/* Body */}
      <ellipse cx="80" cy="130" rx="44" ry="26" fill="#b45309" />
      <ellipse cx="80" cy="134" rx="26" ry="18" fill="#fef3c7" />

      {/* Head */}
      <circle cx="80" cy="84" r="44" fill="#d97706" />

      {/* Snout / Muzzle */}
      <ellipse cx="80" cy="94" rx="20" ry="15" fill="#fef3c7" />

      {/* Cheeks */}
      <circle cx="50" cy="90" r="9" fill="url(#bearCheek)" />
      <circle cx="110" cy="90" r="9" fill="url(#bearCheek)" />

      {/* Eyes */}
      <circle cx="62" cy="78" r="5" fill="#1e293b" />
      <circle cx="60.5" cy="76.5" r="1.8" fill="#ffffff" />
      <circle cx="98" cy="78" r="5" fill="#1e293b" />
      <circle cx="96.5" cy="76.5" r="1.8" fill="#ffffff" />

      {/* Nose */}
      <ellipse cx="80" cy="88" rx="6.5" ry="4.5" fill="#1e293b" />
      <ellipse cx="79" cy="86.5" rx="2" ry="1" fill="#ffffff" />

      {/* Smile */}
      <path
        d="M 80 93 L 80 97 C 76 99, 72 99, 71 97 M 80 97 C 84 99, 88 99, 89 97"
        stroke="#1e293b"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cute Scarf */}
      <path
        d="M 46 114 Q 80 126 114 114 Q 80 134 46 114 Z"
        fill="#34d399"
      />
      {/* Scarf knot / tail */}
      <path
        d="M 94 118 L 102 142 L 88 138 Z"
        fill="#10b981"
      />
    </svg>
  );
}

/**
 * 🐦 Bird Mascot - Petit Oiseau Chanteur
 * Joyful turquoise and canary bird singing notes, representing speech and voice.
 */
export function BirdMascot({ className = "", size = 120 }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Petit oiseau chanteur"
    >
      <defs>
        <radialGradient id="birdCheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb3ba" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffb3ba" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Tail feathers */}
      <path d="M 28 92 C 12 85, 14 70, 22 66 C 26 78, 38 84, 46 88 Z" fill="#38bdf8" />
      <path d="M 22 96 C 8 94, 10 80, 20 76 C 25 84, 34 90, 42 94 Z" fill="#0284c7" />

      {/* Feet */}
      <path d="M 72 134 L 72 146 M 66 146 L 76 146" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <path d="M 88 134 L 88 146 M 82 146 L 92 146" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />

      {/* Body & Head */}
      <circle cx="82" cy="88" r="42" fill="#38bdf8" />
      <ellipse cx="94" cy="98" rx="26" ry="24" fill="#fef08a" />

      {/* Wing */}
      <path
        d="M 48 90 C 44 76, 56 68, 68 76 C 76 82, 78 98, 62 104 C 52 104, 49 96, 48 90 Z"
        fill="#0284c7"
      />

      {/* Eye */}
      <circle cx="102" cy="74" r="5.5" fill="#1e293b" />
      <circle cx="100.5" cy="72" r="2" fill="#ffffff" />

      {/* Cheek */}
      <circle cx="94" cy="85" r="7" fill="url(#birdCheek)" />

      {/* Beak (Singing / Open) */}
      <path d="M 118 74 L 138 78 L 118 86 Z" fill="#f59e0b" />
      <path d="M 120 78 L 130 80" stroke="#d97706" strokeWidth="1.5" />

      {/* Musical Voice Notes floating */}
      <g fill="#ec4899">
        <path d="M 136 50 C 136 46, 142 42, 146 45 C 146 52, 140 54, 137 54 C 134 54, 132 52, 132 50 C 132 47, 135 46, 137 46 L 137 36 L 148 34 L 148 38 L 139 40 L 139 50 Z" />
        <circle cx="148" cy="30" r="2.5" fill="#38bdf8" />
      </g>
    </svg>
  );
}

/**
 * 🧒 Smiling Child Mascot - Enfant Souriant
 * Happy, friendly smiling child with cheerful expression and sparkling aura.
 */
export function SmilingChildMascot({ className = "", size = 120 }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Enfant souriant"
    >
      <defs>
        <radialGradient id="childCheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff859c" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ff859c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Shirt */}
      <path
        d="M 40 148 C 42 122, 60 114, 80 114 C 100 114, 118 122, 120 148 Z"
        fill="#ff6b4a"
      />
      <circle cx="80" cy="114" r="14" fill="#fed7aa" />

      {/* Neck */}
      <rect x="74" y="104" width="12" height="12" fill="#fed7aa" />

      {/* Head */}
      <circle cx="80" cy="74" r="36" fill="#fed7aa" />

      {/* Cheerful Hair */}
      <path
        d="M 44 68 C 44 40, 60 30, 80 30 C 100 30, 116 40, 116 68 C 112 56, 102 52, 94 56 C 86 50, 72 50, 66 56 C 58 52, 48 56, 44 68 Z"
        fill="#78350f"
      />

      {/* Rosy Cheeks */}
      <circle cx="58" cy="80" r="7" fill="url(#childCheek)" />
      <circle cx="102" cy="80" r="7" fill="url(#childCheek)" />

      {/* Sparkly Eyes */}
      <circle cx="66" cy="72" r="4.5" fill="#1e293b" />
      <circle cx="64.5" cy="70.5" r="1.5" fill="#ffffff" />
      <circle cx="94" cy="72" r="4.5" fill="#1e293b" />
      <circle cx="92.5" cy="70.5" r="1.5" fill="#ffffff" />

      {/* Eyebrows */}
      <path d="M 62 65 Q 66 62 70 65" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M 90 65 Q 94 62 98 65" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Happy Big Smile */}
      <path
        d="M 70 82 Q 80 94 90 82"
        stroke="#b91c1c"
        strokeWidth="3"
        strokeLinecap="round"
        fill="#ef4444"
      />
      <path d="M 74 83 Q 80 87 86 83" fill="#ffffff" />

      {/* Cheerful Balloon or Star */}
      <g transform="translate(116, 26)">
        <circle cx="12" cy="12" r="12" fill="#fbbf24" />
        <path d="M 12 24 L 12 38" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="9" cy="8" r="3" fill="#fef3c7" />
      </g>
    </svg>
  );
}

/**
 * 🎁 Boîte à Exercices Mascot
 * Cheerful magic exercise toybox with colorful speech cards and puzzle pieces.
 */
export function ExerciseBoxMascot({ className = "", size = 120 }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Boîte à exercices"
    >
      {/* Box base */}
      <rect x="30" y="70" width="100" height="70" rx="18" fill="#f59e0b" />
      <rect x="36" y="76" width="88" height="58" rx="14" fill="#fbbf24" />

      {/* Chest Lid open */}
      <path
        d="M 22 70 C 22 56, 40 48, 80 48 C 120 48, 138 56, 138 70 Z"
        fill="#f59e0b"
      />
      <ellipse cx="80" cy="54" rx="46" ry="6" fill="#fef3c7" opacity="0.6" />

      {/* Ribbon / Latch */}
      <rect x="74" y="66" width="12" height="24" rx="6" fill="#ef4444" />
      <circle cx="80" cy="78" r="4" fill="#fbbf24" />

      {/* Floating Magic Items (cards, stars, alphabet) */}
      <g>
        {/* Card 1: Letter A */}
        <g transform="translate(42, 28) rotate(-12)">
          <rect width="28" height="36" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
          <text x="14" y="24" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#ff6b4a" fontFamily="sans-serif">
            A
          </text>
        </g>

        {/* Card 2: Star */}
        <g transform="translate(94, 24) rotate(14)">
          <rect width="28" height="36" rx="6" fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />
          <path
            d="M 14 6 L 16 13 L 23 13 L 17 18 L 19 25 L 14 21 L 9 25 L 11 18 L 5 13 L 12 13 Z"
            fill="#38bdf8"
          />
        </g>

        {/* Puzzle piece */}
        <path
          d="M 80 20 C 76 20, 74 16, 76 12 C 78 8, 84 8, 86 12 C 88 16, 86 20, 82 20 Z"
          fill="#34d399"
        />
      </g>
    </svg>
  );
}

/**
 * 📅 Calendar Mascot - Mon Agenda Mignon
 * Cheerful calendar with smiling face and clock tick.
 */
export function CalendarMascot({ className = "", size = 120 }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Mon agenda"
    >
      <defs>
        <radialGradient id="calCheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff859c" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ff859c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Calendar body */}
      <rect x="25" y="35" width="110" height="105" rx="24" fill="#ffffff" stroke="#e2e8f0" strokeWidth="3" />

      {/* Top Header bar */}
      <path
        d="M 25 55 C 25 43, 35 35, 49 35 L 111 35 C 125 35, 135 43, 135 55 L 135 65 L 25 65 Z"
        fill="#ff6b4a"
      />

      {/* Spiral Binder Rings */}
      <rect x="46" y="24" width="8" height="22" rx="4" fill="#94a3b8" />
      <rect x="106" y="24" width="8" height="22" rx="4" fill="#94a3b8" />

      {/* Cheerful Face */}
      <circle cx="56" cy="98" r="4.5" fill="#1e293b" />
      <circle cx="54.5" cy="96.5" r="1.5" fill="#ffffff" />
      <circle cx="104" cy="98" r="4.5" fill="#1e293b" />
      <circle cx="102.5" cy="96.5" r="1.5" fill="#ffffff" />

      {/* Cheeks */}
      <circle cx="48" cy="104" r="6" fill="url(#calCheek)" />
      <circle cx="112" cy="104" r="6" fill="url(#calCheek)" />

      {/* Smile */}
      <path
        d="M 72 106 Q 80 114 88 106"
        stroke="#ff6b4a"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Heart / Check badge */}
      <circle cx="80" cy="80" r="10" fill="#ecfdf5" />
      <path
        d="M 76 80 L 79 83 L 85 77"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * 👩‍⚕️ Doctor / Speech Therapist Mascot
 * Friendly speech therapist with caring smile, stethoscope or notes.
 */
export function TherapistMascot({ className = "", size = 120 }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Orthophoniste bienveillante"
    >
      <defs>
        <radialGradient id="therapistCheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff859c" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ff859c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Coat / Clothes */}
      <path
        d="M 38 150 C 40 120, 60 112, 80 112 C 100 112, 120 120, 122 150 Z"
        fill="#0284c7"
      />
      {/* White lab coat overlay */}
      <path
        d="M 44 150 C 46 124, 60 114, 72 114 L 72 150 Z"
        fill="#f8fafc"
      />
      <path
        d="M 116 150 C 114 124, 100 114, 88 114 L 88 150 Z"
        fill="#f8fafc"
      />

      {/* Stethoscope */}
      <path
        d="M 68 118 C 68 132, 92 132, 92 118"
        stroke="#94a3b8"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="80" cy="136" r="5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />

      {/* Neck */}
      <rect x="73" y="98" width="14" height="16" fill="#fed7aa" />

      {/* Head */}
      <circle cx="80" cy="70" r="34" fill="#fed7aa" />

      {/* Hair */}
      <path
        d="M 46 68 C 44 38, 62 26, 80 26 C 98 26, 116 38, 114 68 C 108 52, 98 48, 88 52 C 78 46, 64 48, 56 54 C 50 58, 48 64, 46 68 Z"
        fill="#334155"
      />
      {/* Bun */}
      <circle cx="80" cy="22" r="14" fill="#334155" />

      {/* Glasses */}
      <g stroke="#0284c7" strokeWidth="2.5" fill="none">
        <rect x="58" y="62" width="18" height="14" rx="4" fill="#ffffff" fillOpacity="0.4" />
        <rect x="84" y="62" width="18" height="14" rx="4" fill="#ffffff" fillOpacity="0.4" />
        <line x1="76" y1="69" x2="84" y2="69" />
      </g>

      {/* Eyes */}
      <circle cx="67" cy="69" r="3.5" fill="#1e293b" />
      <circle cx="93" cy="69" r="3.5" fill="#1e293b" />

      {/* Cheeks */}
      <circle cx="58" cy="76" r="6" fill="url(#therapistCheek)" />
      <circle cx="102" cy="76" r="6" fill="url(#therapistCheek)" />

      {/* Warm Smile */}
      <path
        d="M 72 80 Q 80 88 88 80"
        stroke="#b91c1c"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * ☀️ CuteSun - Soleil Pastel Souriant
 * Doux soleil jaune pastel avec joues pêche et rayons arrondis.
 */
export function CuteSun({ className = "", size = 90 }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Soleil pastel souriant"
    >
      <defs>
        <radialGradient id="sunCheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f8a98c" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#f8a98c" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Rayons arrondis doux */}
      <g stroke="#fef08a" strokeWidth="6" strokeLinecap="round">
        <line x1="60" y1="12" x2="60" y2="22" />
        <line x1="60" y1="98" x2="60" y2="108" />
        <line x1="12" y1="60" x2="22" y2="60" />
        <line x1="98" y1="60" x2="108" y2="60" />
        <line x1="26" y1="26" x2="33" y2="33" />
        <line x1="87" y1="87" x2="94" y2="94" />
        <line x1="26" y1="94" x2="33" y2="87" />
        <line x1="87" y1="33" x2="94" y2="26" />
      </g>

      {/* Disque central soleil */}
      <circle cx="60" cy="60" r="34" fill="#fef08a" stroke="#fde047" strokeWidth="2.5" />

      {/* Joues roses pastel */}
      <circle cx="44" cy="64" r="6" fill="url(#sunCheek)" />
      <circle cx="76" cy="64" r="6" fill="url(#sunCheek)" />

      {/* Yeux joyeux */}
      <circle cx="48" cy="56" r="3.5" fill="#2d3748" />
      <circle cx="46.8" cy="54.8" r="1.2" fill="#ffffff" />
      <circle cx="72" cy="56" r="3.5" fill="#2d3748" />
      <circle cx="70.8" cy="54.8" r="1.2" fill="#ffffff" />

      {/* Sourire doux */}
      <path
        d="M 52 64 Q 60 72 68 64"
        stroke="#e0684b"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * ☁️ CuteCloud - Nuage Pastel Moelleux
 * Nuage vaporeux blanc et bleu ciel très clair avec petites étoiles.
 */
export function CuteCloud({ className = "", size = 100 }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Nuage pastel"
    >
      <defs>
        <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>

      {/* Forme du nuage */}
      <path
        d="M 35 70 C 24 70, 15 62, 15 50 C 15 40, 23 32, 33 31 C 37 18, 50 10, 65 10 C 82 10, 96 20, 99 35 C 103 33, 108 32, 112 32 C 124 32, 134 41, 134 52 C 134 62, 126 70, 115 70 Z"
        fill="url(#cloudGrad)"
        stroke="#bae6fd"
        strokeWidth="2"
      />

      {/* Petite expression mignonne */}
      <circle cx="56" cy="46" r="2.5" fill="#64748b" />
      <circle cx="74" cy="46" r="2.5" fill="#64748b" />
      <path
        d="M 61 50 Q 65 54 69 50"
        stroke="#64748b"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="50" cy="49" r="3" fill="#fcd5ce" opacity="0.8" />
      <circle cx="80" cy="49" r="3" fill="#fcd5ce" opacity="0.8" />
    </svg>
  );
}

/**
 * 🐝 CuteBee - Petite Abeille Mignonne
 * Petite abeille butineuse avec ailes bleu ciel et grand sourire.
 */
export function CuteBee({ className = "", size = 70 }: MascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
      aria-label="Petite abeille"
    >
      {/* Ailes bleu ciel pastel */}
      <g opacity="0.85">
        <ellipse cx="44" cy="30" rx="14" ry="20" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="2" transform="rotate(-25 44 30)" />
        <ellipse cx="60" cy="30" rx="14" ry="20" fill="#e0f2fe" stroke="#bae6fd" strokeWidth="2" transform="rotate(25 60 30)" />
      </g>

      {/* Corps rayé */}
      <ellipse cx="50" cy="60" rx="28" ry="22" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
      
      {/* Rayures douces */}
      <path d="M 44 38 Q 48 60 44 82" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
      <path d="M 58 39 Q 62 60 58 81" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />

      {/* Yeux pétillants */}
      <circle cx="34" cy="56" r="3.5" fill="#1e293b" />
      <circle cx="33" cy="54.8" r="1.2" fill="#ffffff" />
      <circle cx="24" cy="56" r="3.5" fill="#1e293b" />
      <circle cx="23" cy="54.8" r="1.2" fill="#ffffff" />

      {/* Joue rose */}
      <circle cx="28" cy="63" r="3.5" fill="#f8a98c" opacity="0.9" />

      {/* Sourire */}
      <path d="M 28 66 Q 32 70 36 66" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Petites antennes */}
      <path d="M 32 40 Q 28 28 22 26" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="22" cy="26" r="2.5" fill="#78350f" />
      <path d="M 40 40 Q 42 28 48 26" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="48" cy="26" r="2.5" fill="#78350f" />

      {/* Dard tout doux */}
      <polygon points="78,58 85,60 78,62" fill="#78350f" />
    </svg>
  );
}
