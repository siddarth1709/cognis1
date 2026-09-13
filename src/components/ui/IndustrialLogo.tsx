import React from "react";

interface IndustrialLogoProps {
  className?: string;
  size?: number;
}

export function IndustrialLogo({ className = "", size = 20 }: IndustrialLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cognis technical mark"
    >
      {/* Central separation axis */}
      <line x1="12" y1="3" x2="12" y2="21" stroke="#282823" strokeWidth="1" />

      {/* Left: Organic neural trace in Bone */}
      <path
        d="M12 5C8.5 5 6 7.5 6 11C6 13.5 7.5 15.5 9.5 16.5C10.5 17 11 18 11.5 19"
        stroke="#EDE9DF"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="6" cy="11" r="1.2" fill="#EDE9DF" />
      <circle cx="9.5" cy="16.5" r="1" fill="#A9A69D" />

      {/* Right: Orthogonal circuit trace in Oxide */}
      <path
        d="M12 5H17V9H19V14H16V19H12"
        stroke="#D8663D"
        strokeWidth="1.2"
        strokeLinecap="square"
      />
      {/* Micro via */}
      <rect x="18" y="8" width="2" height="2" fill="#D8663D" />
      <rect x="15" y="13" width="2" height="2" fill="#A9A69D" />
    </svg>
  );
}
