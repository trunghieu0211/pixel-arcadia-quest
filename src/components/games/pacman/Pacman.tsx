
import React from 'react';

export interface PacmanProps {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  mouthOpen: number; // Value between 0 (closed) and 1 (fully open)
  isEnergized: boolean;
  size: number;
}

const Pacman: React.FC<PacmanProps> = ({
  x,
  y,
  direction,
  mouthOpen,
  isEnergized,
  size
}) => {
  // Calculate the mouth angle based on the mouthOpen value (0 to 1)
  // When mouth is fully open, it's about 60 degrees (or π/3 radians)
  const mouthAngle = (Math.PI / 3) * mouthOpen;
  
  // Calculate center of the pacman
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  
  // Determine start and end angles based on direction
  let startAngle = 0;
  let endAngle = 0;
  
  switch (direction) {
    case 'up':
      startAngle = Math.PI * 1.5 - mouthAngle;
      endAngle = Math.PI * 1.5 + mouthAngle;
      break;
    case 'down':
      startAngle = Math.PI * 0.5 - mouthAngle;
      endAngle = Math.PI * 0.5 + mouthAngle;
      break;
    case 'left':
      startAngle = Math.PI - mouthAngle;
      endAngle = Math.PI + mouthAngle;
      break;
    case 'right':
    default:
      startAngle = -mouthAngle;
      endAngle = mouthAngle;
      break;
  }
  
  // Calculate the path for the pacman shape
  const arcX1 = centerX + Math.cos(startAngle) * size / 2;
  const arcY1 = centerY + Math.sin(startAngle) * size / 2;
  const arcX2 = centerX + Math.cos(endAngle) * size / 2;
  const arcY2 = centerY + Math.sin(endAngle) * size / 2;
  
  // Create the path for the pacman
  // It's a circle with a "mouth" cut out
  const d = [
    `M${centerX},${centerY}`,
    `L${arcX1},${arcY1}`,
    `A${size / 2},${size / 2} 0 1,1 ${arcX2},${arcY2}`,
    'Z'
  ].join(' ');
  
  // Eye position depends on the direction
  let eyeX = centerX;
  let eyeY = centerY;
  
  switch (direction) {
    case 'up':
      eyeX = centerX + size * 0.15;
      eyeY = centerY - size * 0.15;
      break;
    case 'down':
      eyeX = centerX + size * 0.15;
      eyeY = centerY + size * 0.15;
      break;
    case 'left':
      eyeX = centerX - size * 0.15;
      eyeY = centerY - size * 0.15;
      break;
    case 'right':
    default:
      eyeX = centerX + size * 0.15;
      eyeY = centerY - size * 0.15;
      break;
  }
  
  // Colors and effects for regular vs energized state
  const bodyColor = isEnergized ? '#FFFFFF' : '#FFCC00';
  const glowColor = isEnergized ? '#FFFFFF' : '#FFCC00';
  const glowOpacity = isEnergized ? 0.6 : 0.3;
  const glowRadius = isEnergized ? size * 0.7 : size * 0.4;
  
  return (
    <g className="pacman">
      {/* Glow effect */}
      <defs>
        <radialGradient id={`pacman-glow-${isEnergized ? 'energized' : 'normal'}`}>
          <stop offset="0%" stopColor={glowColor} stopOpacity={glowOpacity} />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Main pacman body */}
      <path
        d={d}
        fill={bodyColor}
        className={isEnergized ? 'animate-pulse' : ''}
        style={{
          filter: `drop-shadow(0 0 5px ${glowColor})`,
          transformOrigin: `${centerX}px ${centerY}px`
        }}
      />
      
      {/* Glow circle behind pacman */}
      <circle
        cx={centerX}
        cy={centerY}
        r={glowRadius}
        fill={`url(#pacman-glow-${isEnergized ? 'energized' : 'normal'})`}
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Eye */}
      <circle
        cx={eyeX}
        cy={eyeY}
        r={size * 0.08}
        fill="#000"
      />
      
      {/* Trail effect for energized pacman */}
      {isEnergized && (
        <g className="trail">
          {[0.8, 0.6, 0.4, 0.2].map((opacity, i) => {
            // Calculate trail position based on direction
            let trailX = x;
            let trailY = y;
            
            switch (direction) {
              case 'up':
                trailY = y + (i + 1) * size * 0.1;
                break;
              case 'down':
                trailY = y - (i + 1) * size * 0.1;
                break;
              case 'left':
                trailX = x + (i + 1) * size * 0.1;
                break;
              case 'right':
                trailX = x - (i + 1) * size * 0.1;
                break;
            }
            
            return (
              <circle
                key={i}
                cx={trailX + size / 2}
                cy={trailY + size / 2}
                r={size * 0.3 - i * size * 0.05}
                fill="#FFFFFF"
                opacity={opacity * 0.3}
              />
            );
          })}
        </g>
      )}
    </g>
  );
};

export default Pacman;
