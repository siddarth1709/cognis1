import React from "react";

interface SplitBrainLogoProps {
  className?: string;
  size?: number;
}

export function SplitBrainLogo({ className = "", size = 26 }: SplitBrainLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cognis split-brain logo"
    >
      <defs>
        <linearGradient id="cognisLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5CEBFF" />
          <stop offset="100%" stopColor="#8B7CFF" />
        </linearGradient>
      </defs>

      {/* Central Divider Axis */}
      <line
        x1="16"
        y1="5"
        x2="16"
        y2="27"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />

      {/* Left Hemisphere: Organic Neural Pathway */}
      <path
        d="M16 7C11.5 7 8 10.2 8 14.5C8 17.5 9.8 20.2 12.5 21.5C13.8 22.1 14.8 23.5 15.2 25"
        stroke="url(#cognisLogoGrad)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12.5 13C10.5 14 10 16.5 11 18.5"
        stroke="#5CEBFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
      <circle cx="8" cy="14.5" r="1.5" fill="#5CEBFF" />
      <circle cx="12.5" cy="13" r="1.2" fill="#5CEBFF" />
      <circle cx="11" cy="18.5" r="1.2" fill="#8B7CFF" />

      {/* Right Hemisphere: Precise Circuit & Grid Architecture */}
      <path
        d="M16 7H21V12H24V17H21V22H16"
        stroke="#A7B0BD"
        strokeWidth="1.3"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path
        d="M21 12H26V15"
        stroke="url(#cognisLogoGrad)"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
      <path
        d="M18 19.5H23.5"
        stroke="#8B7CFF"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
      {/* Precision Circuit Nodes (Vias) */}
      <rect x="23" y="11" width="2" height="2" fill="#5CEBFF" />
      <rect x="25" y="14" width="2" height="2" fill="#8B7CFF" />
      <rect x="20" y="21" width="2" height="2" fill="#A7B0BD" />
      <rect x="22.5" y="18.5" width="2" height="2" fill="#5CEBFF" />

      {/* Origin Core */}
      <circle cx="16" cy="16" r="2.2" fill="#07090D" stroke="url(#cognisLogoGrad)" strokeWidth="1.5" />
    </svg>
  );
}
