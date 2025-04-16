import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Pacman from './Pacman';
import Ghost from './Ghost';

// Types
type Direction = 'up' | 'down' | 'left' | 'right' | 'none';
type Position = { x: number; y: number };
type Cell = 'empty' | 'wall' | 'dot' | 'energizer' | 'fruit';
type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER';
type GhostMode = 'chase' | 'scatter' | 'frightened';
type GhostType = 'blinky' | 'pinky' | 'inky' | 'clyde';

interface GhostState {
  position: Position;
  direction: Direction;
  targetPosition: Position;
  mode: GhostMode;
  type: GhostType;
  color: string;
  isActive: boolean;
  homePosition: Position;
  releaseTimer: number;
}

// Constants
const CELL_SIZE = 20;
const GRID_WIDTH = 28;
const GRID_HEIGHT = 31;
const CANVAS_WIDTH = GRID_WIDTH * CELL_SIZE;
const CANVAS_HEIGHT = GRID_HEIGHT * CELL_SIZE;
const PACMAN_SPEED = 5; // cells per second
const GHOST_SPEED = 4.5; // cells per second
const FRIGHTENED_SPEED = 3; // cells per second
const DOT_POINTS = 10;
const ENERGIZER_POINTS = 50;
const GHOST_POINTS = 200;
const FRUIT_POINTS = 100;
const FRIGHTENED_DURATION = 8000; // ms
const LEVEL_COMPLETE_DELAY = 3000; // ms
const GAME_OVER_DELAY = 3000; // ms

// Ghost colors
const GHOST_COLORS = {
  blinky: '#FF0000', // Red
  pinky: '#FFB8FF',  // Pink
  inky: '#00FFFF',   // Cyan
  clyde: '#FFB852'   // Orange
};

// Initial maze layout (simplified)
// 0 = empty, 1 = wall, 2 = dot, 3 = energizer, 4 = fruit, 5 = ghost house
const INITIAL_MAZE = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 3, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 3, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 5, 5, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 2, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 2, 1],
  [1, 3, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 0, 0, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 3, 1],
  [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
  [1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 2, 1, 1, 1],
  [1, 2, 2, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1],
  [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

interface PacmanGameProps {
  theme?: 'classic' | 'neon' | 'retro';
}

const PacmanGame: React.FC<PacmanGameProps> = ({ theme = 'neon' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [dotsRemaining, setDotsRemaining] = useState(0);
  const [pacmanPosition, setPacmanPosition] = useState<Position>({ x: 14, y: 23 });
  const [pacmanDirection, setPacmanDirection] = useState<Direction>('none');
  const [pacmanNextDirection, setPacmanNextDirection] = useState<Direction>('none');
  const [pacmanMouthOpen, setPacmanMouthOpen] = useState(0.5);
  const [pacmanEnergized, setPacmanEnergized] = useState(false);
  const [ghosts, setGhosts] = useState<GhostState[]>([]);
  const [frightenedTimer, setFrightenedTimer] = useState<NodeJS.Timeout | null>(null);
  const [levelCompleteTimer, setLevelCompleteTimer] = useState<NodeJS.Timeout | null>(null);
  const [gameOverTimer, setGameOverTimer] = useState<NodeJS.Timeout | null>(null);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);
  const [lastFrameTime, setLastFrameTime] = useState(0);
  const [mouthAnimationDirection, setMouthAnimationDirection] = useState(1);
  const { toast } = useToast();

  // Theme colors
  const themeColors = {
    classic: {
      background: '#000000',
      wall: '#2121DE',
      dot: '#FFFFFF',
      energizer: '#FFFFFF',
      text: '#FFFFFF',
      fruit: '#FF0000',
    },
    neon: {
      background: '#000000',
      wall: '#00FFFF',
      dot: '#FF00FF',
      energizer: '#FFFF00',
      text: '#00FF00',
      fruit: '#FF0000',
    },
    retro: {
      background: '#111111',
      wall: '#663399',
      dot: '#FFCC00',
      energizer: '#FF6600',
      text: '#FFFFFF',
      fruit: '#00FF00',
    }
  };

  const colors = themeColors[theme];

  // Initialize the game
  const initGame = useCallback(() => {
    // Convert the initial maze to the Cell type
    const newMaze: Cell[][] = INITIAL_MAZE.map(row => 
      row.map(cell => {
        switch(cell) {
          case 0: return 'empty';
          case 1: return 'wall';
          case 2: return 'dot';
          case 3: return 'energizer';
          case 4: return 'fruit';
          case 5: return 'empty'; // Ghost house is empty for movement
          default: return 'empty';
        }
      })
    );
    
    setMaze(newMaze);
    
    // Count dots
    let dots = 0;
    newMaze.forEach(row => {
      row.forEach(cell => {
        if (cell === 'dot' || cell === 'energizer') {
          dots++;
        }
      });
    });
    setDotsRemaining(dots);
    
    // Reset pacman
    setPacmanPosition({ x: 14, y: 23 });
    setPacmanDirection('none');
    setPacmanNextDirection('none');
    setPacmanMouthOpen(0.5);
    setPacmanEnergized(false);
    
    // Initialize ghosts
    const initialGhosts: GhostState[] = [
      {
        position: { x: 13.5, y: 13 },
        direction: 'left',
        targetPosition: { x: 0, y: 0 },
        mode: 'scatter',
        type: 'blinky',
        color: GHOST_COLORS.blinky,
        isActive: true,
        homePosition: { x: 13.5, y: 13 },
        releaseTimer: 0
      },
      {
        position: { x: 14.5, y: 13 },
        direction: 'right',
        targetPosition: { x: GRID_WIDTH - 1, y: 0 },
        mode: 'scatter',
        type: 'pinky',
        color: GHOST_COLORS.pinky,
        isActive: true,
        homePosition: { x: 14.5, y: 13 },
        releaseTimer: 2000
      },
      {
        position: { x: 13.5, y: 14 },
        direction: 'up',
        targetPosition: { x: 0, y: GRID_HEIGHT - 1 },
        mode: 'scatter',
        type: 'inky',
        color: GHOST_COLORS.inky,
        isActive: false,
        homePosition: { x: 13.5, y: 14 },
        releaseTimer: 4000
      },
      {
        position: { x: 14.5, y: 14 },
        direction: 'down',
        targetPosition: { x: GRID_WIDTH - 1, y: GRID_HEIGHT - 1 },
        mode: 'scatter',
        type: 'clyde',
        color: GHOST_COLORS.clyde,
        isActive: false,
        homePosition: { x: 14.5, y: 14 },
        releaseTimer: 6000
      }
    ];
    
    setGhosts(initialGhosts);
    
    // Reset game state
    setScore(0);
    setLives(3);
    setLevel(1);
    setGameStatus('IDLE');
    
    // Clear any existing timers
    if (frightenedTimer) {
      clearTimeout(frightenedTimer);
      setFrightenedTimer(null);
    }
    
    if (levelCompleteTimer) {
      clearTimeout(levelCompleteTimer);
      setLevelCompleteTimer(null);
    }
    
    if (gameOverTimer) {
      clearTimeout(gameOverTimer);
      setGameOverTimer(null);
    }
    
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      setAnimationFrameId(null);
    }
    
  }, [frightenedTimer, levelCompleteTimer, gameOverTimer, animationFrameId]);

  // Start the game
  const startGame = useCallback(() => {
    if (gameStatus === 'GAME_OVER') {
      initGame();
    }
    
    setGameStatus('PLAYING');
    setLastFrameTime(performance.now());
    
    // Start the game loop
    const animate = (time: number) => {
      const deltaTime = time - lastFrameTime;
      setLastFrameTime(time);
      
      // Update game state
      updateGame(deltaTime);
      
      // Continue the animation loop
      const id = requestAnimationFrame(animate);
      setAnimationFrameId(id);
    };
    
    const id = requestAnimationFrame(animate);
    setAnimationFrameId(id);
  }, [gameStatus, lastFrameTime, initGame]);

  // Pause the game
  const pauseGame = useCallback(() => {
    if (gameStatus === 'PLAYING') {
      setGameStatus('PAUSED');
      
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        setAnimationFrameId(null);
      }
    }
  }, [gameStatus, animationFrameId]);

  // Resume the game
  const resumeGame = useCallback(() => {
    if (gameStatus === 'PAUSED') {
      setGameStatus('PLAYING');
      setLastFrameTime(performance.now());
      
      const animate = (time: number) => {
        const deltaTime = time - lastFrameTime;
        setLastFrameTime(time);
        
        // Update game state
        updateGame(deltaTime);
        
        // Continue the animation loop
        const id = requestAnimationFrame(animate);
        setAnimationFrameId(id);
      };
      
      const id = requestAnimationFrame(animate);
      setAnimationFrameId(id);
    }
  }, [gameStatus, lastFrameTime]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameStatus !== 'PLAYING') return;
    
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        setPacmanNextDirection('up');
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        setPacmanNextDirection('down');
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        setPacmanNextDirection('left');
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        setPacmanNextDirection('right');
        break;
      case ' ':
        // Space bar toggles pause
        if (gameStatus === 'PLAYING') {
          pauseGame();
        } else if (gameStatus === 'PAUSED') {
          resumeGame();
        }
        break;
    }
  }, [gameStatus, pauseGame, resumeGame]);

  // Check if a position is valid for movement
  const isValidMove = useCallback((position: Position): boolean => {
    const gridX = Math.floor(position.x);
    const gridY = Math.floor(position.y);
    
    // Check if position is within bounds
    if (gridX < 0 || gridX >= GRID_WIDTH || gridY < 0 || gridY >= GRID_HEIGHT) {
      return false;
    }
    
    // Check if position is a wall
    return maze[gridY][gridX] !== 'wall';
  }, [maze]);

  // Get the next position based on current position and direction
  const getNextPosition = useCallback((position: Position, direction: Direction, speed: number): Position => {
    const moveDistance = speed / 1000; // Convert to cells per millisecond
    
    switch (direction) {
      case 'up':
        return { x: position.x, y: position.y - moveDistance };
      case 'down':
        return { x: position.x, y: position.y + moveDistance };
      case 'left':
        return { x: position.x - moveDistance, y: position.y };
      case 'right':
        return { x: position.x + moveDistance, y: position.y };
      default:
        return { ...position };
    }
  }, []);

  // Check if pacman can change direction
  const canChangeDirection = useCallback((position: Position, direction: Direction): boolean => {
    // Check if we're at a grid cell center (or close enough)
    const isAtGridCenter = 
      Math.abs(position.x - Math.round(position.x)) < 0.1 && 
      Math.abs(position.y - Math.round(position.y)) < 0.1;
    
    if (!isAtGridCenter) return false;
    
    // Check if the new direction is valid
    const nextPos = getNextPosition(
      { x: Math.round(position.x), y: Math.round(position.y) }, 
      direction, 
      PACMAN_SPEED
    );
    
    return isValidMove(nextPos);
  }, [getNextPosition, isValidMove]);

  // Update pacman position and handle collisions
  const updatePacman = useCallback((deltaTime: number) => {
    // Animate mouth
    setPacmanMouthOpen(prev => {
      const newOpen = prev + (0.05 * mouthAnimationDirection);
      if (newOpen >= 1) {
        setMouthAnimationDirection(-1);
        return 1;
      } else if (newOpen <= 0) {
        setMouthAnimationDirection(1);
        return 0;
      }
      return newOpen;
    });
    
    // Try to change direction if requested
    if (pacmanNextDirection !== pacmanDirection && pacmanNextDirection !== 'none') {
      if (canChangeDirection(pacmanPosition, pacmanNextDirection)) {
        setPacmanDirection(pacmanNextDirection);
      }
    }
    
    // Move pacman
    if (pacmanDirection !== 'none') {
      const nextPosition = getNextPosition(
        pacmanPosition, 
        pacmanDirection, 
        PACMAN_SPEED * deltaTime
      );
      
      // Handle tunnel wrapping
      if (nextPosition.x < 0) {
        nextPosition.x = GRID_WIDTH - 0.5;
      } else if (nextPosition.x >= GRID_WIDTH) {
        nextPosition.x = 0;
      }
      
      // Check if the move is valid
      if (isValidMove(nextPosition)) {
        setPacmanPosition(nextPosition);
        
        // Check for dot collection
        const gridX = Math.floor(nextPosition.x);
        const gridY = Math.floor(nextPosition.y);
        
        // Only collect if we're close to the center of the cell
        const isNearCenter = 
          Math.abs(nextPosition.x - (gridX + 0.5)) < 0.3 && 
          Math.abs(nextPosition.y - (gridY + 0.5)) < 0.3;
        
        if (isNearCenter) {
          if (maze[gridY][gridX] === 'dot') {
            // Collect dot
            const newMaze = [...maze];
            newMaze[gridY][gridX] = 'empty';
            setMaze(newMaze);
            setScore(prev => prev + DOT_POINTS);
            setDotsRemaining(prev => prev - 1);
          } else if (maze[gridY][gridX] === 'energizer') {
            // Collect energizer
            const newMaze = [...maze];
            newMaze[gridY][gridX] = 'empty';
            setMaze(newMaze);
            setScore(prev => prev + ENERGIZER_POINTS);
            setDotsRemaining(prev => prev - 1);
            
            // Activate frightened mode
            setPacmanEnergized(true);
            
            // Set all ghosts to frightened mode
            setGhosts(prev => prev.map(ghost => ({
              ...ghost,
              mode: 'frightened',
              direction: 
                ghost.direction === 'up' ? 'down' :
                ghost.direction === 'down' ? 'up' :
                ghost.direction === 'left' ? 'right' :
                'left'
            })));
            
            // Clear existing frightened timer
            if (frightenedTimer) {
              clearTimeout(frightenedTimer);
            }
            
            // Set new frightened timer
            const timer = setTimeout(() => {
              setPacmanEnergized(false);
              setGhosts(prev => prev.map(ghost => ({
                ...ghost,
                mode: 'chase'
              })));
              setFrightenedTimer(null);
            }, FRIGHTENED_DURATION);
            
            setFrightenedTimer(timer);
          } else if (maze[gridY][gridX] === 'fruit') {
            // Collect fruit
            const newMaze = [...maze];
            newMaze[gridY][gridX] = 'empty';
            setMaze(newMaze);
            setScore(prev => prev + FRUIT_POINTS);
            
            toast({
              title: "Bonus!",
              description: `+${FRUIT_POINTS} points`,
              variant: "default"
            });
          }
        }
      } else {
        // If we hit a wall, stop
        setPacmanDirection('none');
      }
    }
  }, [
    pacmanPosition, 
    pacmanDirection, 
    pacmanNextDirection, 
    mouthAnimationDirection, 
    maze, 
    canChangeDirection, 
    getNextPosition, 
    isValidMove, 
    frightenedTimer,
    toast
  ]);

  // Calculate target position for ghosts
  const calculateGhostTarget = useCallback((ghost: GhostState): Position => {
    if (ghost.mode === 'frightened') {
      // Random target when frightened
      return {
        x: Math.floor(Math.random() * GRID_WIDTH),
        y: Math.floor(Math.random() * GRID_HEIGHT)
      };
    }
    
    if (ghost.mode === 'scatter') {
      // Each ghost has a home corner to scatter to
      switch (ghost.type) {
        case 'blinky': return { x: GRID_WIDTH - 2, y: 0 };
        case 'pinky': return { x: 1, y: 0 };
        case 'inky': return { x: GRID_WIDTH - 2, y: GRID_HEIGHT - 2 };
        case 'clyde': return { x: 1, y: GRID_HEIGHT - 2 };
      }
    }
    
    // Chase mode - each ghost has a different targeting strategy
    switch (ghost.type) {
      case 'blinky': // Directly targets pacman
        return { ...pacmanPosition };
        
      case 'pinky': // Targets 4 tiles ahead of pacman
        const ahead = 4;
        switch (pacmanDirection) {
          case 'up':
            return { x: pacmanPosition.x, y: pacmanPosition.y - ahead };
          case 'down':
            return { x: pacmanPosition.x, y: pacmanPosition.y + ahead };
          case 'left':
            return { x: pacmanPosition.x - ahead, y: pacmanPosition.y };
          case 'right':
            return { x: pacmanPosition.x + ahead, y: pacmanPosition.y };
          default:
            return { ...pacmanPosition };
        }
        
      case 'inky': // Complex targeting using Blinky's position
        const blinky = ghosts.find(g => g.type === 'blinky');
        if (!blinky) return { ...pacmanPosition };
        
        // Get position 2 tiles ahead of pacman
        let aheadX = pacmanPosition.x;
        let aheadY = pacmanPosition.y;
        
        switch (pacmanDirection) {
          case 'up':
            aheadY -= 2;
            break;
          case 'down':
            aheadY += 2;
            break;
          case 'left':
            aheadX -= 2;
            break;
          case 'right':
            aheadX += 2;
            break;
        }
        
        // Calculate vector from Blinky to the position ahead of Pacman
        const vectorX = aheadX - blinky.position.x;
        const vectorY = aheadY - blinky.position.y;
        
        // Double the vector to get Inky's target
        return {
          x: aheadX + vectorX,
          y: aheadY + vectorY
        };
        
      case 'clyde': // Targets pacman until close, then scatters
        const distance = Math.sqrt(
          Math.pow(ghost.position.x - pacmanPosition.x, 2) +
          Math.pow(ghost.position.y - pacmanPosition.y, 2)
        );
        
        // If Clyde is far from Pacman, chase him
        if (distance > 8) {
          return { ...pacmanPosition };
        } 
        // If Clyde is close to Pacman, go to scatter mode
        else {
          return { x: 1, y: GRID_HEIGHT - 2 };
        }
    }
  }, [pacmanPosition, pacmanDirection, ghosts]);

  // Get possible directions for a ghost
  const getGhostPossibleDirections = useCallback((position: Position, currentDirection: Direction): Direction[] => {
    const directions: Direction[] = ['up', 'down', 'left', 'right'];
    
    // Remove the opposite direction (ghosts can't turn around)
    const oppositeDirection = 
      currentDirection === 'up' ? 'down' :
      currentDirection === 'down' ? 'up' :
      currentDirection === 'left' ? 'right' :
      currentDirection === 'right' ? 'left' :
      'none';
    
    const validDirections = directions.filter(dir => {
      if (dir === oppositeDirection) return false;
      
      const nextPos = getNextPosition(
        { x: Math.round(position.x), y: Math.round(position.y) },
        dir,
        0.5 // Small step to check
      );
      
      return isValidMove(nextPos);
    });
    
    return validDirections.length > 0 ? validDirections : [currentDirection];
  }, [getNextPosition, isValidMove]);

  // Choose the best direction for a ghost to reach its target
  const chooseGhostDirection = useCallback((ghost: GhostState): Direction => {
    // Only change direction at grid intersections
    const isAtGridCenter = 
      Math.abs(ghost.position.x - Math.round(ghost.position.x)) < 0.1 && 
      Math.abs(ghost.position.y - Math.round(ghost.position.y)) < 0.1;
    
    if (!isAtGridCenter) return ghost.direction;
    
    const possibleDirections = getGhostPossibleDirections(ghost.position, ghost.direction);
    
    // If frightened, choose a random direction
    if (ghost.mode === 'frightened') {
      return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    }
    
    // Otherwise, choose the direction that gets closest to the target
    let bestDirection = ghost.direction;
    let bestDistance = Infinity;
    
    possibleDirections.forEach(dir => {
      const nextPos = getNextPosition(
        { x: Math.round(ghost.position.x), y: Math.round(ghost.position.y) },
        dir,
        1 // One full step
      );
      
      const distance = Math.sqrt(
        Math.pow(nextPos.x - ghost.targetPosition.x, 2) +
        Math.pow(nextPos.y - ghost.targetPosition.y, 2)
      );
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestDirection = dir;
      }
    });
    
    return bestDirection;
  }, [getGhostPossibleDirections, getNextPosition]);

  // Update ghost positions and handle collisions
  const updateGhosts = useCallback((deltaTime: number) => {
    setGhosts(prev => {
      const updatedGhosts = prev.map(ghost => {
        // Skip inactive ghosts
        if (!ghost.isActive) {
          // Decrease release timer
          const newReleaseTimer = Math.max(0, ghost.releaseTimer - deltaTime);
          
          // Activate ghost if timer is up
          if (newReleaseTimer === 0 && ghost.releaseTimer > 0) {
            return {
              ...ghost,
              isActive: true,
              releaseTimer: 0
            };
          }
          
          return {
            ...ghost,
            releaseTimer: newReleaseTimer
          };
        }
        
        // Update target position
        const targetPosition = calculateGhostTarget(ghost);
        
        // Choose direction
        const direction = chooseGhostDirection({
          ...ghost,
          targetPosition
        });
        
        // Move ghost
        const speed = ghost.mode === 'frightened' ? FRIGHTENED_SPEED : GHOST_SPEED;
        const nextPosition = getNextPosition(ghost.position, direction, speed * deltaTime);
        
        // Handle tunnel wrapping
        if (nextPosition.x < 0) {
          nextPosition.x = GRID_WIDTH - 0.5;
        } else if (nextPosition.x >= GRID_WIDTH) {
          nextPosition.x = 0;
        }
        
        // Check if the move is valid
        if (isValidMove(nextPosition)) {
          return {
            ...ghost,
            position: nextPosition,
            direction,
            targetPosition
          };
        } else {
          // If we hit a wall, choose a new direction
          const newDirection = getGhostPossibleDirections(ghost.position, ghost.direction)[0];
          return {
            ...ghost,
            direction: newDirection,
            targetPosition
          };
        }
      });
      
      return updatedGhosts;
    });
    
    // Check for collisions with pacman
    ghosts.forEach(ghost => {
      const distance = Math.sqrt(
        Math.pow(ghost.position.x - pacmanPosition.x, 2) +
        Math.pow(ghost.position.y - pacmanPosition.y, 2)
      );
      
      if (distance < 0.7) { // Close enough for collision
        if (ghost.mode === 'frightened') {
          // Pacman eats the ghost
          setScore(prev => prev + GHOST_POINTS);
          
          // Reset ghost to home
          setGhosts(prev => prev.map(g => {
            if (g.type === ghost.type) {
              return {
                ...g,
                position: { ...g.homePosition },
                direction: 'left',
                mode: 'scatter'
              };
            }
            return g;
          }));
          
          toast({
            title: "Ghost eaten!",
            description: `+${GHOST_POINTS} points`,
            variant: "default"
          });
        } else {
          // Ghost catches pacman
          handlePacmanCaught();
        }
      }
    });
  }, [
    calculateGhostTarget, 
    chooseGhostDirection, 
    getNextPosition, 
    isValidMove, 
    getGhostPossibleDirections, 
    ghosts, 
    pacmanPosition,
    toast
  ]);

  // Handle pacman being caught by a ghost
  const handlePacmanCaught = useCallback(() => {
    // Stop the game temporarily
    setGameStatus('PAUSED');
    
    // Decrease lives
    setLives(prev => prev - 1);
    
    if (lives - 1 <= 0) {
      // Game over
      if (score > highScore) {
        setHighScore(score);
      }
      
      toast({
        title: "Game Over!",
        description: `Final score: ${score}`,
        variant: "destructive"
      });
      
      const timer = setTimeout(() => {
        setGameStatus('GAME_OVER');
        setGameOverTimer(null);
      }, GAME_OVER_DELAY);
      
      setGameOverTimer(timer);
    } else {
      // Reset positions but continue game
      setPacmanPosition({ x: 14, y: 23 });
      setPacmanDirection('none');
      setPacmanNextDirection('none');
      
      // Reset ghosts
      setGhosts(prev => prev.map(ghost => ({
        ...ghost,
        position: { ...ghost.homePosition },
        direction: 'left',
        mode: 'scatter'
      })));
      
      // Resume after a short delay
      setTimeout(() => {
        setGameStatus('PLAYING');
      }, 1000);
    }
  }, [lives, score, highScore, toast]);

  // Check if level is complete
  const checkLevelComplete = useCallback(() => {
    if (dotsRemaining <= 0) {
      // Level complete
      setGameStatus('LEVEL_COMPLETE');
      
      toast({
        title: "Level Complete!",
        description: `Moving to level ${level + 1}`,
        variant: "default"
      });
      
      const timer = setTimeout(() => {
        // Increase level
        setLevel(prev => prev + 1);
        
        // Reset the maze but keep score and lives
        const newMaze: Cell[][] = INITIAL_MAZE.map(row => 
          row.map(cell => {
            switch(cell) {
              case 0: return 'empty';
              case 1: return 'wall';
              case 2: return 'dot';
              case 3: return 'energizer';
              case 4: return 'fruit';
              case 5: return 'empty'; // Ghost house is empty for movement
              default: return 'empty';
            }
          })
        );
        
        setMaze(newMaze);
        
        // Count dots
        let dots = 0;
        newMaze.forEach(row => {
          row.forEach(cell => {
            if (cell === 'dot' || cell === 'energizer') {
              dots++;
            }
          });
        });
        setDotsRemaining(dots);
        
        // Reset positions
        setPacmanPosition({ x: 14, y: 23 });
        setPacmanDirection('none');
        setPacmanNextDirection('none');
        
        // Reset ghosts with faster speed for higher levels
        setGhosts(prev => prev.map(ghost => ({
          ...ghost,
          position: { ...ghost.homePosition },
          direction: 'left',
          mode: 'scatter',
          isActive: ghost.type === 'blinky' || ghost.type === 'pinky'
        })));
        
        // Resume game
        setGameStatus('PLAYING');
        setLevelCompleteTimer(null);
      }, LEVEL_COMPLETE_DELAY);
      
      setLevelCompleteTimer(timer);
    }
  }, [dotsRemaining, level, toast]);

  // Main game update function
  const updateGame = useCallback((deltaTime: number) => {
    if (gameStatus !== 'PLAYING') return;
    
    updatePacman(deltaTime);
    updateGhosts(deltaTime);
    checkLevelComplete();
  }, [gameStatus, updatePacman, updateGhosts, checkLevelComplete]);

  // Draw the game
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Draw maze
    maze.forEach((row, y) => {
      row.forEach((cell, x) => {
        const cellX = x * CELL_SIZE;
        const cellY = y * CELL_SIZE;
        
        switch (cell) {
          case 'wall':
            // Draw wall with glow effect
            ctx.fillStyle = colors.wall;
            ctx.shadowBlur = 5;
            ctx.shadowColor = colors.wall;
            ctx.fillRect(cellX, cellY, CELL_SIZE, CELL_SIZE);
            ctx.shadowBlur = 0;
            break;
            
          case 'dot':
            // Draw dot
            ctx.fillStyle = colors.dot;
            ctx.beginPath();
            ctx.arc(
              cellX + CELL_SIZE / 2,
              cellY + CELL_SIZE / 2,
              CELL_SIZE / 10,
              0,
              Math.PI * 2
            );
            ctx.fill();
            break;
            
          case 'energizer':
            // Draw energizer with pulsing effect
            const pulseSize = (Math.sin(Date.now() / 200) + 1) * 2 + 4;
            ctx.fillStyle = colors.energizer;
            ctx.shadowBlur = 10;
            ctx.shadowColor = colors.energizer;
            ctx.beginPath();
            ctx.arc(
              cellX + CELL_SIZE / 2,
              cellY + CELL_SIZE / 2,
              pulseSize,
              0,
              Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;
            break;
            
          case 'fruit':
            // Draw fruit (cherry)
            ctx.fillStyle = colors.fruit;
            ctx.beginPath();
            ctx.arc(
              cellX + CELL_SIZE / 2 - 2,
              cellY + CELL_SIZE / 2,
              CELL_SIZE / 4,
              0,
              Math.PI * 2
            );
            ctx.fill();
            
            ctx.fillStyle = '#00FF00';
            ctx.fillRect(
              cellX + CELL_SIZE / 2,
              cellY + CELL_SIZE / 3,
              CELL_SIZE / 8,
              CELL_SIZE / 4
            );
            break;
        }
      });
    });
  }, [maze, colors]);

  // Initialize game on mount
  useEffect(() => {
    initGame();
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      // Clean up timers
      if (frightenedTimer) clearTimeout(frightenedTimer);
      if (levelCompleteTimer) clearTimeout(levelCompleteTimer);
      if (gameOverTimer) clearTimeout(gameOverTimer);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [
    initGame, 
    handleKeyDown, 
    frightenedTimer, 
    levelCompleteTimer, 
    gameOverTimer, 
    animationFrameId
  ]);

  // Draw the game on canvas
  useEffect(() => {
    drawGame();
  }, [drawGame, maze, pacmanPosition, ghosts]);

  // Handle virtual controls for mobile
  const handleVirtualControl = useCallback((direction: Direction) => {
    if (gameStatus === 'PLAYING') {
      setPacmanNextDirection(direction);
    } else if (gameStatus === 'IDLE' || gameStatus === 'GAME_OVER') {
      startGame();
    }
  }, [gameStatus, startGame]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex flex-col sm:flex-row justify-between w-full items-center">
        <div className="flex flex-col items-center sm:items-start mb-2 sm:mb-0">
          <p className="font-pixel text-neon-green text-base">Score: {score}</p>
          <p className="font-pixel text-neon-yellow text-xs">High Score: {highScore}</p>
        </div>
        
        <div className="flex flex-col items-center sm:items-end">
          <p className="font-pixel text-neon-pink text-xs">Level: {level}</p>
          <p className="font-pixel text-xs text-white">Lives: {lives}</p>
        </div>
      </div>
      
      <div 
        className="relative border-4 rounded-lg overflow-hidden shadow-lg"
        style={{ 
          borderColor: colors.wall,
          boxShadow: `0 0 20px ${colors.wall}, 0 0 30px ${colors.wall} inset`,
          width: CANVAS_WIDTH + 8, // Add 8 for border
          height: CANVAS_HEIGHT + 8 // Add 8 for border
        }}
      >
        {/* Background Canvas */}
        <canvas 
          ref={canvasRef} 
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          className="bg-black absolute top-0 left-0"
        />
        
        {/* SVG Overlay for Pacman and Ghosts */}
        <svg 
          ref={svgRef}
          width={CANVAS_WIDTH} 
          height={CANVAS_HEIGHT}
          className="absolute top-0 left-0"
          style={{ mixBlendMode: 'lighten' }}
        >
          {/* Pacman */}
          <Pacman 
            x={pacmanPosition.x * CELL_SIZE - CELL_SIZE / 2}
            y={pacmanPosition.y * CELL_SIZE - CELL_SIZE / 2}
            direction={pacmanDirection === 'none' ? 'right' : pacmanDirection}
            mouthOpen={pacmanMouthOpen}
            isEnergized={pacmanEnergized}
            size={CELL_SIZE * 1.5}
          />
          
          {/* Ghosts */}
          {ghosts.map((ghost, index) => (
            <Ghost 
              key={index}
              x={ghost.position.x * CELL_SIZE - CELL_SIZE / 2}
              y={ghost.position.y * CELL_SIZE - CELL_SIZE / 2}
              color={ghost.color}
              direction={ghost.direction === 'none' ? 'right' : ghost.direction}
              isScared={ghost.mode === 'frightened'}
              size={CELL_SIZE * 1.5}
            />
          ))}
        </svg>
        
        {gameStatus === 'IDLE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
            <h3 className="text-3xl font-pixel mb-6 animate-pulse"
                style={{ color: colors.energizer }}>
              PACMAN
            </h3>
            <p className="text-white mb-6 text-center px-4">
              Use arrow keys or WASD to control Pacman.<br/>
              Eat all dots to complete the level.<br/>
              Energizers let you eat ghosts!
            </p>
            <Button 
              onClick={startGame}
              className="font-pixel"
              style={{ 
                background: colors.energizer,
                color: 'black'
              }}
            >
              Start Game
            </Button>
          </div>
        )}
        
        {gameStatus === 'PAUSED' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
            <h3 className="text-3xl font-pixel text-neon-yellow mb-6">PAUSED</h3>
            <Button 
              onClick={resumeGame}
              className="bg-neon-yellow text-black hover:bg-neon-yellow/80 font-pixel"
            >
              Resume
            </Button>
          </div>
        )}
        
        {gameStatus === 'GAME_OVER' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
            <h3 className="text-3xl font-pixel text-neon-pink mb-6">GAME OVER</h3>
            <p className="text-white mb-2">Your Score: {score}</p>
            <p className="text-neon-yellow mb-6">High Score: {highScore}</p>
            <Button 
              onClick={startGame}
              className="bg-neon-pink text-black hover:bg-neon-pink/80 font-pixel mb-2"
            >
              Play Again
            </Button>
          </div>
        )}
        
        {gameStatus === 'LEVEL_COMPLETE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
            <h3 className="text-3xl font-pixel text-neon-green mb-6">LEVEL COMPLETE!</h3>
            <p className="text-white mb-2">Score: {score}</p>
            <p className="text-neon-yellow mb-6">Next Level: {level + 1}</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 flex gap-2">
        {gameStatus === 'PLAYING' ? (
          <Button 
            onClick={pauseGame}
            className="bg-neon-yellow hover:bg-neon-yellow/80 text-black font-pixel"
          >
            Pause
          </Button>
        ) : gameStatus === 'PAUSED' ? (
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
            {typeof gameStatus === 'string' && (gameStatus === "LEVEL_COMPLETE" || gameStatus === "GAME_OVER") ? 'Play Again' : 'Start Game'}
          </Button>
        )}
        
        <Button 
          onClick={initGame}
          variant="outline" 
          className="border-neon-blue text-neon-blue hover:bg-neon-blue/20 font-pixel"
        >
          Reset
        </Button>
      </div>
      
      <div className="mt-8">
        <div className="grid grid-cols-3 gap-4 justify-center max-w-xs mx-auto">
          {/* Virtual controls for mobile */}
          <div className="invisible"></div>
          <Button 
            onClick={() => handleVirtualControl('up')}
            className="bg-neon-green/30 hover:bg-neon-green/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Up"
          >
            ▲
          </Button>
          <div className="invisible"></div>
          
          <Button 
            onClick={() => handleVirtualControl('left')}
            className="bg-neon-green/30 hover:bg-neon-green/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Left"
          >
            ◄
          </Button>
          <Button 
            onClick={() => {
              if (gameStatus === 'PLAYING') {
                pauseGame();
              } else if (gameStatus === 'PAUSED') {
                resumeGame();
              } else {
                startGame();
              }
            }}
            className="bg-neon-yellow/30 hover:bg-neon-yellow/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Pause/Play"
          >
            ■
          </Button>
          <Button 
            onClick={() => handleVirtualControl('right')}
            className="bg-neon-green/30 hover:bg-neon-green/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Right"
          >
            ►
          </Button>
          
          <div className="invisible"></div>
          <Button 
            onClick={() => handleVirtualControl('down')}
            className="bg-neon-green/30 hover:bg-neon-green/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Down"
          >
            ▼
          </Button>
          <div className="invisible"></div>
        </div>
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Use keyboard arrows or WASD to move</p>
      </div>
    </div>
  );
};

export default PacmanGame;
