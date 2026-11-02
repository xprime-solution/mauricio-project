import type { GarmentShape } from "@/lib/types";
import type { ReactNode } from "react";

const TEE =
  "M150,38 Q200,80 250,38 L322,62 Q352,74 366,96 L392,150 Q394,158 386,162 L336,184 Q328,187 324,180 L304,150 L306,404 Q306,414 296,414 L104,414 Q94,414 94,404 L96,150 L76,180 Q72,187 64,184 L14,162 Q6,158 8,150 L34,96 Q48,74 78,62 Z";

const HOODIE =
  "M146,52 Q200,92 254,52 L326,74 Q356,86 366,112 L396,330 Q398,342 386,344 L348,350 Q338,351 336,340 L310,200 L310,404 Q310,416 298,416 L102,416 Q90,416 90,404 L90,200 L64,340 Q62,351 52,350 L14,344 Q2,342 4,330 L34,112 Q44,86 74,74 Z";

function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}

export function Garment({ shape, color, children, className = "" }: { shape: GarmentShape; color: string; children?: ReactNode; className?: string }) {
  const light = isLight(color);
  const stroke = light ? "rgba(0,0,0,0.16)" : "rgba(255,255,255,0.32)";
  const seam = light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)";
  const id = `g-${shape}-${color.slice(1)}`;
  return (
    <svg viewBox="0 0 400 440" className={className} role="img" aria-label={shape === "moletom" ? "Moletom" : shape === "polo" ? "Camisa polo" : "Camiseta"}>
      <defs>
        <linearGradient id={`${id}-shade`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.18" stopColor="#000" stopOpacity="0" />
          <stop offset="0.42" stopColor="#fff" stopOpacity={light ? 0.18 : 0.08} />
          <stop offset="0.82" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.24" />
        </linearGradient>
        <linearGradient id={`${id}-v`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.06" />
          <stop offset="1" stopColor="#000" stopOpacity="0.16" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="426" rx="150" ry="9" fill="#000" opacity="0.35" />
      {shape === "moletom" ? (
        <g>
          <path d="M140,56 Q132,8 200,4 Q268,8 260,56 Q236,96 200,98 Q164,96 140,56 Z" fill={color} stroke={stroke} strokeWidth="2" />
          <path d="M152,58 Q150,24 200,20 Q250,24 248,58 Q228,84 200,86 Q172,84 152,58 Z" fill="#000" opacity="0.28" />
          <path d={HOODIE} fill={color} stroke={stroke} strokeWidth="2" />
          <path d={HOODIE} fill={`url(#${id}-shade)`} />
          <path d={HOODIE} fill={`url(#${id}-v)`} />
          <path d="M132,300 L268,300 L290,370 L110,370 Z" fill="#000" opacity="0.1" stroke={seam} strokeWidth="2" />
          <path d="M184,92 L180,170 M216,92 L220,170" stroke={light ? "#666" : "#ddd"} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          <rect x="90" y="392" width="220" height="24" rx="6" fill="#000" opacity="0.12" />
        </g>
      ) : (
        <g>
          <path d={TEE} fill={color} stroke={stroke} strokeWidth="2" />
          <path d={TEE} fill={`url(#${id}-shade)`} />
          <path d={TEE} fill={`url(#${id}-v)`} />
          {shape === "polo" ? (
            <g>
              <path d="M150,38 L200,96 L176,112 L138,54 Z" fill={color} stroke={stroke} strokeWidth="2" />
              <path d="M250,38 L200,96 L224,112 L262,54 Z" fill={color} stroke={stroke} strokeWidth="2" />
              <path d="M150,38 L200,96 L176,112 L138,54 Z M250,38 L200,96 L224,112 L262,54 Z" fill="#000" opacity="0.12" />
              <rect x="192" y="96" width="16" height="70" rx="3" fill="#000" opacity="0.1" stroke={seam} />
              <circle cx="200" cy="118" r="3.2" fill={light ? "#bbb" : "#888"} />
              <circle cx="200" cy="146" r="3.2" fill={light ? "#bbb" : "#888"} />
            </g>
          ) : (
            <path d="M150,38 Q200,80 250,38 Q246,48 238,53 Q200,90 162,53 Q154,48 150,38 Z" fill="#000" opacity="0.2" />
          )}
          <path d="M96,150 L104,150 M296,150 L304,150" stroke={seam} strokeWidth="2" />
          <path d="M98,398 L302,398" stroke={seam} strokeWidth="2" strokeDasharray="4 4" />
        </g>
      )}
      {children}
    </svg>
  );
}
