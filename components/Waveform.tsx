const HEIGHTS = [8, 16, 10, 24, 14, 30, 18, 26, 12, 20, 9, 16, 22, 11, 28, 15, 19, 10, 24, 13];

export function Waveform({
  color = "var(--coral)",
  animated = false,
  className = "",
}: {
  color?: string;
  animated?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-[3px] ${className}`}
      aria-hidden="true"
    >
      {HEIGHTS.map((h, i) => (
        <span
          key={i}
          className={animated ? "wave-bar" : ""}
          style={{
            display: "inline-block",
            width: 3,
            height: h,
            borderRadius: 2,
            background: color,
            animationDelay: animated ? `${i * 0.07}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}

export function WaveDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`waveform-divider ${className}`}
      viewBox="0 0 400 24"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 12 C 15 2, 25 22, 40 12 S 65 2, 80 12 S 105 22, 120 12 S 145 2, 160 12 S 185 22, 200 12 S 225 2, 240 12 S 265 22, 280 12 S 305 2, 320 12 S 345 22, 360 12 S 385 2, 400 12"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
