import { useId } from "react";

/** App mark: a dumbbell whose bar is a heartbeat line, on the accent gradient. */
export function Logo({ size = 36, className = "" }: { size?: number; className?: string }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className={className} role="img" aria-label="Workout Planner">
      <defs>
        <linearGradient id={`${id}bg`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#a3e635" />
        </linearGradient>
        <linearGradient id={`${id}shine`} x1="24" y1="0" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${id}bg)`} />
      <rect x="1" y="1" width="46" height="46" rx="13" fill={`url(#${id}shine)`} />
      <g fill="#03200f">
        <rect x="5.5" y="19" width="3.5" height="10" rx="1.75" />
        <rect x="10" y="14.5" width="4.5" height="19" rx="2.25" />
        <rect x="33.5" y="14.5" width="4.5" height="19" rx="2.25" />
        <rect x="39" y="19" width="3.5" height="10" rx="1.75" />
      </g>
      <path
        className="logo-pulse"
        d="M14.5 24h4l2.6-6.5 4.6 13 2.8-8.5 1.5 2h3.5"
        fill="none"
        stroke="#03200f"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
