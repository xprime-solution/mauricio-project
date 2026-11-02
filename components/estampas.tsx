import type { DesignId } from "@/lib/types";
import type { JSX } from "react";

/* Artes vetoriais originais das estampas prontas (viewBox 300 × 300). */

function OndaItajai() {
  return (
    <g>
      <defs>
        <linearGradient id="oi-sun" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffd23f" />
          <stop offset="1" stopColor="#ff6b35" />
        </linearGradient>
        <clipPath id="oi-clip">
          <circle cx="150" cy="128" r="96" />
        </clipPath>
      </defs>
      <circle cx="150" cy="128" r="96" fill="url(#oi-sun)" />
      <g clipPath="url(#oi-clip)">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="40" y={146 + i * 16} width="220" height={5 + i * 2} fill="#1b1036" />
        ))}
        <path d="M40,196 C78,150 112,168 128,190 C140,206 172,214 196,176 C214,148 248,152 262,170 L262,240 L40,240 Z" fill="#11a5b4" />
        <path d="M40,214 C80,186 116,196 140,212 C170,232 210,224 262,198 L262,240 L40,240 Z" fill="#0b6f8c" />
        <path d="M128,190 C136,170 156,162 170,168 C158,170 148,180 146,194 Z" fill="#e8fbff" />
      </g>
      <text x="150" y="262" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="40" letterSpacing="6" fill="#ffd23f">
        ITAJAÍ
      </text>
      <text x="150" y="284" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="600" fontSize="11" letterSpacing="5" fill="#11a5b4">
        SANTA CATARINA
      </text>
    </g>
  );
}

function TigreNeon() {
  return (
    <g>
      <polygon points="150,40 236,92 252,176 206,246 150,268 94,246 48,176 64,92" fill="#ff7a1a" />
      <polygon points="150,40 236,92 150,118 64,92" fill="#ff9a3d" />
      <polygon points="64,92 40,52 104,70" fill="#ff7a1a" />
      <polygon points="236,92 260,52 196,70" fill="#ff7a1a" />
      <polygon points="72,86 56,62 96,74" fill="#ff2e88" />
      <polygon points="228,86 244,62 204,74" fill="#ff2e88" />
      <polygon points="150,150 196,178 150,268 104,178" fill="#fff4e6" />
      <polygon points="150,48 140,96 150,108 160,96" fill="#1a1026" />
      <polygon points="104,62 112,96 124,100" fill="#1a1026" />
      <polygon points="196,62 188,96 176,100" fill="#1a1026" />
      <polygon points="54,140 92,148 60,164" fill="#1a1026" />
      <polygon points="246,140 208,148 240,164" fill="#1a1026" />
      <polygon points="62,190 98,186 76,212" fill="#1a1026" />
      <polygon points="238,190 202,186 224,212" fill="#1a1026" />
      <polygon points="96,128 132,134 120,148 98,142" fill="#a6e430" />
      <polygon points="204,128 168,134 180,148 202,142" fill="#a6e430" />
      <polygon points="112,136 122,134 120,146" fill="#1a1026" />
      <polygon points="188,136 178,134 180,146" fill="#1a1026" />
      <polygon points="136,190 164,190 150,206" fill="#ff2e88" />
      <path d="M150,206 L150,222 M150,222 Q134,232 124,224 M150,222 Q166,232 176,224" stroke="#1a1026" strokeWidth="4" fill="none" strokeLinecap="round" />
      <polygon points="150,40 236,92 252,176 206,246 150,268 94,246 48,176 64,92" fill="none" stroke="#a6e430" strokeWidth="4" strokeLinejoin="round" />
      <text x="150" y="292" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="22" letterSpacing="10" fill="#ff2e88">
        WILD
      </text>
    </g>
  );
}

function CafeForte() {
  return (
    <g>
      <circle cx="150" cy="140" r="112" fill="#2a1a12" />
      <circle cx="150" cy="140" r="112" fill="none" stroke="#e9c79a" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />
      <path d="M118,62 C104,78 132,88 118,104 M150,56 C136,72 164,82 150,98 M182,62 C168,78 196,88 182,104" stroke="#e9c79a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M92,118 L208,118 L198,196 Q196,214 178,214 L122,214 Q104,214 102,196 Z" fill="#f4e4cc" />
      <path d="M208,132 Q244,132 240,160 Q236,186 202,184" stroke="#f4e4cc" strokeWidth="11" fill="none" />
      <rect x="92" y="118" width="116" height="14" fill="#c46a2b" />
      <ellipse cx="150" cy="224" rx="84" ry="9" fill="#c46a2b" />
      <ellipse cx="150" cy="166" rx="15" ry="21" fill="#5a3420" transform="rotate(-24 150 166)" />
      <path d="M144,148 Q158,166 146,184" stroke="#f4e4cc" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="150" y="276" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="30" letterSpacing="3" fill="#e9c79a">
        CAFÉ FORTE
      </text>
      <text x="150" y="294" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="500" fontSize="11" letterSpacing="4" fill="#c46a2b">
        DESDE CEDO
      </text>
    </g>
  );
}

const GHOST = ["0011111100", "0111111110", "1111111111", "1100110011", "1100110011", "1111111111", "1111111111", "1111111111", "1101101101", "1001001001"];
const HEART = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];

function GameOver() {
  const px = (grid: string[], x0: number, y0: number, s: number, fill: string, eye?: string) =>
    grid.flatMap((row, y) =>
      row.split("").map((c, x) => (c === "1" ? <rect key={`${x0}-${x}-${y}`} x={x0 + x * s} y={y0 + y * s} width={s} height={s} fill={eye && (y === 3 || y === 4) && (x === 2 || x === 3 || x === 6 || x === 7) ? eye : fill} /> : null)),
    );
  return (
    <g>
      <rect x="20" y="20" width="260" height="260" rx="18" fill="#120c22" />
      <rect x="20" y="20" width="260" height="260" rx="18" fill="none" stroke="#8f2ee6" strokeWidth="4" />
      {px(GHOST, 50, 52, 10, "#a6e430", "#120c22")}
      {px(GHOST, 160, 52, 10, "#ff2e88", "#120c22")}
      {px(HEART, 115, 166, 10, "#ff4757")}
      <text x="150" y="252" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fontSize="30" letterSpacing="2" fill="#f5f3f8">
        GAME OVER
      </text>
      <text x="150" y="272" textAnchor="middle" fontFamily="'JetBrains Mono', monospace" fontWeight="700" fontSize="10" letterSpacing="4" fill="#a6e430">
        PRESS START
      </text>
    </g>
  );
}

function Astronauta() {
  const stars = [
    [40, 50],
    [258, 40],
    [236, 120],
    [60, 140],
    [30, 230],
    [270, 220],
    [120, 30],
  ];
  return (
    <g>
      <circle cx="150" cy="150" r="128" fill="#16133a" />
      {stars.map(([x, y], i) => (
        <path key={i} d={`M${x},${y - 6} L${x + 2},${y - 2} L${x + 6},${y} L${x + 2},${y + 2} L${x},${y + 6} L${x - 2},${y + 2} L${x - 6},${y} L${x - 2},${y - 2} Z`} fill="#ffd23f" />
      ))}
      <path d="M44,214 C90,190 120,226 160,212 C200,198 226,216 258,206 L258,232 Q150,290 44,232 Z" fill="#11a5b4" />
      <rect x="80" y="196" width="150" height="16" rx="8" fill="#ff7a1a" transform="rotate(-10 155 204)" />
      <rect x="120" y="146" width="60" height="58" rx="18" fill="#eef0f6" />
      <path d="M120,168 L96,190 M180,168 L206,150" stroke="#eef0f6" strokeWidth="14" strokeLinecap="round" />
      <path d="M134,204 L124,226 M166,204 L178,224" stroke="#eef0f6" strokeWidth="14" strokeLinecap="round" />
      <circle cx="150" cy="114" r="40" fill="#eef0f6" />
      <rect x="122" y="98" width="56" height="34" rx="16" fill="#3a2f7a" />
      <path d="M130,106 Q140,100 152,104" stroke="#a6e430" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="150" cy="174" r="7" fill="#ff2e88" />
      <text x="150" y="276" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="15" letterSpacing="6" fill="#ffd23f">
        SPACE SURF
      </text>
    </g>
  );
}

function CactoPop() {
  return (
    <g>
      <circle cx="150" cy="150" r="128" fill="#ffe3ec" />
      {[
        [60, 70],
        [240, 80],
        [70, 210],
        [236, 200],
        [110, 46],
        [196, 44],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill={i % 2 ? "#ff7a1a" : "#ff2e88"} opacity="0.75" />
      ))}
      <path d="M128,206 L128,96 Q128,68 150,68 Q172,68 172,96 L172,206 Z" fill="#13a35a" />
      <path d="M128,150 L106,150 Q90,150 90,134 L90,112 Q90,100 101,100 Q112,100 112,112 L112,132 L128,132 Z" fill="#13a35a" />
      <path d="M172,126 L192,126 Q208,126 208,110 L208,96 Q208,84 197,84 Q186,84 186,96 L186,108 L172,108 Z" fill="#13a35a" />
      <path d="M150,82 L150,196 M140,100 L140,190 M160,100 L160,190" stroke="#0d7a43" strokeWidth="3" />
      <circle cx="150" cy="64" r="11" fill="#ff2e88" />
      <circle cx="150" cy="64" r="4" fill="#ffd23f" />
      <path d="M104,206 L196,206 L186,256 Q184,264 176,264 L124,264 Q116,264 114,256 Z" fill="#ff7a1a" />
      <rect x="98" y="200" width="104" height="16" rx="5" fill="#e0601a" />
      <text x="150" y="246" textAnchor="middle" fontFamily="Poppins, sans-serif" fontWeight="800" fontSize="16" letterSpacing="3" fill="#fff">
        POP
      </text>
    </g>
  );
}

const DESIGNS: Record<DesignId, () => JSX.Element> = {
  "onda-itajai": OndaItajai,
  "tigre-neon": TigreNeon,
  "cafe-forte": CafeForte,
  "game-over": GameOver,
  astronauta: Astronauta,
  "cacto-pop": CactoPop,
};

export function DesignArt({ id, className = "", embed }: { id: DesignId; className?: string; embed?: { x: number; y: number; size: number } }) {
  const Art = DESIGNS[id];
  if (embed) {
    return (
      <svg x={embed.x} y={embed.y} width={embed.size} height={embed.size} viewBox="0 0 300 300">
        <Art />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 300 300" className={className} role="img" aria-label="Arte da estampa">
      <Art />
    </svg>
  );
}
