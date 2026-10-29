import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  asLink?: boolean;
}

export const ScaleMintLogo: React.FC<LogoProps> = ({
  className = '',
  iconOnly = false,
  size = 'md',
  asLink = true
}) => {
  const iconDimensions = {
    sm: { w: 26, h: 26 },
    md: { w: 34, h: 34 },
    lg: { w: 44, h: 44 }
  }[size];

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      {/* Original Custom ScaleMint Emblem */}
      <svg
        width={iconDimensions.w}
        height={iconDimensions.h}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="sm-gradient-primary" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F5A0" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="sm-gradient-facet" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#064E3B" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="sm-gradient-glow" x1="24" y1="12" x2="24" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#00F5A0" stopOpacity="0.2" />
          </linearGradient>

          <filter id="sm-drop-glow" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Hexagonal Shield Ring */}
        <polygon
          points="24,3 43,14 43,34 24,45 5,34 5,14"
          fill="#0B132B"
          stroke="url(#sm-gradient-primary)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Inner Scaling Mint Facets (Interlocking Growth Geometry) */}
        {/* Top/Left Tier */}
        <path
          d="M24 7L38 15L24 23L10 15L24 7Z"
          fill="url(#sm-gradient-facet)"
          fillOpacity="0.75"
        />
        
        {/* Ascending Right Step */}
        <path
          d="M24 23L38 15V29L24 37V23Z"
          fill="url(#sm-gradient-primary)"
          fillOpacity="0.9"
        />

        {/* Foundation Left Step */}
        <path
          d="M10 15L24 23V37L10 29V15Z"
          fill="#064E3B"
          fillOpacity="0.95"
        />

        {/* Central Mint Core Spark Node */}
        <circle cx="24" cy="23" r="3" fill="#FFFFFF" />
        <circle cx="24" cy="23" r="6" fill="#00F5A0" fillOpacity="0.4" />
      </svg>

      {!iconOnly && (
        <span className={`inline-flex items-baseline ${textSizes}`}>
          <span className="text-white font-extrabold tracking-tight">Scale</span>
          <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent font-black">
            Mint
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link href="/" className="group inline-flex items-center" aria-label="ScaleMint Home">
        {content}
      </Link>
    );
  }

  return content;
};
