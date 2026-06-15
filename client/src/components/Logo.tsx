import type { CSSProperties } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

const sizes = { sm: 28, md: 36, lg: 48 };

export default function Logo({ size = "md", showText = true }: LogoProps) {
  const px = sizes[size];

  return (
    <div className="logo" style={{ "--logo-size": `${px}px` } as CSSProperties}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <linearGradient id="taskify-grad" x1="4" y1="4" x2="44" y2="44">
            <stop stopColor="#6366f1" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect width="48" height="48" rx="12" fill="url(#taskify-grad)" />
        <path
          d="M14 24.5L20.5 31L34 17"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="30" y="10" width="8" height="8" rx="2" fill="white" fillOpacity="0.9" />
      </svg>
      {showText && <span className="logo-text">Taskify</span>}
    </div>
  );
}
