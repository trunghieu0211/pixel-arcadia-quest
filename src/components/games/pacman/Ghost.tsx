
import React from 'react';

export interface GhostProps {
  x: number;
  y: number;
  color: string;
  direction: 'up' | 'down' | 'left' | 'right';
  isScared: boolean;
  size: number;
}

const Ghost: React.FC<GhostProps> = ({
  x,
  y,
  color,
  direction,
  isScared,
  size
}) => {
  // Calculate ghost body
  const ghostSize = size;
  const eyeSize = ghostSize / 5;
  const pupilSize = eyeSize / 2;
  const waveHeight = ghostSize / 6;
  
  // Eyes position based on direction
  const getEyePositions = () => {
    const baseLeftX = x + ghostSize * 0.25;
    const baseRightX = x + ghostSize * 0.75; 
    const baseY = y + ghostSize * 0.35;
    
    switch (direction) {
      case 'up':
        return {
          leftEye: { x: baseLeftX, y: baseY - eyeSize / 3 },
          rightEye: { x: baseRightX, y: baseY - eyeSize / 3 },
          leftPupil: { x: baseLeftX, y: baseY - eyeSize / 1.5 },
          rightPupil: { x: baseRightX, y: baseY - eyeSize / 1.5 }
        };
      case 'down':
        return {
          leftEye: { x: baseLeftX, y: baseY },
          rightEye: { x: baseRightX, y: baseY },
          leftPupil: { x: baseLeftX, y: baseY + eyeSize / 3 },
          rightPupil: { x: baseRightX, y: baseY + eyeSize / 3 }
        };
      case 'left':
        return {
          leftEye: { x: baseLeftX - eyeSize / 3, y: baseY },
          rightEye: { x: baseRightX - eyeSize / 3, y: baseY },
          leftPupil: { x: baseLeftX - eyeSize / 1.5, y: baseY },
          rightPupil: { x: baseRightX - eyeSize / 1.5, y: baseY }
        };
      case 'right':
      default:
        return {
          leftEye: { x: baseLeftX + eyeSize / 3, y: baseY },
          rightEye: { x: baseRightX + eyeSize / 3, y: baseY },
          leftPupil: { x: baseLeftX + eyeSize / 1.5, y: baseY },
          rightPupil: { x: baseRightX + eyeSize / 1.5, y: baseY }
        };
    }
  };
  
  const eyePositions = getEyePositions();
  
  // Scared ghost has blue body with white eyes
  const bodyColor = isScared ? '#2121DE' : color;
  const eyeColor = isScared ? '#FFF' : '#FFF';
  const pupilColor = isScared ? '#2121DE' : '#000';
  
  // For scared ghosts, we'll draw a different mouth
  const mouthPath = isScared 
    ? `M${x + ghostSize * 0.3},${y + ghostSize * 0.6} Q${x + ghostSize * 0.5},${y + ghostSize * 0.5} ${x + ghostSize * 0.7},${y + ghostSize * 0.6}`
    : '';
  
  return (
    <g className="ghost">
      {/* Ghost body */}
      <g>
        {/* Main body */}
        <path
          d={`
            M${x},${y + ghostSize * 0.5}
            a${ghostSize / 2},${ghostSize / 2} 0 0 1 ${ghostSize},0
            v${ghostSize * 0.5}
            h-${ghostSize / 5}
            l-${ghostSize / 5},${waveHeight}
            l-${ghostSize / 5},-${waveHeight}
            l-${ghostSize / 5},${waveHeight}
            l-${ghostSize / 5},-${waveHeight}
            Z
          `}
          fill={bodyColor}
          stroke="none"
          className={`${isScared ? 'animate-pulse' : ''}`}
          style={{
            filter: isScared ? 'none' : `drop-shadow(0 0 5px ${color})`
          }}
        />
        
        {/* Ghost glow effect */}
        <ellipse
          cx={x + ghostSize / 2}
          cy={y + ghostSize * 0.4}
          rx={ghostSize * 0.4}
          ry={ghostSize * 0.15}
          fill="rgba(255, 255, 255, 0.3)"
          style={{ mixBlendMode: 'overlay' }}
        />
      </g>
      
      {/* Eyes */}
      <circle cx={eyePositions.leftEye.x} cy={eyePositions.leftEye.y} r={eyeSize} fill={eyeColor} />
      <circle cx={eyePositions.rightEye.x} cy={eyePositions.rightEye.y} r={eyeSize} fill={eyeColor} />
      
      {/* Pupils */}
      <circle cx={eyePositions.leftPupil.x} cy={eyePositions.leftPupil.y} r={pupilSize} fill={pupilColor} />
      <circle cx={eyePositions.rightPupil.x} cy={eyePositions.rightPupil.y} r={pupilSize} fill={pupilColor} />
      
      {/* Scared mouth (only for scared ghosts) */}
      {isScared && (
        <path
          d={mouthPath}
          stroke="#FFF"
          strokeWidth="2"
          fill="none"
        />
      )}
    </g>
  );
};

export default Ghost;
