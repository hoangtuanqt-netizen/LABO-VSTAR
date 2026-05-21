import React from 'react';

interface VStarLogoProps {
  className?: string; // Additional wrapper classes
  iconOnly?: boolean;  // Render only the golden tooth icon
  light?: boolean;     // Adjust text color for dark/light backgrounds
  size?: 'sm' | 'md' | 'lg' | 'xl';
  logoStyle?: React.CSSProperties; // Custom styles for the SVG element
}

export default function VStarLogo({ 
  className = '', 
  iconOnly = false, 
  light = false,
  size = 'md',
  logoStyle
}: VStarLogoProps) {
  
  // Dimensions map based on size input
  const dimensionsMap = {
    sm: { iconWidth: 'w-7 h-7', textClass: 'text-[15px]', subTextClass: 'text-[7px]' },
    md: { iconWidth: 'w-10 h-10', textClass: 'text-2xl', subTextClass: 'text-[9.5px]' },
    lg: { iconWidth: 'w-14 h-14', textClass: 'text-3.5xl', subTextClass: 'text-[11.5px]' },
    xl: { iconWidth: 'w-20 h-20', textClass: 'text-5xl', subTextClass: 'text-[15px]' }
  };

  const { iconWidth, textClass, subTextClass } = dimensionsMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      
      {/* 1. STYLIZED GOLDEN TOOTH ICON (VECTOR SVG) */}
      <div 
        className={`shrink-0 ${logoStyle?.width ? '' : iconWidth} relative group`}
        style={logoStyle ? { width: logoStyle.width, height: logoStyle.height } : undefined}
      >
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          className="w-full h-full transform transition-transform duration-300 group-hover:scale-105"
          style={logoStyle}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definitions for Premium Linear Gold Gradient */}
          <defs>
            <linearGradient id="vstarGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dfab6c" />
              <stop offset="50%" stopColor="#fae1b4" />
              <stop offset="100%" stopColor="#ca9251" />
            </linearGradient>
            <linearGradient id="vstarSoftGold" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ca9251" opacity="0.1" />
              <stop offset="100%" stopColor="#fae1b4" opacity="0" />
            </linearGradient>
          </defs>

          {/* Golden Ambient inner glow */}
          <path 
            d="M 33 74 C 22 64 18 45 22 35 C 26 23 38 23 48 31 C 53 36 57 36 62 31 C 72 23 84 23 88 35 C 92 45 88 64 77 74 C 70 81 60 81 55 81"
            fill="url(#vstarSoftGold)"
            className="transition-opacity duration-300 group-hover:opacity-60"
          />

          {/* Calligraphic Molar Outline (Smooth Bezier) */}
          <path 
            d="M 33 74 C 22 64 18 45 22 35 C 26 23 38 23 48 31 C 53 36 57 36 62 31 C 72 23 84 23 88 35 C 92 45 88 64 77 74 C 70 81 60 83 55 83" 
            stroke="url(#vstarGoldGrad)" 
            strokeWidth="5.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Inner root splitter line */}
          <path 
            d="M 55 52 C 55 64 48 76 41 81" 
            stroke="url(#vstarGoldGrad)" 
            strokeWidth="4.5" 
            strokeLinecap="round" 
          />

          {/* Secondary smile curvature / highlight inside */}
          <path 
            d="M 64 55 C 67 65 67 71 58 78" 
            stroke="url(#vstarGoldGrad)" 
            strokeWidth="3.2" 
            strokeLinecap="round" 
            opacity="0.85"
          />
        </svg>

        {/* Small subtle gold point at top right of the tooth box */}
        <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-brand-gold rounded-full opacity-60"></span>
      </div>

      {/* 2. BRAND TYPOGRAPHY PANEL */}
      {!iconOnly && (
        <div className="flex flex-col justify-center leading-none">
          {/* V STAR block with optional light/dark configuration */}
          <div className="flex items-baseline">
            <span 
              className={`font-display font-black leading-none uppercase tracking-wide transition-colors ${textClass} ${
                light ? 'text-white' : 'text-[#0162a3]'
              }`}
            >
              V STAR
            </span>
          </div>

          {/* "digital dentallab ◡" row */}
          <div className="flex items-center gap-1 mt-1">
            <span 
              className={`font-sans font-medium tracking-wide transition-colors ${subTextClass} ${
                light ? 'text-slate-400' : 'text-[#0089d0]'
              }`}
            >
              digital dentallab
            </span>
            {/* The signature curve smile icon next to dentallab */}
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              className={`w-3.5 h-2.5 transition-colors ${
                light ? 'text-brand-gold/80' : 'text-[#0089d0]'
              }`}
              stroke="currentColor" 
              strokeWidth="2.8"
              strokeLinecap="round"
            >
              <path d="M4,10 C8,18 16,18 20,10" />
            </svg>
          </div>
        </div>
      )}

    </div>
  );
}
