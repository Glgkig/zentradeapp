interface ZenTradeLogoProps {
  className?: string;
  size?: number;
  /** When true: no background rect — use inside an already-styled container */
  transparent?: boolean;
}

const ZenTradeLogo = ({ className = "", size = 40, transparent = false }: ZenTradeLogoProps) => {
  // Use a unique id per instance based on transparent flag to avoid filter id collisions
  const id = transparent ? "ztl-t" : "ztl";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a0a2e" />
          <stop offset="100%" stopColor="#060610" />
        </linearGradient>

        {/* Z + chart gradient: purple → cyan */}
        <linearGradient id={`${id}-z`} x1="18" y1="20" x2="82" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="60%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>

        {/* Candlestick accent gradient */}
        <linearGradient id={`${id}-candle`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>

        {/* Glow filter */}
        <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft inner glow on background */}
        <radialGradient id={`${id}-glow-bg`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ── Background rounded square (skip when transparent) ── */}
      {!transparent && (
        <>
          <rect width="100" height="100" rx="22" fill={`url(#${id}-bg)`} />
          <rect width="100" height="100" rx="22" fill={`url(#${id}-glow-bg)`} />
          <rect width="100" height="100" rx="22" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.35" />
        </>
      )}

      {/* ── Z letterform ── */}
      <rect x="20" y="22" width="52" height="9" rx="4.5" fill={`url(#${id}-z)`} filter={`url(#${id}-glow)`} />
      <rect x="28" y="69" width="52" height="9" rx="4.5" fill={`url(#${id}-z)`} filter={`url(#${id}-glow)`} />
      <polygon
        points="72,31 80,31 28,69 20,69"
        fill={`url(#${id}-z)`}
        filter={`url(#${id}-glow)`}
      />

      {/* ── Candlestick accent ── */}
      <rect x="66" y="36" width="6" height="14" rx="1.5" fill={`url(#${id}-candle)`} opacity="0.85" />
      <line x1="69" y1="32" x2="69" y2="36" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="69" y1="50" x2="69" y2="54" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

      {/* ── Dot accent ── */}
      <circle cx="24" cy="73.5" r="3.5" fill="#a78bfa" opacity="0.5" filter={`url(#${id}-glow)`} />
    </svg>
  );
};

export default ZenTradeLogo;
