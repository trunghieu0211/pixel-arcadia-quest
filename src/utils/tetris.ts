
// Tetris game utilities

export type TetrisPiece = number[][];
export type TetrisBoard = number[][];

// Tetromino shapes with their colors (index+1 for color)
export const TETROMINOES: TetrisPiece[] = [
  // I-piece (cyan)
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  // J-piece (blue)
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0]
  ],
  // L-piece (orange)
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0]
  ],
  // O-piece (yellow)
  [
    [4, 4],
    [4, 4]
  ],
  // S-piece (green)
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0]
  ],
  // T-piece (purple)
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0]
  ],
  // Z-piece (red)
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0]
  ]
];

// Color mapping for tetrominos
export const TETROMINO_COLORS = [
  'transparent', // 0: empty cell
  '#00FFFF', // 1: cyan (I)
  '#0000FF', // 2: blue (J)
  '#FF8800', // 3: orange (L)
  '#FFFF00', // 4: yellow (O)
  '#00FF00', // 5: green (S)
  '#FF00FF', // 6: purple (T)
  '#FF0000'  // 7: red (Z)
];

// Tetromino shadow colors
export const TETROMINO_SHADOW_COLORS = [
  'transparent',
  'rgba(0, 255, 255, 0.3)',
  'rgba(0, 0, 255, 0.3)',
  'rgba(255, 136, 0, 0.3)',
  'rgba(255, 255, 0, 0.3)',
  'rgba(0, 255, 0, 0.3)',
  'rgba(255, 0, 255, 0.3)',
  'rgba(255, 0, 0, 0.3)'
];

// Create a clean board
export const createBoard = (rows: number, cols: number): TetrisBoard => {
  return Array.from({ length: rows }, () => Array(cols).fill(0));
};

// Check if the current position is valid
export const isValidPosition = (
  board: TetrisBoard,
  piece: TetrisPiece,
  position: { x: number; y: number }
): boolean => {
  const { x, y } = position;
  
  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      // Skip empty cells in the tetromino
      if (!piece[row][col]) continue;
      
      const boardRow = y + row;
      const boardCol = x + col;
      
      // Check boundaries
      if (
        boardRow < 0 || 
        boardRow >= board.length || 
        boardCol < 0 || 
        boardCol >= board[0].length
      ) {
        return false;
      }
      
      // Check collision with existing blocks
      if (board[boardRow][boardCol] !== 0) {
        return false;
      }
    }
  }
  
  return true;
};

// Merge the current piece into the board
export const mergePiece = (
  board: TetrisBoard,
  piece: TetrisPiece,
  position: { x: number; y: number }
): TetrisBoard => {
  const newBoard = board.map(row => [...row]);
  const { x, y } = position;
  
  for (let row = 0; row < piece.length; row++) {
    for (let col = 0; col < piece[row].length; col++) {
      if (piece[row][col] !== 0) {
        newBoard[y + row][x + col] = piece[row][col];
      }
    }
  }
  
  return newBoard;
};

// Rotate a tetromino (90 degrees clockwise)
export const rotatePiece = (piece: TetrisPiece): TetrisPiece => {
  const rows = piece.length;
  const cols = piece[0].length;
  const rotated: TetrisPiece = Array.from({ length: cols }, () => Array(rows).fill(0));
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      rotated[col][rows - 1 - row] = piece[row][col];
    }
  }
  
  return rotated;
};

// Check for completed rows and remove them
export const clearLines = (board: TetrisBoard): { newBoard: TetrisBoard, clearedLines: number } => {
  const rows = board.length;
  const cols = board[0].length;
  let clearedLines = 0;
  
  // Find completed rows
  const newBoard = board.filter(row => {
    const isComplete = row.every(cell => cell !== 0);
    if (isComplete) clearedLines++;
    return !isComplete;
  });
  
  // Add new empty rows at the top
  while (newBoard.length < rows) {
    newBoard.unshift(Array(cols).fill(0));
  }
  
  return { newBoard, clearedLines };
};

// Calculate the score based on cleared lines
export const calculateScore = (clearedLines: number, level: number): number => {
  const linePoints = [0, 40, 100, 300, 1200]; // Points for 0, 1, 2, 3, or 4 lines
  return linePoints[clearedLines] * (level + 1);
};

// Calculate level based on total cleared lines
export const calculateLevel = (totalLines: number): number => {
  return Math.floor(totalLines / 10);
};

// Calculate game speed (ms per drop) based on level
export const calculateSpeed = (level: number): number => {
  return Math.max(100, 800 - (level * 50)); // Speed increases with level, min 100ms
};

// Get a random tetromino
export const getRandomPiece = (): TetrisPiece => {
  const index = Math.floor(Math.random() * TETROMINOES.length);
  return TETROMINOES[index].map(row => [...row]);
};

// Calculate shadow position (where piece would land)
export const calculateShadowPosition = (
  board: TetrisBoard,
  piece: TetrisPiece,
  position: { x: number; y: number }
): { x: number; y: number } => {
  let shadowY = position.y;
  
  // Move shadow down until it collides
  while (isValidPosition(board, piece, { x: position.x, y: shadowY + 1 })) {
    shadowY++;
  }
  
  return { x: position.x, y: shadowY };
};
