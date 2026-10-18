import { CHARACTER_VARIANTS, SET_VARIANTS, CHARACTER_KITS } from "./palettes";

export function KitSvg({ kit, variant = 0, className, style }) {
  const character = CHARACTER_VARIANTS[variant % CHARACTER_VARIANTS.length];
  const set = SET_VARIANTS[variant % SET_VARIANTS.length];
  const isCharacter = CHARACTER_KITS.includes(kit);

  return (
    <svg viewBox="0 0 320 180" className={className} style={style} preserveAspectRatio="xMidYMid slice">
      {isCharacter ? <CharacterDrawing kit={kit} palette={character} /> : <SetDrawing kit={kit} palette={set} />}
    </svg>
  );
}

function SetDrawing({ kit, palette }) {
  if (kit === "mistForest" || kit === "forest") {
    return (
      <g>
        <rect width="320" height="180" fill={palette.sky} />
        <ellipse cx="40" cy="90" rx="50" ry="80" fill={palette.mid} opacity="0.9" />
        <ellipse cx="110" cy="70" rx="40" ry="90" fill={palette.ground} />
        <ellipse cx="200" cy="85" rx="55" ry="95" fill={palette.mid} />
        <ellipse cx="280" cy="75" rx="45" ry="100" fill={palette.ground} />
        <rect y="140" width="320" height="40" fill={palette.warm} opacity="0.55" />
        <path d="M0 150 Q80 138 160 152 T320 148 V180 H0 Z" fill={palette.gold} opacity="0.2" />
      </g>
    );
  }
  if (kit === "mysteryLane" || kit === "street") {
    return (
      <g>
        <rect width="320" height="180" fill={palette.sky} />
        <rect x="0" y="40" width="90" height="100" fill={palette.mid} />
        <rect x="230" y="30" width="90" height="110" fill={palette.ground} />
        <rect y="130" width="320" height="50" fill="#111827" />
        <polygon points="110,180 150,90 170,90 220,180" fill="#1f2937" />
        <circle cx="160" cy="78" r="18" fill={palette.gold} opacity="0.35" />
        <rect x="154" y="70" width="12" height="28" fill={palette.gold} />
      </g>
    );
  }
  if (kit === "lampRoom" || kit === "room") {
    return (
      <g>
        <rect width="320" height="180" fill="#3b2618" />
        <rect x="40" y="20" width="90" height="70" fill={palette.gold} opacity="0.35" />
        <polygon points="120,20 200,20 210,180 110,180" fill="#c45c3e" opacity="0.55" />
        <circle cx="160" cy="120" r="50" fill={palette.gold} opacity="0.25" />
        <rect y="150" width="320" height="30" fill="#1c1610" />
      </g>
    );
  }
  if (kit === "marketStreet") {
    return (
      <g>
        <rect width="320" height="180" fill="#7dd3fc" />
        <rect y="100" width="320" height="80" fill="#eab308" opacity="0.35" />
        <rect x="20" y="70" width="70" height="50" fill="#b45309" />
        <rect x="120" y="60" width="80" height="60" fill="#7c2d12" />
        <rect x="230" y="75" width="70" height="45" fill="#9a3412" />
        <path d="M0 140 L320 155 L320 180 L0 180 Z" fill="#a8a29e" />
      </g>
    );
  }
  if (kit === "folkMeadow") {
    return (
      <g>
        <rect width="320" height="180" fill="#7dd3fc" />
        <circle cx="260" cy="40" r="22" fill="#fde68a" />
        <ellipse cx="60" cy="130" rx="70" ry="28" fill="#86efac" />
        <ellipse cx="180" cy="140" rx="90" ry="30" fill="#4ade80" />
        <ellipse cx="280" cy="135" rx="60" ry="24" fill="#22c55e" />
        <rect y="150" width="320" height="30" fill="#15803d" />
      </g>
    );
  }
  return (
    <g>
      <rect width="320" height="180" fill={palette.sky} />
      <rect y="0" width="320" height="110" fill="url(#none)" />
      <path d="M0 0 H320 V80 Q240 50 160 78 T0 70 Z" fill={palette.mid} />
      <path d="M0 70 L50 40 L90 68 L140 28 L200 72 L260 38 L320 66 V180 H0 Z" fill={palette.ground} />
      <circle cx="250" cy="42" r="16" fill={palette.gold} opacity="0.85" />
      <path d="M0 130 Q80 110 160 128 T320 120 V180 H0 Z" fill={palette.warm} />
      <polygon points="40,130 58,88 76,130" fill="#1c1210" />
      <polygon points="70,132 88,78 108,132" fill="#0b0706" />
      <rect x="200" y="100" width="36" height="32" fill="#5a3a2a" />
    </g>
  );
}

function CharacterDrawing({ kit, palette }) {
  if (kit === "cow") {
    return (
      <g>
        <ellipse cx="150" cy="118" rx="70" ry="32" fill="#f5f0e8" />
        <ellipse cx="210" cy="100" rx="22" ry="18" fill="#f5f0e8" />
        <ellipse cx="120" cy="108" rx="16" ry="12" fill={palette.cloth} opacity="0.5" />
        <rect x="110" y="140" width="10" height="22" fill="#292524" />
        <rect x="175" y="140" width="10" height="22" fill="#292524" />
        <circle cx="218" cy="96" r="3" fill="#111827" />
      </g>
    );
  }
  if (kit === "elder") {
    return (
      <g>
        <circle cx="160" cy="52" r="18" fill={palette.skin} />
        <path d="M142 48 Q160 28 178 48" fill={palette.hair} />
        <path d="M132 78 Q160 70 188 88 L180 150 L140 150 Z" fill={palette.cloth} />
        <path d="M120 90 L132 86 L128 150 L112 150 Z" fill={palette.accent} />
      </g>
    );
  }
  if (kit === "girl") {
    return (
      <g>
        <circle cx="160" cy="48" r="18" fill={palette.skin} />
        <path d="M140 40 Q160 18 180 40 Q188 70 160 64 Q132 70 140 40" fill={palette.hair} />
        <path d="M124 78 L196 78 L180 160 L140 160 Z" fill={palette.cloth} />
        <path d="M124 78 L196 78 L160 120 Z" fill={palette.accent} opacity="0.5" />
      </g>
    );
  }
  if (kit === "host") {
    return (
      <g>
        <circle cx="160" cy="50" r="16" fill={palette.skin} />
        <rect x="138" y="68" width="44" height="52" rx="6" fill={palette.cloth} />
        <rect x="146" y="120" width="12" height="30" fill="#1f2937" />
        <rect x="162" y="120" width="12" height="30" fill="#1f2937" />
      </g>
    );
  }
  return (
    <g>
      <circle cx="160" cy="50" r="18" fill={palette.skin} />
      <path d="M146 40 Q160 28 174 40" fill={palette.hair} />
      <path d="M136 72 L184 72 L176 130 L144 130 Z" fill={palette.cloth} />
      <rect x="148" y="128" width="10" height="28" fill="#1f2937" />
      <rect x="162" y="128" width="10" height="28" fill="#1f2937" />
      <path d="M136 80 L120 110" stroke={palette.accent} strokeWidth="5" />
      <path d="M184 80 L200 110" stroke={palette.accent} strokeWidth="5" />
    </g>
  );
}
