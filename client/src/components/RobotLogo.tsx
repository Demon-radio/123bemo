import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface RobotLogoProps extends HTMLAttributes<SVGElement> {
  size?: number;
  className?: string;
}

export function RobotLogo({ size = 40, className, ...props }: RobotLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("", className)}
      {...props}
    >
      {/* Antenna */}
      <circle cx="100" cy="30" r="15" fill="currentColor" />
      <rect x="95" y="30" width="10" height="25" fill="currentColor" />
      
      {/* Head */}
      <rect x="50" y="55" width="100" height="85" rx="15" fill="currentColor" />
      <rect
        x="60"
        y="65"
        width="80"
        height="65"
        rx="10"
        stroke="#0A0E17"
        strokeWidth="5"
        fill="none"
      />
      
      {/* Eyes - happy curved eyes */}
      <path
        d="M75 85 Q 80 75, 85 85"
        stroke="#0A0E17"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M115 85 Q 110 75, 105 85"
        stroke="#0A0E17"
        strokeWidth="5"
        strokeLinecap="round"
      />
      
      {/* Smile */}
      <path
        d="M80 105 Q 100 120, 120 105"
        stroke="#0A0E17"
        strokeWidth="5"
        strokeLinecap="round"
      />
      
      {/* Body elements */}
      <rect x="45" y="140" width="30" height="10" rx="3" fill="currentColor" />
      <rect x="125" y="140" width="30" height="10" rx="3" fill="currentColor" />
      
      {/* Control panel on body */}
      <rect x="70" y="150" width="25" height="7" rx="2" fill="#0A0E17" />
      <rect x="70" y="162" width="25" height="7" rx="2" fill="#0A0E17" />
      <circle cx="120" cy="158" r="10" fill="#0A0E17" />
      
      {/* Feet */}
      <rect x="70" y="180" width="20" height="20" rx="3" fill="currentColor" />
      <rect x="110" y="180" width="20" height="20" rx="3" fill="currentColor" />
    </svg>
  );
}
