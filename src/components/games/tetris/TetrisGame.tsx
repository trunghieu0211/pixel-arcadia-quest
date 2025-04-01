import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  TetrisBoard, 
  TetrisPiece,
  TETROMINO_COLORS,
  TETROMINO_SHADOW_COLORS,
  createBoard,
  getRandomPiece,
  isValidPosition,
  mergePiece,
  rotatePiece,
  clearLines,
  calculateScore,
  calculateLevel,
  calculateSpeed,
  calculateShadowPosition
} from '../../../utils/tetris';

const BOARD_HEIGHT = 20;
const BOARD_WIDTH = 10;

const TetrisGame: React.FC = () => {
  const [board, setBoard] = useState<TetrisBoard>(() => createBoard(BOARD_HEIGHT, BOARD_WIDTH));
  const [currentPiece, setCurrentPiece] = useState<TetrisPiece>(() => getRandomPiece());
  const [nextPiece, setNextPiece] = useState<TetrisPiece>(() => getRandomPiece());
  const [position, setPosition] = useState({ x: 3, y: 0 });
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [dropTime, setDropTime] = useState(() => calculateSpeed(0));
  const dropInterval = useRef<number | null>(null);
  
  // Calculate shadow position
  const shadowPosition = calculateShadowPosition(board, currentPiece, position);
  
  // Reset game
  const resetGame = useCallback(() => {
    setBoard(createBoard(BOARD_HEIGHT, BOARD_WIDTH));
    setCurrentPiece(getRandomPiece());
    setNextPiece(getRandomPiece());
    setPosition({ x: 3, y: 0 });
    setScore(0);
    setLinesCleared(0);
    setLevel(0);
    setGameOver(false);
    setIsPaused(false);
    setDropTime(calculateSpeed(0));
  }, []);
  
  // Generate new piece
  const getNewPiece = useCallback(() => {
    setCurrentPiece(nextPiece);
    setNextPiece(getRandomPiece());
    setPosition({ x: 3, y: 0 });
    
    // Check if game over (can't place new piece)
    if (!isValidPosition(board, nextPiece, { x: 3, y: 0 })) {
      setGameOver(true);
    }
  }, [nextPiece, board]);
  
  // Move piece
  const movePiece = useCallback((dx: number, dy: number) => {
    if (gameOver || isPaused) return false;
    
    const newPos = { x: position.x + dx, y: position.y + dy };
    
    if (isValidPosition(board, currentPiece, newPos)) {
      setPosition(newPos);
      return true;
    }
    
    // If moving down and hitting something, merge piece
    if (dy > 0) {
      const newBoard = mergePiece(board, currentPiece, position);
      const { newBoard: clearedBoard, clearedLines } = clearLines(newBoard);
      
      setBoard(clearedBoard);
      
      if (clearedLines > 0) {
        const newLinesCleared = linesCleared + clearedLines;
        const newLevel = calculateLevel(newLinesCleared);
        const additionalScore = calculateScore(clearedLines, level);
        
        setLinesCleared(newLinesCleared);
        setLevel(newLevel);
        setScore(score + additionalScore);
        setDropTime(calculateSpeed(newLevel));
      }
      
      getNewPiece();
    }
    
    return false;
  }, [board, currentPiece, position, gameOver, isPaused, getNewPiece, linesCleared, level, score]);
  
  // Rotate piece
  const rotatePieceAction = useCallback(() => {
    if (gameOver || isPaused) return;
    
    const rotated = rotatePiece(currentPiece);
    
    if (isValidPosition(board, rotated, position)) {
      setCurrentPiece(rotated);
    } else {
      // Try wall kicks (offset by 1 square left/right)
      const kicks = [
        { x: 1, y: 0 },   // right
        { x: -1, y: 0 },  // left
        { x: 0, y: -1 },  // up
        { x: 2, y: 0 },   // right x2
        { x: -2, y: 0 },  // left x2
      ];
      
      for (const kick of kicks) {
        const newPos = { 
          x: position.x + kick.x, 
          y: position.y + kick.y 
        };
        
        if (isValidPosition(board, rotated, newPos)) {
          setPosition(newPos);
          setCurrentPiece(rotated);
          return;
        }
      }
    }
  }, [board, currentPiece, position, gameOver, isPaused]);
  
  // Hard drop
  const hardDrop = useCallback(() => {
    if (gameOver || isPaused) return;
    
    while (movePiece(0, 1)) {
      // Keep moving down
      setScore(prev => prev + 1); // Add 1 point per cell dropped
    }
  }, [gameOver, isPaused, movePiece]);
  
  // Handle keydown events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === 'r' || e.key === 'R') resetGame();
        return;
      }
      
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(!isPaused);
        return;
      }
      
      if (isPaused) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          movePiece(-1, 0);
          break;
        case 'ArrowRight':
          movePiece(1, 0);
          break;
        case 'ArrowDown':
          movePiece(0, 1);
          break;
        case 'ArrowUp':
          rotatePieceAction();
          break;
        case ' ':
          hardDrop();
          break;
        default:
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameOver, isPaused, movePiece, rotatePieceAction, hardDrop, resetGame]);
  
  // Set up auto drop interval
  useEffect(() => {
    if (gameOver || isPaused) {
      if (dropInterval.current) clearInterval(dropInterval.current);
      return;
    }
    
    if (dropInterval.current) clearInterval(dropInterval.current);
    
    dropInterval.current = setInterval(() => {
      movePiece(0, 1);
    }, dropTime);
    
    return () => {
      if (dropInterval.current) clearInterval(dropInterval.current);
    };
  }, [gameOver, isPaused, movePiece, dropTime]);
  
  // Render board with current piece and shadow
  const renderBoard = () => {
    const displayBoard = [...board.map(row => [...row])];
    
    // Add shadow
    if (!gameOver && !isPaused) {
      for (let row = 0; row < currentPiece.length; row++) {
        for (let col = 0; col < currentPiece[row].length; col++) {
          if (currentPiece[row][col] !== 0) {
            const boardRow = shadowPosition.y + row;
            const boardCol = shadowPosition.x + col;
            
            if (
              boardRow >= 0 && 
              boardRow < BOARD_HEIGHT && 
              boardCol >= 0 && 
              boardCol < BOARD_WIDTH &&
              displayBoard[boardRow][boardCol] === 0
            ) {
              // Use negative value for shadow to distinguish from normal pieces
              displayBoard[boardRow][boardCol] = -currentPiece[row][col];
            }
          }
        }
      }
    }
    
    // Add current piece
    if (!gameOver) {
      for (let row = 0; row < currentPiece.length; row++) {
        for (let col = 0; col < currentPiece[row].length; col++) {
          if (currentPiece[row][col] !== 0) {
            const boardRow = position.y + row;
            const boardCol = position.x + col;
            
            if (
              boardRow >= 0 && 
              boardRow < BOARD_HEIGHT && 
              boardCol >= 0 && 
              boardCol < BOARD_WIDTH
            ) {
              displayBoard[boardRow][boardCol] = currentPiece[row][col];
            }
          }
        }
      }
    }
    
    return displayBoard;
  };
  
  // Render the next piece preview
  const renderNextPiece = () => {
    return (
      <div className="grid grid-cols-4 gap-0.5 justify-center">
        {Array.from({ length: 4 }, (_, row) => (
          <React.Fragment key={`next-${row}`}>
            {Array.from({ length: 4 }, (_, col) => {
              const value = nextPiece[row] && nextPiece[row][col] ? nextPiece[row][col] : 0;
              return (
                <div 
                  key={`next-${row}-${col}`}
                  className="w-4 h-4 border border-gray-800"
                  style={{ 
                    backgroundColor: value ? TETROMINO_COLORS[value] : 'transparent',
                    boxShadow: value ? `0 0 5px ${TETROMINO_COLORS[value]}` : 'none'
                  }}
                ></div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  };
  
  // Get cell color based on value
  const getCellColor = (value: number) => {
    if (value === 0) return 'transparent';
    if (value < 0) return TETROMINO_SHADOW_COLORS[Math.abs(value)];
    return TETROMINO_COLORS[value];
  };
  
  // Build displayable board
  const displayBoard = renderBoard();
  
  return (
    <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
      {/* Game board */}
      <div className="relative border-4 border-gray-800 shadow-lg arcade-shadow pixel-corners bg-black/80">
        {/* Grid lines */}
        <div 
          className="absolute inset-0 grid" 
          style={{ 
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
            backgroundImage: 'linear-gradient(to right, rgba(70, 70, 70, 0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(70, 70, 70, 0.1) 1px, transparent 1px)',
            backgroundSize: `${100/BOARD_WIDTH}% ${100/BOARD_HEIGHT}%`
          }}
        ></div>
        
        {/* Game board */}
        <div
          className="grid gap-px"
          style={{
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
            width: '300px',
            height: '600px'
          }}
        >
          {displayBoard.flat().map((cell, index) => {
            const color = getCellColor(cell);
            const isShadow = cell < 0;
            
            return (
              <div
                key={`cell-${index}`}
                className={`${isShadow ? '' : 'border border-gray-800/30'}`}
                style={{
                  backgroundColor: color,
                  boxShadow: !isShadow && cell !== 0 ? `inset 0 0 2px rgba(255,255,255,0.5), 0 0 5px ${color}` : 'none'
                }}
              ></div>
            );
          })}
        </div>
        
        {/* Scanlines effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-transparent bg-[length:100%_4px] bg-repeat" 
          style={{ backgroundImage: 'linear-gradient(transparent 50%, rgba(0, 0, 0, 0.05) 50%)' }}
        ></div>
        
        {/* Screen glare effect */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
        
        {/* Game over overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 flex-col">
            <h2 className="text-2xl font-pixel text-red-500 mb-3 animate-pulse">GAME OVER</h2>
            <p className="text-white mb-6">Final Score: {score}</p>
            <button 
              onClick={resetGame}
              className="px-4 py-2 bg-red-500 text-white rounded font-pixel hover:bg-red-600 transition-colors"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
        
        {/* Pause overlay */}
        {isPaused && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <h2 className="text-2xl font-pixel text-yellow-400 animate-pulse">PAUSED</h2>
          </div>
        )}
      </div>
      
      {/* Game stats and controls */}
      <div className="w-full md:w-44">
        {/* Next piece preview */}
        <div className="bg-gray-900 border-2 border-gray-700 p-3 mb-4 pixel-corners">
          <h3 className="text-center text-gray-400 text-xs mb-2">NEXT</h3>
          <div className="flex justify-center">
            {renderNextPiece()}
          </div>
        </div>
        
        {/* Score and level */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-gray-900 border-2 border-gray-700 p-3 pixel-corners">
            <h3 className="text-center text-gray-400 text-xs">SCORE</h3>
            <p className="text-center text-neon-green font-pixel">{score}</p>
          </div>
          
          <div className="bg-gray-900 border-2 border-gray-700 p-3 pixel-corners">
            <h3 className="text-center text-gray-400 text-xs">LEVEL</h3>
            <p className="text-center text-neon-blue font-pixel">{level}</p>
          </div>
          
          <div className="col-span-2 bg-gray-900 border-2 border-gray-700 p-3 pixel-corners">
            <h3 className="text-center text-gray-400 text-xs">LINES</h3>
            <p className="text-center text-neon-pink font-pixel">{linesCleared}</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-gray-900 border-2 border-gray-700 p-3 pixel-corners mb-4">
          <h3 className="text-center text-gray-400 text-xs mb-2">CONTROLS</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <p><span className="text-neon-blue">←→</span> Move</p>
            <p><span className="text-neon-green">↑</span> Rotate</p>
            <p><span className="text-neon-yellow">↓</span> Soft Drop</p>
            <p><span className="text-neon-pink">Space</span> Hard Drop</p>
            <p><span className="text-neon-purple">P</span> Pause</p>
            <p><span className="text-red-500">R</span> Reset</p>
          </div>
        </div>
        
        {/* Buttons for mobile */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <button
            className="bg-gray-800 border border-gray-700 p-2 text-center text-white"
            onClick={() => movePiece(-1, 0)}
          >
            ←
          </button>
          <button
            className="bg-gray-800 border border-gray-700 p-2 text-center text-white"
            onClick={() => movePiece(0, 1)}
          >
            ↓
          </button>
          <button
            className="bg-gray-800 border border-gray-700 p-2 text-center text-white"
            onClick={() => movePiece(1, 0)}
          >
            →
          </button>
          <button
            className="bg-gray-800 border border-gray-700 p-2 text-center text-white"
            onClick={rotatePieceAction}
          >
            Rotate
          </button>
          <button
            className="bg-gray-800 border border-gray-700 p-2 text-center text-white"
            onClick={hardDrop}
          >
            Drop
          </button>
          <button
            className="bg-gray-800 border border-gray-700 p-2 text-center text-white"
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TetrisGame;
