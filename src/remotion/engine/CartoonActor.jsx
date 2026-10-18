export function CartoonActor({ kit = "boy", frame, variant = 0 }) {
  const bob = Math.sin(frame * 0.16) * 6;
  const blink = frame % 48 < 3;
  const palettes = ["#2F8D79", "#B74648", "#394F85", "#C45C3E"];
  const cloth = palettes[variant % palettes.length];
  const skin = "#FFD0A6";

  return (
    <svg
      viewBox="0 0 400 520"
      width="100%"
      height="100%"
      style={{ overflow: "visible" }}
    >
      <g transform={`translate(0 ${bob})`}>
        {kit === "cow" ? (
          <>
            <ellipse cx="200" cy="340" rx="120" ry="70" fill="#F5F0E8" stroke="#292524" strokeWidth="8" />
            <circle cx="300" cy="300" r="48" fill="#F5F0E8" stroke="#292524" strokeWidth="8" />
            <circle cx="318" cy="292" r="8" fill="#292524" />
            <rect x="140" y="390" width="22" height="50" rx="8" fill="#292524" />
            <rect x="230" y="390" width="22" height="50" rx="8" fill="#292524" />
          </>
        ) : (
          <>
            <path d="M150 330 L140 450 Q140 480 175 480 L195 470 L185 440 L180 340Z" fill="#394F85" stroke="#26314E" strokeWidth="7" />
            <path d="M230 330 L250 440 Q260 475 295 465 L310 445 L270 420 L260 330Z" fill="#394F85" stroke="#26314E" strokeWidth="7" />
            <path
              d="M120 210 Q95 230 105 320 L120 400 Q200 430 280 400 L295 310 Q300 230 250 210Z"
              fill={cloth}
              stroke="#173E43"
              strokeWidth="9"
            />
            <rect x="168" y="155" width="64" height="70" rx="22" fill={skin} stroke="#A66D4E" strokeWidth="5" />
            <path
              d="M130 145 Q130 70 200 66 Q270 70 270 145 L255 210 Q240 250 200 254 Q160 250 145 210Z"
              fill={skin}
              stroke="#A66D4E"
              strokeWidth="7"
            />
            <path
              d="M128 150 Q110 90 150 80 Q165 45 200 70 Q240 40 260 85 Q300 95 275 150Z"
              fill="#29233A"
              stroke="#1C1928"
              strokeWidth="8"
            />
            <ellipse cx="170" cy={blink ? 168 : 172} rx="18" ry={blink ? 3 : 18} fill="white" stroke="#302337" strokeWidth="4" />
            <ellipse cx="230" cy={blink ? 168 : 172} rx="18" ry={blink ? 3 : 18} fill="white" stroke="#302337" strokeWidth="4" />
            {!blink ? (
              <>
                <circle cx="172" cy="174" r="8" fill="#302337" />
                <circle cx="232" cy="174" r="8" fill="#302337" />
              </>
            ) : null}
            <path d="M175 215 Q200 232 225 215" stroke="#783D45" strokeWidth="6" fill="none" strokeLinecap="round" />
            <ellipse cx="150" cy="200" rx="14" ry="7" fill="#F28B85" opacity="0.7" />
            <ellipse cx="250" cy="200" rx="14" ry="7" fill="#F28B85" opacity="0.7" />
          </>
        )}
      </g>
    </svg>
  );
}
