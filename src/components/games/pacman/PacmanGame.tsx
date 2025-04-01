
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PacmanMaze, MazeType } from './PacmanMaze';
import { Ghost } from './Ghost';
import { Pacman } from './Pacman';
import { Dot, PowerPellet } from './GameElements';
import { cn } from '@/lib/utils';

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'LEVEL_COMPLETE';
type Position = { x: number; y: number };
type PowerUpState = {
  active: boolean;
  timeRemaining: number;
  type: 'SPEED' | 'INVINCIBLE' | 'POWER_PELLET';
};

// Constants
const CELL_SIZE = 24; // Size of each cell in pixels
const GAME_SPEED = 150; // ms between moves
const POWER_UP_DURATION = 10000; // 10 seconds
const GHOST_COUNT = 4;

const COLORS = {
  pacman: '#FFFF00', // Yellow
  maze: {
    default: '#0000FF', // Blue
    neon: '#00FFFF', // Cyan
    dark: '#000088', // Dark blue
    retro: '#2121DE', // Classic arcade blue
    modern: '#3333FF', // Brighter blue
  },
  dots: '#FFFFFF', // White
  powerPellet: '#FFFFFF', // White with pulsing effect
};

interface PacmanGameProps {
  selectedMaze: MazeType;
}

const PacmanGame: React.FC<PacmanGameProps> = ({ selectedMaze = 'classic' }) => {
  const mainCanvasRef = useRef<HTMLCanvasElement>(null);
  const effectsCanvasRef = useRef<HTMLCanvasElement>(null);
  const miniMapCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  
  const [pacmanPosition, setPacmanPosition] = useState<Position>({ x: 1, y: 1 });
  const [pacmanDirection, setPacmanDirection] = useState<Direction>('RIGHT');
  const [pacmanNextDirection, setPacmanNextDirection] = useState<Direction>('RIGHT');
  const [pacmanMouthOpen, setPacmanMouthOpen] = useState(true);
  
  const [ghosts, setGhosts] = useState<Array<{
    position: Position;
    direction: Direction;
    color: string;
    frightened: boolean;
  }>>([]);
  
  const [dots, setDots] = useState<Position[]>([]);
  const [powerPellets, setPowerPellets] = useState<Position[]>([]);
  const [powerUp, setPowerUp] = useState<PowerUpState>({
    active: false,
    timeRemaining: 0,
    type: 'POWER_PELLET',
  });
  
  const [mazeData, setMazeData] = useState<number[][]>([]);
  const [mazeSize, setMazeSize] = useState({ width: 0, height: 0 });
  const [cameraZoom, setCameraZoom] = useState(1);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const mouthAnimationRef = useRef<NodeJS.Timeout | null>(null);
  const powerUpTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Initialize the game
  const initGame = useCallback(() => {
    // Clear any existing timers
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    if (mouthAnimationRef.current) {
      clearInterval(mouthAnimationRef.current);
      mouthAnimationRef.current = null;
    }
    
    if (powerUpTimerRef.current) {
      clearInterval(powerUpTimerRef.current);
      powerUpTimerRef.current = null;
    }
    
    // Initialize maze data based on selected maze
    const { maze, pacmanStart, ghostStarts, dotPositions, powerPelletPositions } = 
      PacmanMaze.getMaze(selectedMaze);
    
    setMazeData(maze);
    setMazeSize({
      width: maze[0].length,
      height: maze.length,
    });
    
    // Initialize pacman
    setPacmanPosition(pacmanStart);
    setPacmanDirection('RIGHT');
    setPacmanNextDirection('RIGHT');
    setPacmanMouthOpen(true);
    
    // Initialize ghosts
    setGhosts(
      ghostStarts.map((pos, index) => ({
        position: pos,
        direction: ['UP', 'DOWN', 'LEFT', 'RIGHT'][index % 4] as Direction,
        color: ['#FF0000', '#FFC0CB', '#00FFFF', '#FFA500'][index % 4],
        frightened: false,
      }))
    );
    
    // Initialize dots and power pellets
    setDots(dotPositions);
    setPowerPellets(powerPelletPositions);
    
    // Reset game state
    setScore(0);
    setLives(3);
    setLevel(1);
    setPowerUp({
      active: false,
      timeRemaining: 0,
      type: 'POWER_PELLET',
    });
    setCameraZoom(1);
    
    // Reset game state
    setGameState('IDLE');
    
    // Draw the initial state
    requestAnimationFrame(draw);
  }, [selectedMaze]);

  // Main game logic function - move pacman, check collisions, etc.
  const gameTick = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    
    // Move Pacman
    setPacmanPosition((prevPos) => {
      // Try to move in the next direction if possible
      const nextPos = getNextPosition(prevPos, pacmanNextDirection);
      if (isValidMove(nextPos)) {
        setPacmanDirection(pacmanNextDirection);
        return nextPos;
      }
      
      // If not possible, continue in the current direction
      const currentNextPos = getNextPosition(prevPos, pacmanDirection);
      if (isValidMove(currentNextPos)) {
        return currentNextPos;
      }
      
      // If can't move at all, stay in place
      return prevPos;
    });
    
    // Animate Pacman's mouth
    setPacmanMouthOpen((prev) => !prev);
    
    // Move ghosts
    setGhosts((prevGhosts) => 
      prevGhosts.map((ghost) => {
        if (ghost.frightened) {
          // Frightened ghosts move randomly
          const possibleDirections = getPossibleDirections(ghost.position);
          const randomDirection = possibleDirections[
            Math.floor(Math.random() * possibleDirections.length)
          ];
          
          return {
            ...ghost,
            position: getNextPosition(ghost.position, randomDirection),
            direction: randomDirection,
          };
        } else {
          // Normal ghosts use AI to target pacman
          const newDirection = getGhostDirection(ghost.position, ghost.direction);
          return {
            ...ghost,
            position: getNextPosition(ghost.position, newDirection),
            direction: newDirection,
          };
        }
      })
    );
    
    // Check for dot collection
    setDots((prevDots) => {
      const newDots = prevDots.filter(
        (dot) => !(dot.x === pacmanPosition.x && dot.y === pacmanPosition.y)
      );
      
      if (newDots.length !== prevDots.length) {
        // Dot collected
        setScore((prev) => prev + 10);
      }
      
      return newDots;
    });
    
    // Check for power pellet collection
    setPowerPellets((prevPellets) => {
      const newPellets = prevPellets.filter(
        (pellet) => !(pellet.x === pacmanPosition.x && pellet.y === pacmanPosition.y)
      );
      
      if (newPellets.length !== prevPellets.length) {
        // Power pellet collected
        setScore((prev) => prev + 50);
        activatePowerUp('POWER_PELLET');
      }
      
      return newPellets;
    });
    
    // Check for ghost collisions
    const collidedGhostIndex = ghosts.findIndex(
      (ghost) => ghost.position.x === pacmanPosition.x && ghost.position.y === pacmanPosition.y
    );
    
    if (collidedGhostIndex !== -1) {
      const collidedGhost = ghosts[collidedGhostIndex];
      
      if (collidedGhost.frightened) {
        // Eat the ghost
        setScore((prev) => prev + 200);
        setGhosts((prevGhosts) => 
          prevGhosts.map((ghost, index) => 
            index === collidedGhostIndex
              ? {
                  ...ghost,
                  position: { x: Math.floor(mazeSize.width / 2), y: Math.floor(mazeSize.height / 2) },
                  frightened: false,
                }
              : ghost
          )
        );
      } else if (powerUp.active && powerUp.type === 'INVINCIBLE') {
        // Invincible - do nothing
      } else {
        // Lose a life
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            endGame();
          } else {
            resetPositions();
          }
          return newLives;
        });
      }
    }
    
    // Check for level completion
    if (dots.length === 0 && powerPellets.length === 0) {
      completeLevel();
    }
    
    // Update power-up time
    if (powerUp.active) {
      setPowerUp((prev) => ({
        ...prev,
        timeRemaining: prev.timeRemaining - GAME_SPEED,
      }));
      
      if (powerUp.timeRemaining <= 0) {
        deactivatePowerUp();
      }
    }
  }, [gameState, pacmanPosition, pacmanDirection, pacmanNextDirection, ghosts, dots, powerPellets, powerUp, mazeSize]);

  // Helper function to get valid next position
  const getNextPosition = (position: Position, direction: Direction): Position => {
    switch (direction) {
      case 'UP':
        return { x: position.x, y: position.y - 1 };
      case 'DOWN':
        return { x: position.x, y: position.y + 1 };
      case 'LEFT':
        return { x: position.x - 1, y: position.y };
      case 'RIGHT':
        return { x: position.x + 1, y: position.y };
    }
  };

  // Helper function to check if a move is valid
  const isValidMove = (position: Position): boolean => {
    // Check if position is within bounds
    if (
      position.x < 0 ||
      position.y < 0 ||
      position.x >= mazeSize.width ||
      position.y >= mazeSize.height
    ) {
      return false;
    }
    
    // Check if position is a wall
    return mazeData[position.y][position.x] !== 1;
  };

  // Get possible directions for ghosts
  const getPossibleDirections = (position: Position): Direction[] => {
    const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
    return directions.filter((dir) => isValidMove(getNextPosition(position, dir)));
  };

  // Simplified ghost AI
  const getGhostDirection = (position: Position, currentDirection: Direction): Direction => {
    // 80% chance to continue in same direction if possible
    if (Math.random() < 0.8) {
      const nextPos = getNextPosition(position, currentDirection);
      if (isValidMove(nextPos)) {
        return currentDirection;
      }
    }
    
    // Get all possible directions
    const possibleDirections = getPossibleDirections(position);
    if (possibleDirections.length === 0) return currentDirection;
    
    // Choose random direction
    return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
  };

  // Activate a power-up
  const activatePowerUp = (type: PowerUpState['type']) => {
    setPowerUp({
      active: true,
      timeRemaining: POWER_UP_DURATION,
      type,
    });
    
    // Make ghosts frightened if it's a power pellet
    if (type === 'POWER_PELLET') {
      setGhosts((prevGhosts) =>
        prevGhosts.map((ghost) => ({
          ...ghost,
          frightened: true,
        }))
      );
      
      // Add a screen flash effect
      const effectsCanvas = effectsCanvasRef.current;
      if (effectsCanvas) {
        const ctx = effectsCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(0, 0, effectsCanvas.width, effectsCanvas.height);
          setTimeout(() => {
            ctx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
          }, 300);
        }
      }
    }
    
    // Slow down game if it's a speed power-up
    if (type === 'SPEED') {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = setInterval(gameTick, GAME_SPEED * 1.5);
      }
    }
    
    // Set a timer to deactivate the power-up
    if (powerUpTimerRef.current) {
      clearTimeout(powerUpTimerRef.current);
    }
    powerUpTimerRef.current = setTimeout(() => {
      deactivatePowerUp();
    }, POWER_UP_DURATION);
  };

  // Deactivate the current power-up
  const deactivatePowerUp = () => {
    setPowerUp({
      active: false,
      timeRemaining: 0,
      type: 'POWER_PELLET',
    });
    
    // Reset ghosts to normal
    setGhosts((prevGhosts) =>
      prevGhosts.map((ghost) => ({
        ...ghost,
        frightened: false,
      }))
    );
    
    // Reset game speed if needed
    if (powerUp.type === 'SPEED' && gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = setInterval(gameTick, GAME_SPEED);
    }
  };

  // Reset positions after losing a life
  const resetPositions = () => {
    // Get pacman and ghost starting positions
    const { pacmanStart, ghostStarts } = PacmanMaze.getMaze(selectedMaze);
    
    // Reset pacman
    setPacmanPosition(pacmanStart);
    setPacmanDirection('RIGHT');
    setPacmanNextDirection('RIGHT');
    
    // Reset ghosts
    setGhosts((prevGhosts) =>
      prevGhosts.map((ghost, index) => ({
        ...ghost,
        position: ghostStarts[index % ghostStarts.length],
        frightened: false,
      }))
    );
    
    // Deactivate any active power-ups
    deactivatePowerUp();
    
    // Pause briefly
    setGameState('PAUSED');
    setTimeout(() => {
      setGameState('PLAYING');
    }, 1000);
  };

  // Complete a level
  const completeLevel = () => {
    setGameState('LEVEL_COMPLETE');
    
    // Clear game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Show toast
    toast({
      title: "Level Complete!",
      description: `Score: ${score}`,
      variant: "default",
    });
    
    // Move to next level after a delay
    setTimeout(() => {
      setLevel((prev) => prev + 1);
      
      // Reinitialize the game with increased difficulty
      initGame();
    }, 3000);
  };

  // End game
  const endGame = () => {
    setGameState('GAME_OVER');
    
    // Clear game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    // Update high score if needed
    if (score > highScore) {
      setHighScore(score);
    }
    
    // Show toast
    toast({
      title: "Game Over!",
      description: `Final Score: ${score}`,
      variant: "destructive",
    });
  };

  // Draw the game
  const draw = useCallback(() => {
    const canvas = mainCanvasRef.current;
    const effectsCanvas = effectsCanvasRef.current;
    const miniMapCanvas = miniMapCanvasRef.current;
    
    if (!canvas || !effectsCanvas || !miniMapCanvas || !mazeData.length) return;
    
    const ctx = canvas.getContext('2d');
    const effectsCtx = effectsCanvas.getContext('2d');
    const miniMapCtx = miniMapCanvas.getContext('2d');
    
    if (!ctx || !effectsCtx || !miniMapCtx) return;
    
    // Clear canvases
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);
    miniMapCtx.clearRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
    
    // Set canvas sizes based on maze dimensions
    const canvasWidth = mazeSize.width * CELL_SIZE;
    const canvasHeight = mazeSize.height * CELL_SIZE;
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    effectsCanvas.width = canvasWidth;
    effectsCanvas.height = canvasHeight;
    
    // Apply zoom effect
    ctx.save();
    ctx.scale(cameraZoom, cameraZoom);
    effectsCtx.save();
    effectsCtx.scale(cameraZoom, cameraZoom);
    
    // Draw maze
    for (let y = 0; y < mazeSize.height; y++) {
      for (let x = 0; x < mazeSize.width; x++) {
        const cell = mazeData[y][x];
        
        if (cell === 1) {
          // Wall
          const baseColor = COLORS.maze[selectedMaze as keyof typeof COLORS.maze] || COLORS.maze.default;
          
          // Create gradient for walls
          const gradient = ctx.createLinearGradient(
            x * CELL_SIZE,
            y * CELL_SIZE,
            (x + 1) * CELL_SIZE,
            (y + 1) * CELL_SIZE
          );
          
          gradient.addColorStop(0, baseColor);
          gradient.addColorStop(1, shadeColor(baseColor, -20));
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          
          // Add neon glow effect to walls
          effectsCtx.shadowBlur = 8;
          effectsCtx.shadowColor = baseColor;
          effectsCtx.strokeStyle = lightenColor(baseColor, 30);
          effectsCtx.lineWidth = 2;
          effectsCtx.strokeRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
          effectsCtx.shadowBlur = 0;
        }
      }
    }
    
    // Draw dots
    dots.forEach((dot) => {
      // Regular dot
      ctx.fillStyle = COLORS.dots;
      ctx.beginPath();
      ctx.arc(
        dot.x * CELL_SIZE + CELL_SIZE / 2,
        dot.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // Draw power pellets with pulsing effect
    powerPellets.forEach((pellet) => {
      const pulseSize = Math.sin(Date.now() / 200) * 2 + 6;
      
      // Glow effect
      effectsCtx.shadowBlur = 10;
      effectsCtx.shadowColor = COLORS.powerPellet;
      
      effectsCtx.fillStyle = COLORS.powerPellet;
      effectsCtx.beginPath();
      effectsCtx.arc(
        pellet.x * CELL_SIZE + CELL_SIZE / 2,
        pellet.y * CELL_SIZE + CELL_SIZE / 2,
        pulseSize,
        0,
        Math.PI * 2
      );
      effectsCtx.fill();
      
      effectsCtx.shadowBlur = 0;
    });
    
    // Draw Pacman
    const pacmanX = pacmanPosition.x * CELL_SIZE + CELL_SIZE / 2;
    const pacmanY = pacmanPosition.y * CELL_SIZE + CELL_SIZE / 2;
    const pacmanRadius = CELL_SIZE / 2 - 2;
    
    // Glow effect
    effectsCtx.shadowBlur = 15;
    effectsCtx.shadowColor = COLORS.pacman;
    
    effectsCtx.fillStyle = COLORS.pacman;
    effectsCtx.beginPath();
    
    // Calculate mouth angle based on direction and animation state
    let startAngle = 0;
    let endAngle = 2 * Math.PI;
    
    if (pacmanMouthOpen) {
      switch (pacmanDirection) {
        case 'RIGHT':
          startAngle = 0.25 * Math.PI;
          endAngle = 1.75 * Math.PI;
          break;
        case 'DOWN':
          startAngle = 0.75 * Math.PI;
          endAngle = 0.25 * Math.PI;
          break;
        case 'LEFT':
          startAngle = 1.25 * Math.PI;
          endAngle = 0.75 * Math.PI;
          break;
        case 'UP':
          startAngle = 1.75 * Math.PI;
          endAngle = 1.25 * Math.PI;
          break;
      }
    }
    
    effectsCtx.arc(pacmanX, pacmanY, pacmanRadius, startAngle, endAngle);
    effectsCtx.lineTo(pacmanX, pacmanY);
    effectsCtx.fill();
    
    // Add light trail effect
    if (gameState === 'PLAYING') {
      effectsCtx.globalAlpha = 0.3;
      effectsCtx.fillStyle = COLORS.pacman;
      
      // Draw trail based on direction
      let trailX = pacmanX;
      let trailY = pacmanY;
      
      switch (pacmanDirection) {
        case 'RIGHT':
          trailX -= CELL_SIZE / 2;
          break;
        case 'DOWN':
          trailY -= CELL_SIZE / 2;
          break;
        case 'LEFT':
          trailX += CELL_SIZE / 2;
          break;
        case 'UP':
          trailY += CELL_SIZE / 2;
          break;
      }
      
      effectsCtx.beginPath();
      effectsCtx.arc(trailX, trailY, pacmanRadius / 2, 0, 2 * Math.PI);
      effectsCtx.fill();
      effectsCtx.globalAlpha = 1.0;
    }
    
    effectsCtx.shadowBlur = 0;
    
    // Draw ghosts
    ghosts.forEach((ghost) => {
      const ghostX = ghost.position.x * CELL_SIZE + CELL_SIZE / 2;
      const ghostY = ghost.position.y * CELL_SIZE + CELL_SIZE / 2;
      
      // Glow effect
      effectsCtx.shadowBlur = 10;
      effectsCtx.shadowColor = ghost.frightened ? '#2121DE' : ghost.color;
      
      // Set ghost color based on state
      effectsCtx.fillStyle = ghost.frightened ? '#2121DE' : ghost.color;
      
      // Ghost body
      effectsCtx.globalAlpha = ghost.frightened ? 0.7 : 0.9;
      effectsCtx.beginPath();
      effectsCtx.arc(ghostX, ghostY, CELL_SIZE / 2 - 2, Math.PI, 0, false);
      
      // Ghost "skirt"
      const skirtHeight = CELL_SIZE / 4;
      effectsCtx.lineTo(ghostX + CELL_SIZE / 2 - 2, ghostY + skirtHeight);
      
      // Create wavy bottom
      for (let i = 0; i < 3; i++) {
        effectsCtx.quadraticCurveTo(
          ghostX + CELL_SIZE / 2 - 2 - ((CELL_SIZE / 3) * (i + 1)),
          ghostY + (i % 2 === 0 ? skirtHeight - 2 : skirtHeight + 2),
          ghostX + CELL_SIZE / 2 - 2 - ((CELL_SIZE / 3) * (i + 1)) - CELL_SIZE / 6,
          ghostY + skirtHeight
        );
      }
      
      effectsCtx.lineTo(ghostX - CELL_SIZE / 2 + 2, ghostY);
      effectsCtx.fill();
      
      // Ghost eyes
      effectsCtx.globalAlpha = 1.0;
      effectsCtx.fillStyle = '#FFFFFF';
      
      const eyeOffset = CELL_SIZE / 6;
      const eyeRadius = CELL_SIZE / 8;
      
      // Left eye
      effectsCtx.beginPath();
      effectsCtx.arc(ghostX - eyeOffset, ghostY - eyeOffset / 2, eyeRadius, 0, 2 * Math.PI);
      effectsCtx.fill();
      
      // Right eye
      effectsCtx.beginPath();
      effectsCtx.arc(ghostX + eyeOffset, ghostY - eyeOffset / 2, eyeRadius, 0, 2 * Math.PI);
      effectsCtx.fill();
      
      // Eye pupils (looking in movement direction)
      effectsCtx.fillStyle = '#000000';
      
      let pupilOffsetX = 0;
      let pupilOffsetY = 0;
      
      switch (ghost.direction) {
        case 'RIGHT':
          pupilOffsetX = eyeRadius / 2;
          break;
        case 'LEFT':
          pupilOffsetX = -eyeRadius / 2;
          break;
        case 'DOWN':
          pupilOffsetY = eyeRadius / 2;
          break;
        case 'UP':
          pupilOffsetY = -eyeRadius / 2;
          break;
      }
      
      // Left pupil
      effectsCtx.beginPath();
      effectsCtx.arc(
        ghostX - eyeOffset + pupilOffsetX,
        ghostY - eyeOffset / 2 + pupilOffsetY,
        eyeRadius / 2,
        0,
        2 * Math.PI
      );
      effectsCtx.fill();
      
      // Right pupil
      effectsCtx.beginPath();
      effectsCtx.arc(
        ghostX + eyeOffset + pupilOffsetX,
        ghostY - eyeOffset / 2 + pupilOffsetY,
        eyeRadius / 2,
        0,
        2 * Math.PI
      );
      effectsCtx.fill();
      
      effectsCtx.shadowBlur = 0;
    });
    
    // Power-up overlay effect
    if (powerUp.active) {
      effectsCtx.fillStyle = 
        powerUp.type === 'POWER_PELLET' 
          ? 'rgba(0, 0, 255, 0.1)' 
          : powerUp.type === 'SPEED' 
            ? 'rgba(0, 255, 0, 0.1)' 
            : 'rgba(255, 255, 0, 0.1)';
            
      effectsCtx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add time remaining indicator
      const timePercentage = powerUp.timeRemaining / POWER_UP_DURATION;
      effectsCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      effectsCtx.fillRect(
        canvas.width / 4,
        canvas.height - 10,
        (canvas.width / 2) * timePercentage,
        5
      );
    }
    
    // Restore context after zoom
    ctx.restore();
    effectsCtx.restore();
    
    // Draw mini-map
    const miniMapScale = 0.2;
    miniMapCanvas.width = canvasWidth * miniMapScale;
    miniMapCanvas.height = canvasHeight * miniMapScale;
    
    miniMapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    miniMapCtx.fillRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
    
    // Draw walls on mini-map
    miniMapCtx.fillStyle = COLORS.maze[selectedMaze as keyof typeof COLORS.maze] || COLORS.maze.default;
    for (let y = 0; y < mazeSize.height; y++) {
      for (let x = 0; x < mazeSize.width; x++) {
        if (mazeData[y][x] === 1) {
          miniMapCtx.fillRect(
            x * CELL_SIZE * miniMapScale,
            y * CELL_SIZE * miniMapScale,
            CELL_SIZE * miniMapScale,
            CELL_SIZE * miniMapScale
          );
        }
      }
    }
    
    // Draw pacman on mini-map
    miniMapCtx.fillStyle = COLORS.pacman;
    miniMapCtx.beginPath();
    miniMapCtx.arc(
      pacmanPosition.x * CELL_SIZE * miniMapScale + (CELL_SIZE * miniMapScale) / 2,
      pacmanPosition.y * CELL_SIZE * miniMapScale + (CELL_SIZE * miniMapScale) / 2,
      CELL_SIZE * miniMapScale,
      0,
      2 * Math.PI
    );
    miniMapCtx.fill();
    
    // Draw ghosts on mini-map
    ghosts.forEach((ghost) => {
      miniMapCtx.fillStyle = ghost.frightened ? '#2121DE' : ghost.color;
      miniMapCtx.beginPath();
      miniMapCtx.arc(
        ghost.position.x * CELL_SIZE * miniMapScale + (CELL_SIZE * miniMapScale) / 2,
        ghost.position.y * CELL_SIZE * miniMapScale + (CELL_SIZE * miniMapScale) / 2,
        CELL_SIZE * miniMapScale,
        0,
        2 * Math.PI
      );
      miniMapCtx.fill();
    });
    
    // Request next frame
    requestAnimationFrame(draw);
  }, [mazeData, mazeSize, pacmanPosition, pacmanDirection, pacmanMouthOpen, ghosts, dots, powerPellets, powerUp, cameraZoom, selectedMaze]);

  // Start the game
  const startGame = useCallback(() => {
    setGameState('PLAYING');
    
    // Start game loop
    if (!gameLoopRef.current) {
      gameLoopRef.current = setInterval(gameTick, GAME_SPEED);
    }
    
    // Start mouth animation
    if (!mouthAnimationRef.current) {
      mouthAnimationRef.current = setInterval(() => {
        setPacmanMouthOpen((prev) => !prev);
      }, 200);
    }
  }, [gameTick]);

  // Pause the game
  const pauseGame = useCallback(() => {
    setGameState('PAUSED');
    
    // Clear game loop
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  // Resume the game
  const resumeGame = useCallback(() => {
    setGameState('PLAYING');
    
    // Start game loop
    if (!gameLoopRef.current) {
      gameLoopRef.current = setInterval(gameTick, GAME_SPEED);
    }
  }, [gameTick]);

  // Toggle camera zoom for overview
  const toggleCameraZoom = useCallback(() => {
    setCameraZoom((prev) => (prev === 1 ? 0.8 : 1));
  }, []);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState === 'GAME_OVER') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setPacmanNextDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setPacmanNextDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setPacmanNextDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setPacmanNextDirection('RIGHT');
          break;
        case ' ':
          // Space bar - pause/resume
          if (gameState === 'PLAYING') {
            pauseGame();
          } else if (gameState === 'PAUSED') {
            resumeGame();
          } else if (gameState === 'IDLE' || gameState === 'GAME_OVER') {
            startGame();
          }
          break;
        case 'z':
        case 'Z':
          // Z key - toggle camera zoom
          toggleCameraZoom();
          break;
      }
    },
    [gameState, pauseGame, resumeGame, startGame, toggleCameraZoom]
  );

  // Color utility functions
  const shadeColor = (color: string, percent: number): string => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.floor(R * (100 + percent) / 100);
    G = Math.floor(G * (100 + percent) / 100);
    B = Math.floor(B * (100 + percent) / 100);

    R = R < 255 ? R : 255;
    G = G < 255 ? G : 255;
    B = B < 255 ? B : 255;

    R = R > 0 ? R : 0;
    G = G > 0 ? G : 0;
    B = B > 0 ? B : 0;

    const RR = R.toString(16).padStart(2, '0');
    const GG = G.toString(16).padStart(2, '0');
    const BB = B.toString(16).padStart(2, '0');

    return `#${RR}${GG}${BB}`;
  };

  const lightenColor = (color: string, percent: number): string => {
    return shadeColor(color, percent);
  };

  // Initialize game on mount
  useEffect(() => {
    initGame();
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      
      if (mouthAnimationRef.current) {
        clearInterval(mouthAnimationRef.current);
      }
      
      if (powerUpTimerRef.current) {
        clearTimeout(powerUpTimerRef.current);
      }
    };
  }, [initGame, handleKeyDown]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex flex-col sm:flex-row justify-between w-full items-center">
        <div className="flex flex-col items-center sm:items-start mb-2 sm:mb-0">
          <p className="font-pixel text-neon-yellow text-base">Score: {score}</p>
          <p className="font-pixel text-neon-blue text-xs">High Score: {highScore}</p>
        </div>
        
        <div className="flex flex-col items-center sm:items-end">
          <div className="flex gap-2">
            {Array.from({ length: lives }).map((_, i) => (
              <span key={i} className="text-neon-yellow text-base">●</span>
            ))}
          </div>
          <p className="font-pixel text-xs text-white">Level: {level}</p>
        </div>
      </div>
      
      <div 
        className="relative border-4 rounded-lg overflow-hidden shadow-lg"
        style={{ 
          borderColor: COLORS.maze[selectedMaze as keyof typeof COLORS.maze] || COLORS.maze.default,
          boxShadow: `0 0 20px ${COLORS.maze[selectedMaze as keyof typeof COLORS.maze] || COLORS.maze.default}, 0 0 30px ${COLORS.maze[selectedMaze as keyof typeof COLORS.maze] || COLORS.maze.default} inset`,
        }}
      >
        {/* Background Canvas */}
        <canvas 
          ref={mainCanvasRef} 
          className="bg-black"
        />
        
        {/* Effects Canvas (overlaid) */}
        <canvas 
          ref={effectsCanvasRef} 
          className="absolute top-0 left-0"
          style={{ mixBlendMode: 'lighten' }}
        />
        
        {/* Mini-map */}
        <div className="absolute top-4 right-4 border border-white/20 rounded">
          <canvas 
            ref={miniMapCanvasRef} 
            className="opacity-70 hover:opacity-100 transition-opacity"
          />
        </div>
        
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
            <h3 className="text-3xl font-pixel mb-6 animate-pulse text-neon-yellow">
              PAC-MAN
            </h3>
            <p className="text-white mb-6 text-center px-4">
              Use arrow keys or WASD to navigate the maze.<br/>
              Collect all dots to complete the level.<br/>
              Power pellets let you eat ghosts!<br/>
              Press Z for zoom overview.
            </p>
            <Button 
              onClick={startGame}
              className="font-pixel"
              style={{ 
                background: COLORS.pacman,
                color: 'black'
              }}
            >
              Start Game
            </Button>
          </div>
        )}
        
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
            <h3 className="text-3xl font-pixel text-neon-blue mb-6">PAUSED</h3>
            <Button 
              onClick={resumeGame}
              className="bg-neon-yellow text-black hover:bg-neon-yellow/80 font-pixel"
            >
              Resume
            </Button>
          </div>
        )}
        
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
            <h3 className="text-3xl font-pixel text-neon-pink mb-6">GAME OVER</h3>
            <p className="text-white mb-2">Your Score: {score}</p>
            <p className="text-neon-yellow mb-6">High Score: {highScore}</p>
            <Button 
              onClick={() => { initGame(); startGame(); }}
              className="bg-neon-pink text-black hover:bg-neon-pink/80 font-pixel mb-2"
            >
              Play Again
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex gap-2">
        {gameState === 'PLAYING' ? (
          <Button 
            onClick={pauseGame}
            className="bg-neon-yellow hover:bg-neon-yellow/80 text-black font-pixel"
          >
            Pause
          </Button>
        ) : gameState === 'PAUSED' ? (
          <Button 
            onClick={resumeGame}
            className="bg-neon-green hover:bg-neon-green/80 text-black font-pixel"
          >
            Resume
          </Button>
        ) : (
          <Button 
            onClick={startGame}
            className="bg-neon-green hover:bg-neon-green/80 text-black font-pixel"
          >
            {gameState === 'GAME_OVER' ? 'Play Again' : 'Start Game'}
          </Button>
        )}
        
        <Button 
          onClick={initGame}
          variant="outline" 
          className="border-neon-blue text-neon-blue hover:bg-neon-blue/20 font-pixel"
        >
          Reset
        </Button>
        
        <Button 
          onClick={toggleCameraZoom}
          variant="outline" 
          className="border-neon-purple text-neon-purple hover:bg-neon-purple/20 font-pixel"
        >
          {cameraZoom === 1 ? 'Zoom Out' : 'Zoom In'}
        </Button>
      </div>
      
      <div className="mt-8">
        <div className="grid grid-cols-3 gap-4 justify-center max-w-xs mx-auto">
          {/* Virtual controls for mobile */}
          <div className="invisible"></div>
          <Button 
            onClick={() => handleKeyDown({ key: 'ArrowUp' } as KeyboardEvent)}
            className="bg-neon-blue/30 hover:bg-neon-blue/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Up"
          >
            ▲
          </Button>
          <div className="invisible"></div>
          
          <Button 
            onClick={() => handleKeyDown({ key: 'ArrowLeft' } as KeyboardEvent)}
            className="bg-neon-blue/30 hover:bg-neon-blue/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Left"
          >
            ◄
          </Button>
          <Button 
            onClick={() => handleKeyDown({ key: ' ' } as KeyboardEvent)}
            className="bg-neon-yellow/30 hover:bg-neon-yellow/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Pause/Play"
          >
            ■
          </Button>
          <Button 
            onClick={() => handleKeyDown({ key: 'ArrowRight' } as KeyboardEvent)}
            className="bg-neon-blue/30 hover:bg-neon-blue/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Right"
          >
            ►
          </Button>
          
          <div className="invisible"></div>
          <Button 
            onClick={() => handleKeyDown({ key: 'ArrowDown' } as KeyboardEvent)}
            className="bg-neon-blue/30 hover:bg-neon-blue/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Down"
          >
            ▼
          </Button>
          <div className="invisible"></div>
        </div>
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Use keyboard arrows or WASD to move. Space to pause/resume. Z to toggle zoom view.</p>
      </div>
    </div>
  );
};

export default PacmanGame;
