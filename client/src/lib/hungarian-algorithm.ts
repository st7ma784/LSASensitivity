export interface AssignmentResult {
  cost: number;
  assignment: number[];
}

/**
 * Hungarian Algorithm implementation for solving the assignment problem
 * @param costMatrix - 2D array representing costs
 * @param mode - 'min' for minimization, 'max' for maximization
 * @returns Object containing the optimal cost and assignment
 */
export function hungarianAlgorithm(
  costMatrix: number[][],
  mode: 'min' | 'max' = 'min'
): AssignmentResult {
  if (costMatrix.length === 0 || costMatrix[0].length === 0) {
    return { cost: 0, assignment: [] };
  }

  const rows = costMatrix.length;
  const cols = costMatrix[0].length;
  
  // Make the matrix square by padding with zeros/large values
  const n = Math.max(rows, cols);
  const matrix: number[][] = [];
  
  // For maximization, convert to minimization by subtracting from max value
  let maxValue = 0;
  if (mode === 'max') {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        maxValue = Math.max(maxValue, costMatrix[i][j]);
      }
    }
  }
  
  // Create square matrix
  for (let i = 0; i < n; i++) {
    matrix[i] = [];
    for (let j = 0; j < n; j++) {
      if (i < rows && j < cols) {
        matrix[i][j] = mode === 'max' ? maxValue - costMatrix[i][j] : costMatrix[i][j];
      } else {
        matrix[i][j] = mode === 'max' ? maxValue : 0;
      }
    }
  }

  // Step 1: Subtract row minimums
  for (let i = 0; i < n; i++) {
    const rowMin = Math.min(...matrix[i]);
    for (let j = 0; j < n; j++) {
      matrix[i][j] -= rowMin;
    }
  }

  // Step 2: Subtract column minimums
  for (let j = 0; j < n; j++) {
    let colMin = Infinity;
    for (let i = 0; i < n; i++) {
      colMin = Math.min(colMin, matrix[i][j]);
    }
    for (let i = 0; i < n; i++) {
      matrix[i][j] -= colMin;
    }
  }

  // Find assignment using augmenting path method
  const assignment = findOptimalAssignment(matrix);
  
  // Calculate the actual cost using original matrix
  let totalCost = 0;
  for (let i = 0; i < rows; i++) {
    if (assignment[i] < cols) {
      totalCost += costMatrix[i][assignment[i]];
    }
  }

  return {
    cost: totalCost,
    assignment: assignment.slice(0, rows)
  };
}

function findOptimalAssignment(matrix: number[][]): number[] {
  const n = matrix.length;
  const assignment = new Array(n).fill(-1);
  const rowCovered = new Array(n).fill(false);
  const colCovered = new Array(n).fill(false);

  // Find initial assignment by looking for zeros
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (matrix[i][j] === 0 && !rowCovered[i] && !colCovered[j]) {
        assignment[i] = j;
        rowCovered[i] = true;
        colCovered[j] = true;
        break;
      }
    }
  }

  // Reset covers for main algorithm
  rowCovered.fill(false);
  colCovered.fill(false);

  let assignedCount = 0;
  for (let i = 0; i < n; i++) {
    if (assignment[i] !== -1) {
      assignedCount++;
      colCovered[assignment[i]] = true;
    }
  }

  while (assignedCount < n) {
    // Find uncovered zeros and create augmenting paths
    const path: Array<[number, number]> = [];
    let found = false;

    for (let i = 0; i < n && !found; i++) {
      if (!rowCovered[i]) {
        for (let j = 0; j < n; j++) {
          if (matrix[i][j] === 0 && !colCovered[j]) {
            path.push([i, j]);
            found = true;
            break;
          }
        }
      }
    }

    if (found) {
      // Augment the path
      let [row, col] = path[path.length - 1];
      while (true) {
        const oldCol = assignment[row];
        assignment[row] = col;
        
        if (oldCol === -1) break;
        
        // Find row assigned to oldCol
        let newRow = -1;
        for (let i = 0; i < n; i++) {
          if (assignment[i] === oldCol && i !== row) {
            newRow = i;
            break;
          }
        }
        
        if (newRow === -1) break;
        row = newRow;
        col = oldCol;
      }

      // Update covers
      assignedCount = 0;
      colCovered.fill(false);
      for (let i = 0; i < n; i++) {
        if (assignment[i] !== -1) {
          assignedCount++;
          colCovered[assignment[i]] = true;
        }
      }
    } else {
      // No uncovered zeros found, need to create them
      const uncoveredRows: number[] = [];
      const uncoveredCols: number[] = [];
      
      for (let i = 0; i < n; i++) {
        if (!rowCovered[i]) uncoveredRows.push(i);
      }
      for (let j = 0; j < n; j++) {
        if (!colCovered[j]) uncoveredCols.push(j);
      }

      if (uncoveredRows.length === 0) break;

      // Find minimum uncovered value
      let minUncovered = Infinity;
      for (const i of uncoveredRows) {
        for (const j of uncoveredCols) {
          minUncovered = Math.min(minUncovered, matrix[i][j]);
        }
      }

      // Subtract from uncovered elements, add to doubly covered
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (!rowCovered[i] && !colCovered[j]) {
            matrix[i][j] -= minUncovered;
          } else if (rowCovered[i] && colCovered[j]) {
            matrix[i][j] += minUncovered;
          }
        }
      }
    }
  }

  return assignment;
}
