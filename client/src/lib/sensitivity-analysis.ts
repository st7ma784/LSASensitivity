import { hungarianAlgorithm } from './hungarian-algorithm';

/**
 * Calculate sensitivity analysis for each cell in the cost matrix
 * @param costMatrix - Original cost matrix
 * @param assignment - Optimal assignment from Hungarian algorithm
 * @param mode - Optimization mode ('min' or 'max')
 * @returns Matrix of sensitivity values (how much each cell can change before affecting assignment)
 */
export function calculateSensitivity(
  costMatrix: number[][],
  assignment: number[],
  mode: 'min' | 'max' = 'min'
): (number | null)[][] {
  const rows = costMatrix.length;
  const cols = costMatrix[0]?.length || 0;
  const sensitivityMatrix: (number | null)[][] = [];

  if (rows === 0 || cols === 0) return sensitivityMatrix;

  // Initialize sensitivity matrix
  for (let i = 0; i < rows; i++) {
    sensitivityMatrix[i] = new Array(cols).fill(null);
  }

  // Get the original optimal cost
  const originalResult = hungarianAlgorithm(costMatrix, mode);
  const originalCost = originalResult.cost;

  // For each cell, calculate how much it can change before the assignment changes
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      try {
        const sensitivity = calculateCellSensitivity(
          costMatrix,
          i,
          j,
          assignment,
          originalCost,
          mode
        );
        sensitivityMatrix[i][j] = sensitivity;
      } catch (error) {
        console.warn(`Error calculating sensitivity for cell [${i}][${j}]:`, error);
        sensitivityMatrix[i][j] = null;
      }
    }
  }

  return sensitivityMatrix;
}

function calculateCellSensitivity(
  costMatrix: number[][],
  row: number,
  col: number,
  assignment: number[],
  originalCost: number,
  mode: 'min' | 'max'
): number {
  const originalValue = costMatrix[row][col];
  const isAssigned = assignment[row] === col;

  // If this cell is not in the optimal assignment, it can change infinitely
  // without affecting the assignment (until it becomes competitive)
  if (!isAssigned) {
    return calculateNonAssignedSensitivity(costMatrix, row, col, assignment, mode);
  }

  // For assigned cells, find the maximum change before assignment becomes suboptimal
  return calculateAssignedSensitivity(costMatrix, row, col, assignment, originalCost, mode);
}

function calculateNonAssignedSensitivity(
  costMatrix: number[][],
  row: number,
  col: number,
  assignment: number[],
  mode: 'min' | 'max'
): number {
  // For non-assigned cells, calculate how much the value needs to change
  // to become part of the optimal assignment
  
  // Find the current cost for this row in the assignment
  const currentAssignedCol = assignment[row];
  if (currentAssignedCol === -1) return Infinity;
  
  const currentCost = costMatrix[row][currentAssignedCol];
  const thisCellCost = costMatrix[row][col];
  
  if (mode === 'min') {
    // For minimization, the cell becomes competitive when it's less than current assignment
    const maxDecrease = thisCellCost - currentCost + 1;
    return maxDecrease > 0 ? maxDecrease : Infinity;
  } else {
    // For maximization, the cell becomes competitive when it's greater than current assignment
    const maxIncrease = currentCost - thisCellCost + 1;
    return maxIncrease > 0 ? maxIncrease : Infinity;
  }
}

function calculateAssignedSensitivity(
  costMatrix: number[][],
  row: number,
  col: number,
  assignment: number[],
  originalCost: number,
  mode: 'min' | 'max'
): number {
  const originalValue = costMatrix[row][col];
  
  // Binary search to find the maximum change
  let maxChange = 0;
  let step = 1;
  
  // First, find a reasonable upper bound
  while (step <= 1000) {
    const testMatrix = costMatrix.map(r => [...r]);
    testMatrix[row][col] = originalValue + (mode === 'min' ? step : -step);
    
    const result = hungarianAlgorithm(testMatrix, mode);
    const assignmentChanged = !arraysEqual(result.assignment, assignment);
    
    if (assignmentChanged) {
      break;
    }
    
    maxChange = step;
    step *= 2;
  }
  
  // Binary search for exact threshold
  let left = maxChange;
  let right = step;
  
  while (left < right) {
    const mid = Math.floor((left + right + 1) / 2);
    const testMatrix = costMatrix.map(r => [...r]);
    testMatrix[row][col] = originalValue + (mode === 'min' ? mid : -mid);
    
    const result = hungarianAlgorithm(testMatrix, mode);
    const assignmentChanged = !arraysEqual(result.assignment, assignment);
    
    if (assignmentChanged) {
      right = mid - 1;
    } else {
      left = mid;
    }
  }
  
  return left;
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}
