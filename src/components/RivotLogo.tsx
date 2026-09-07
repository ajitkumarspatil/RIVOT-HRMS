import React from 'react';

export interface RivotLogoProps {
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'emblem' | 'wordmark';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const RivotLogo: React.FC<RivotLogoProps> = ({
  theme = 'dark',
  size = 'md',
  variant = 'full',
  showTagline = false,
  className = '',
  onClick
}) => {
  const isDark = theme === 'dark';
  const color = isDark ? '#FFFFFF' : '#000000';
  const subTextColor = isDark ? '#9CA3AF' : '#6B7280';

  // Responsive dimensions based on size preset
  const scaleMap = {
    sm: { width: 144, height: 32, emblemSize: 32 },
    md: { width: 192, height: 42, emblemSize: 42 },
    lg: { width: 260, height: 56, emblemSize: 56 },
    xl: { width: 360, height: 78, emblemSize: 78 }
  };

  const dims = scaleMap[size] || scaleMap.md;

  if (variant === 'emblem') {
    return (
      <div 
        className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        <svg
          width={dims.emblemSize}
          height={dims.emblemSize}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-200"
        >
          <g id="rivot-emblem-standalone" fill={color}>
            <circle cx="100" cy="100" r="72" stroke={color} strokeWidth="8.5" fill="none" />
            {/* Upper Aerodynamic Wing */}
            <path d="M 44 64 C 66 73, 84 82, 100 82 C 116 82, 134 73, 156 64 C 160 67, 161 74, 156 79 C 137 87, 118 95, 100 95 C 82 95, 63 87, 44 79 C 39 74, 40 67, 44 64 Z" />
            {/* Lower Aerodynamic Wing (Mirrored) */}
            <path d="M 44 121 C 63 113, 82 105, 100 105 C 118 105, 137 113, 156 121 C 161 126, 160 133, 156 136 C 134 127, 116 118, 100 118 C 84 118, 66 127, 44 136 C 40 133, 39 126, 44 121 Z" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex flex-col items-start select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      <svg
        width={dims.width}
        height={dims.height}
        viewBox="0 0 960 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-200 w-auto h-auto max-w-full"
        style={{ height: dims.height }}
      >
        <g id="rivot-official-brandmark" fill={color}>
          {variant !== 'wordmark' && (
            <g id="rivot-emblem">
              {/* Outer Ring */}
              <circle cx="100" cy="100" r="72" stroke={color} strokeWidth="8.5" fill="none" />
              
              {/* Upper Aerodynamic Wing */}
              <path d="M 44 64 C 66 73, 84 82, 100 82 C 116 82, 134 73, 156 64 C 160 67, 161 74, 156 79 C 137 87, 118 95, 100 95 C 82 95, 63 87, 44 79 C 39 74, 40 67, 44 64 Z" />
              
              {/* Lower Aerodynamic Wing (Mirrored) */}
              <path d="M 44 121 C 63 113, 82 105, 100 105 C 118 105, 137 113, 156 121 C 161 126, 160 133, 156 136 C 134 127, 116 118, 100 118 C 84 118, 66 127, 44 136 C 40 133, 39 126, 44 121 Z" />
            </g>
          )}

          {variant !== 'emblem' && (
            <g id="rivot-wordmark">
              {/* Letter 'R' */}
              <path fillRule="evenodd" clipRule="evenodd" d="
                M 232 158 
                V 68 
                C 232 50, 246 41, 266 41 
                H 322 
                C 342 41, 356 52, 356 72 
                C 356 89, 344 99, 328 102 
                C 342 106, 350 116, 354 132 
                L 358 148 
                C 360 154, 363 158, 368 158 
                H 338 
                C 334 158, 331 154, 329 146 
                L 325 130 
                C 321 116, 314 110, 298 110 
                H 264 
                V 158 
                H 232 Z 
                M 264 64 
                V 88 
                H 320 
                C 328 88, 332 82, 332 76 
                C 332 70, 328 64, 320 64 
                H 264 Z
              " />

              {/* Letter 'I' */}
              <path d="M 388 41 H 420 V 158 H 388 Z" />

              {/* Letter 'V' */}
              <path d="
                M 448 41 
                H 482 
                L 514 126 
                C 517 134, 521 138, 526 138 
                C 531 138, 535 134, 538 126 
                L 570 41 
                H 604 
                L 552 147 
                C 544 162, 534 167, 526 167 
                C 518 167, 508 162, 500 147 
                L 448 41 Z
              " />

              {/* Letter 'O' */}
              <path fillRule="evenodd" clipRule="evenodd" d="
                M 636 76 
                C 636 53, 651 41, 674 41 
                H 736 
                C 759 41, 774 53, 774 76 
                V 123 
                C 774 146, 759 158, 736 158 
                H 674 
                C 651 158, 636 146, 636 123 
                V 76 Z 
                M 668 78 
                V 121 
                C 668 131, 674 136, 684 136 
                H 726 
                C 736 136, 742 131, 742 121 
                V 78 
                C 742 68, 736 63, 726 63 
                H 684 
                C 674 63, 668 68, 668 78 Z
              " />

              {/* Letter 'T' */}
              <path d="
                M 804 41 
                H 942 
                V 66 
                H 889 
                V 158 
                H 857 
                V 66 
                H 804 
                V 41 Z
              " />
            </g>
          )}
        </g>
      </svg>

      {showTagline && (
        <span 
          className="text-[9px] font-semibold tracking-[0.25em] uppercase pl-1 mt-0.5"
          style={{ color: subTextColor }}
        >
          Electric Mobility • HRMS
        </span>
      )}
    </div>
  );
};

export default RivotLogo;
