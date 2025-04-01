
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

// Types
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type SnakeState = {
  body: Position[];
  direction: Direction;
  nextDirection: Direction;
};
type GameState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
type FoodState = Position & {
  type: 'regular' | 'bonus';
};

// Constants
const GRID_SIZE = 20;
const CELL_SIZE = 20;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const GAME_SPEED = 100; // ms
const BONUS_APPEAR_CHANCE = 0.1; // 10% chance for bonus food
const BONUS_DURATION = 5000; // 5 seconds

// Colors
const COLORS = {
  snake: '#00FF00', // Neon green
  snakeOutline: '#88FF88',
  food: '#FF00FF', // Neon pink
  bonusFood: '#FFFF00', // Neon yellow
  grid: '#111122',
  background: '#000011',
};

const SnakeGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [snake, setSnake] = useState<SnakeState>({
    body: [{ x: 10, y: 10 }],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
  });
  const [food, setFood] = useState<FoodState>({ x: 15, y: 10, type: 'regular' });
  const [bonusTimerId, setBonusTimerId] = useState<NodeJS.Timeout | null>(null);
  const [snakeLength, setSnakeLength] = useState(1);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize or reset the game
  const initGame = useCallback(() => {
    // Clear any existing timers
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    
    if (bonusTimerId) {
      clearTimeout(bonusTimerId);
      setBonusTimerId(null);
    }
    
    // Reset game state
    setScore(0);
    setSnakeLength(1);
    
    // Reset snake
    setSnake({
      body: [{ x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2) }],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
    });
    
    // Place new food
    placeNewFood();
    
    // Draw the initial state
    draw();
    
    // Update game state
    setGameState('IDLE');
  }, [bonusTimerId]);

  // Place food at random position
  const placeNewFood = useCallback(() => {
    // Calculate positions that are not occupied by the snake
    const availablePositions: Position[] = [];
    
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (!snake.body.some((segment) => segment.x === x && segment.y === y)) {
          availablePositions.push({ x, y });
        }
      }
    }
    
    if (availablePositions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availablePositions.length);
      const newPosition = availablePositions[randomIndex];
      
      // Determine if this should be a bonus food
      const isBonus = Math.random() < BONUS_APPEAR_CHANCE;
      
      setFood({
        x: newPosition.x,
        y: newPosition.y,
        type: isBonus ? 'bonus' : 'regular',
      });
      
      // If it's a bonus food, set a timer to convert it back to regular
      if (isBonus) {
        const timerId = setTimeout(() => {
          setFood(current => ({ ...current, type: 'regular' }));
          setBonusTimerId(null);
        }, BONUS_DURATION);
        
        setBonusTimerId(timerId as unknown as NodeJS.Timeout);
      }
    }
  }, [snake.body]);

  // Check for collisions
  const checkCollision = useCallback((position: Position): boolean => {
    // Check if hit wall
    if (
      position.x < 0 ||
      position.x >= GRID_SIZE ||
      position.y < 0 ||
      position.y >= GRID_SIZE
    ) {
      return true;
    }
    
    // Check if hit self (ignore the head)
    const snakeWithoutHead = snake.body.slice(1);
    return snakeWithoutHead.some(
      (segment) => segment.x === position.x && segment.y === position.y
    );
  }, [snake.body]);

  // Game tick logic
  const gameTick = useCallback(() => {
    if (gameState !== 'PLAYING') return;

    setSnake((prevSnake) => {
      // Apply the next direction
      const direction = prevSnake.nextDirection;
      
      // Calculate new head position
      const head = { ...prevSnake.body[0] };
      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }
      
      // Check for collision
      if (checkCollision(head)) {
        setGameState('GAME_OVER');
        
        // Update high score if needed
        if (score > highScore) {
          setHighScore(score);
        }
        
        toast({
          title: "Game Over!",
          description: `Your score: ${score}`,
          variant: "destructive"
        });
        
        // Clear the game loop
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
          gameLoopRef.current = null;
        }
        
        return prevSnake;
      }
      
      // Create new snake body array with the new head
      const newBody = [head, ...prevSnake.body];
      
      // Check if food is eaten
      const ateFood = head.x === food.x && head.y === food.y;
      if (ateFood) {
        // Increase score based on food type
        setScore((prevScore) => {
          const points = food.type === 'bonus' ? 5 : 1;
          return prevScore + points;
        });
        
        // Increase snake length count
        setSnakeLength(newBody.length);
        
        // Clear bonus timer if it exists
        if (bonusTimerId && food.type === 'bonus') {
          clearTimeout(bonusTimerId);
          setBonusTimerId(null);
        }
        
        // Place new food
        placeNewFood();
      } else {
        // Remove tail if no food was eaten
        newBody.pop();
      }
      
      return {
        ...prevSnake,
        body: newBody,
        direction,
      };
    });
    
  }, [gameState, checkCollision, food, score, highScore, bonusTimerId, placeNewFood, toast]);

  // Draw the game
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw background
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    ctx.strokeStyle = COLORS.grid;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }
    
    // Draw food
    ctx.fillStyle = food.type === 'bonus' ? COLORS.bonusFood : COLORS.food;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Add glow effect to food
    ctx.shadowBlur = 10;
    ctx.shadowColor = food.type === 'bonus' ? COLORS.bonusFood : COLORS.food;
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Draw snake
    snake.body.forEach((segment, index) => {
      // Determine transparency based on position in body (head is fully opaque)
      const opacity = Math.max(0.5, 1 - index / snake.body.length);
      
      // Draw main body segment with glow effect
      ctx.shadowBlur = 8;
      ctx.shadowColor = COLORS.snake;
      ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`;
      
      // Draw rounded rectangle for each segment
      ctx.beginPath();
      const radius = CELL_SIZE / 4;
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + CELL_SIZE, y, x + CELL_SIZE, y + CELL_SIZE, radius);
      ctx.arcTo(x + CELL_SIZE, y + CELL_SIZE, x, y + CELL_SIZE, radius);
      ctx.arcTo(x, y + CELL_SIZE, x, y, radius);
      ctx.arcTo(x, y, x + CELL_SIZE, y, radius);
      ctx.closePath();
      ctx.fill();
      
      // Reset shadow for stroke
      ctx.shadowBlur = 0;
      ctx.strokeStyle = COLORS.snakeOutline;
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw eyes if this is the head
      if (index === 0) {
        ctx.fillStyle = '#FFFFFF';
        
        // Position eyes based on direction
        let eyeOffsetX1, eyeOffsetY1, eyeOffsetX2, eyeOffsetY2;
        
        switch (snake.direction) {
          case 'UP':
            eyeOffsetX1 = CELL_SIZE / 4;
            eyeOffsetY1 = CELL_SIZE / 4;
            eyeOffsetX2 = 3 * CELL_SIZE / 4;
            eyeOffsetY2 = CELL_SIZE / 4;
            break;
          case 'DOWN':
            eyeOffsetX1 = CELL_SIZE / 4;
            eyeOffsetY1 = 3 * CELL_SIZE / 4;
            eyeOffsetX2 = 3 * CELL_SIZE / 4;
            eyeOffsetY2 = 3 * CELL_SIZE / 4;
            break;
          case 'LEFT':
            eyeOffsetX1 = CELL_SIZE / 4;
            eyeOffsetY1 = CELL_SIZE / 4;
            eyeOffsetX2 = CELL_SIZE / 4;
            eyeOffsetY2 = 3 * CELL_SIZE / 4;
            break;
          case 'RIGHT':
            eyeOffsetX1 = 3 * CELL_SIZE / 4;
            eyeOffsetY1 = CELL_SIZE / 4;
            eyeOffsetX2 = 3 * CELL_SIZE / 4;
            eyeOffsetY2 = 3 * CELL_SIZE / 4;
            break;
        }
        
        // Draw the eyes
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX1, y + eyeOffsetY1, CELL_SIZE / 8, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX2, y + eyeOffsetY2, CELL_SIZE / 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupils
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + eyeOffsetX1, y + eyeOffsetY1, CELL_SIZE / 16, 0, Math.PI * 2);
        ctx.arc(x + eyeOffsetX2, y + eyeOffsetY2, CELL_SIZE / 16, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
  }, [snake, food]);

  // Start the game
  const startGame = useCallback(() => {
    if (gameState === 'GAME_OVER') {
      initGame();
    }
    
    setGameState('PLAYING');
    
    if (!gameLoopRef.current) {
      gameLoopRef.current = setInterval(gameTick, GAME_SPEED);
    }
  }, [gameState, initGame, gameTick]);

  // Pause the game
  const pauseGame = useCallback(() => {
    setGameState('PAUSED');
    
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  // Resume the game
  const resumeGame = useCallback(() => {
    setGameState('PLAYING');
    
    if (!gameLoopRef.current) {
      gameLoopRef.current = setInterval(gameTick, GAME_SPEED);
    }
  }, [gameTick]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState === 'GAME_OVER') return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (snake.direction !== 'DOWN') {
            setSnake((prev) => ({
              ...prev,
              nextDirection: 'UP',
            }));
          }
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (snake.direction !== 'UP') {
            setSnake((prev) => ({
              ...prev,
              nextDirection: 'DOWN',
            }));
          }
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (snake.direction !== 'RIGHT') {
            setSnake((prev) => ({
              ...prev,
              nextDirection: 'LEFT',
            }));
          }
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (snake.direction !== 'LEFT') {
            setSnake((prev) => ({
              ...prev,
              nextDirection: 'RIGHT',
            }));
          }
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
      }
    },
    [gameState, snake.direction, pauseGame, resumeGame, startGame]
  );

  // Initialize game on mount
  useEffect(() => {
    // Setup initial game state
    initGame();
    
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      
      if (bonusTimerId) {
        clearTimeout(bonusTimerId);
      }
    };
  }, [initGame, handleKeyDown, bonusTimerId]);

  // Animation loop
  useEffect(() => {
    const animationFrame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrame);
  }, [draw]);

  // Game tick effect
  useEffect(() => {
    if (gameState === 'PLAYING' && !gameLoopRef.current) {
      gameLoopRef.current = setInterval(gameTick, GAME_SPEED);
    }
    
    return () => {
      if (gameLoopRef.current && gameState !== 'PLAYING') {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [gameState, gameTick]);

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex flex-col sm:flex-row justify-between w-full items-center">
        <div className="flex flex-col items-center sm:items-start mb-2 sm:mb-0">
          <p className="font-pixel text-neon-green text-base">Score: {score}</p>
          <p className="font-pixel text-neon-yellow text-xs">High Score: {highScore}</p>
        </div>
        
        <div className="flex flex-col items-center sm:items-end">
          <p className="font-pixel text-neon-pink text-xs">Length: {snakeLength}</p>
        </div>
      </div>
      
      <div 
        className="relative border-4 border-neon-green rounded-lg overflow-hidden shadow-lg"
        style={{ 
          boxShadow: '0 0 20px rgba(0, 255, 0, 0.5), 0 0 30px rgba(0, 255, 0, 0.3) inset',
          width: CANVAS_SIZE + 8, // Add 8 for border
          height: CANVAS_SIZE + 8 // Add 8 for border
        }}
      >
        <canvas 
          ref={canvasRef} 
          width={CANVAS_SIZE} 
          height={CANVAS_SIZE}
          className="bg-black"
        />
        
        {gameState === 'IDLE' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <h3 className="text-3xl font-pixel text-neon-green mb-6 animate-pulse">SNAKE</h3>
            <p className="text-white mb-6 text-center px-4">
              Use arrow keys or WASD to control the snake.<br/>
              Eat food to grow longer and earn points.<br/>
              Yellow food gives bonus points!
            </p>
            <Button 
              onClick={startGame}
              className="bg-neon-green text-black hover:bg-neon-green/80 font-pixel"
            >
              Start Game
            </Button>
          </div>
        )}
        
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <h3 className="text-3xl font-pixel text-neon-yellow mb-6">PAUSED</h3>
            <Button 
              onClick={resumeGame}
              className="bg-neon-yellow text-black hover:bg-neon-yellow/80 font-pixel"
            >
              Resume
            </Button>
          </div>
        )}
        
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
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
      </div>
      
      <div className="mt-8">
        <div className="grid grid-cols-3 gap-4 justify-center max-w-xs mx-auto">
          {/* Virtual controls for mobile */}
          <div className="invisible"></div>
          <Button 
            onClick={() => handleKeyDown({ key: 'ArrowUp' } as KeyboardEvent)}
            className="bg-neon-green/30 hover:bg-neon-green/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Up"
          >
            ▲
          </Button>
          <div className="invisible"></div>
          
          <Button 
            onClick={() => handleKeyDown({ key: 'ArrowLeft' } as KeyboardEvent)}
            className="bg-neon-green/30 hover:bg-neon-green/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
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
            className="bg-neon-green/30 hover:bg-neon-green/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Right"
          >
            ►
          </Button>
          
          <div className="invisible"></div>
          <Button 
            onClick={() => handleKeyDown({ key: 'ArrowDown' } as KeyboardEvent)}
            className="bg-neon-green/30 hover:bg-neon-green/50 p-2 rounded-lg w-12 h-12 flex items-center justify-center"
            aria-label="Down"
          >
            ▼
          </Button>
          <div className="invisible"></div>
        </div>
      </div>
      
      <div className="mt-6 text-center text-xs text-gray-500">
        <p>Use keyboard arrows or WASD to move. Space to pause/resume.</p>
      </div>
    </div>
  );
};

export default SnakeGame;
