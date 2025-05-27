/**
 * Initialize a matrix with random values
 */
export function initializeMatrix(rows: number, cols: number): number[][] {
  const matrix: number[][] = [];
  for (let i = 0; i < rows; i++) {
    matrix[i] = [];
    for (let j = 0; j < cols; j++) {
      matrix[i][j] = Math.floor(Math.random() * 100) + 1;
    }
  }
  return matrix;
}

/**
 * Get CSS classes for cost matrix cell colors based on value
 */
export function getCostMatrixColor(value: number): string {
  if (value <= 25) return 'bg-blue-50 border border-blue-200';
  if (value <= 50) return 'bg-blue-100 border border-blue-300';
  if (value <= 75) return 'bg-blue-200 border border-blue-400';
  return 'bg-blue-300 border border-blue-500';
}

/**
 * Get CSS classes for sensitivity matrix cell colors based on sensitivity value
 */
export function getSensitivityColor(value: number | null): string {
  if (value === null) return 'bg-gray-100 border border-gray-300';
  if (value === Infinity || value > 10) return 'bg-emerald-100 border border-emerald-300';
  if (value >= 6) return 'bg-yellow-100 border border-yellow-300';
  if (value >= 4) return 'bg-orange-100 border border-orange-300';
  return 'bg-red-100 border border-red-300';
}

/**
 * Deep copy a 2D matrix
 */
export function deepCopyMatrix(matrix: number[][]): number[][] {
  return matrix.map(row => [...row]);
}

/**
 * Validate matrix dimensions and values
 */
export function validateMatrix(matrix: number[][]): boolean {
  if (matrix.length === 0) return false;
  const cols = matrix[0].length;
  if (cols === 0) return false;
  
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i].length !== cols) return false;
    for (let j = 0; j < cols; j++) {
      if (!Number.isFinite(matrix[i][j]) || matrix[i][j] < 0) return false;
    }
  }
  
  return true;
}
