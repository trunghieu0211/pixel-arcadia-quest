
import React from 'react';

type Position = { x: number; y: number };

interface DotProps {
  position: Position;
  cellSize: number;
}

export const Dot: React.FC<DotProps> = ({ position, cellSize }) => {
  return (
    <div
      className="absolute rounded-full bg-white"
      style={{
        width: cellSize / 6,
        height: cellSize / 6,
        left: position.x * cellSize + cellSize / 2 - cellSize / 12,
        top: position.y * cellSize + cellSize / 2 - cellSize / 12,
      }}
    />
  );
};

interface PowerPelletProps {
  position: Position;
  cellSize: number;
  pulsing?: boolean;
}

export const PowerPellet: React.FC<PowerPelletProps> = ({ position, cellSize, pulsing = true }) => {
  return (
    <div
      className={`absolute rounded-full bg-white ${pulsing ? 'animate-pulse' : ''}`}
      style={{
        width: cellSize / 2.5,
        height: cellSize / 2.5,
        left: position.x * cellSize + cellSize / 2 - cellSize / 5,
        top: position.y * cellSize + cellSize / 2 - cellSize / 5,
        boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)',
      }}
    />
  );
};

interface PacmanProps {
  position: Position;
  cellSize: number;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  mouthOpen: boolean;
}

export const Pacman: React.FC<PacmanProps> = ({ position, cellSize, direction, mouthOpen }) => {
  // Calculate rotation based on direction
  let rotation = 0;
  switch (direction) {
    case 'RIGHT':
      rotation = 0;
      break;
    case 'DOWN':
      rotation = 90;
      break;
    case 'LEFT':
      rotation = 180;
      break;
    case 'UP':
      rotation = 270;
      break;
  }

  // Calculate arc angles
  const mouthAngle = mouthOpen ? 60 : 10;
  const startAngle = (mouthAngle / 2) * (Math.PI / 180);
  const endAngle = (360 - mouthAngle / 2) * (Math.PI / 180);

  return (
    <div
      className="absolute"
      style={{
        width: cellSize,
        height: cellSize,
        left: position.x * cellSize,
        top: position.y * cellSize,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <svg width={cellSize} height={cellSize} viewBox="0 0 100 100">
        <path
          d={`M50,50 L${50 + 40 * Math.cos(startAngle)},${50 - 40 * Math.sin(startAngle)} A40,40 0 1,1 ${
            50 + 40 * Math.cos(endAngle)
          },${50 - 40 * Math.sin(endAngle)} Z`}
          fill="#FFFF00"
          stroke="#FFFF00"
          strokeWidth="1"
          className="drop-shadow-lg shadow-yellow-500"
        />
      </svg>
    </div>
  );
};

interface GhostProps {
  position: Position;
  cellSize: number;
  color: string;
  frightened?: boolean;
  direction?: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
}

export const Ghost: React.FC<GhostProps> = ({ position, cellSize, color, frightened = false, direction = 'RIGHT' }) => {
  // Ghost color based on state
  const ghostColor = frightened ? '#2121DE' : color;
  
  // Eye positioning based on direction
  let eyeOffsetX = 0;
  let eyeOffsetY = 0;
  
  switch (direction) {
    case 'RIGHT':
      eyeOffsetX = cellSize / 12;
      break;
    case 'LEFT':
      eyeOffsetX = -cellSize / 12;
      break;
    case 'DOWN':
      eyeOffsetY = cellSize / 12;
      break;
    case 'UP':
      eyeOffsetY = -cellSize / 12;
      break;
  }

  return (
    <div
      className="absolute"
      style={{
        width: cellSize,
        height: cellSize,
        left: position.x * cellSize,
        top: position.y * cellSize,
        opacity: frightened ? 0.7 : 0.9,
      }}
    >
      <svg width={cellSize} height={cellSize} viewBox="0 0 100 100">
        {/* Ghost body */}
        <path
          d={`M20,50 A30,30 0 0,1 80,50 L80,80 C80,80 75,70 70,80 C65,90 60,80 55,80 C50,80 45,90 40,80 C35,70 30,80 30,80 L20,80 Z`}
          fill={ghostColor}
          className={frightened ? 'animate-pulse' : ''}
          style={{
            filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))',
          }}
        />
        
        {/* Eyes */}
        <circle cx="35" cy="45" r="8" fill="white" />
        <circle cx="65" cy="45" r="8" fill="white" />
        
        {/* Pupils */}
        <circle
          cx={`${35 + eyeOffsetX * 4}`}
          cy={`${45 + eyeOffsetY * 4}`}
          r="4"
          fill="black"
        />
        <circle
          cx={`${65 + eyeOffsetX * 4}`}
          cy={`${45 + eyeOffsetY * 4}`}
          r="4"
          fill="black"
        />
        
        {/* Frightened mode extra details */}
        {frightened && (
          <path
            d="M30,65 Q40,55 50,65 Q60,55 70,65"
            stroke="white"
            strokeWidth="2"
            fill="transparent"
          />
        )}
      </svg>
    </div>
  );
};
