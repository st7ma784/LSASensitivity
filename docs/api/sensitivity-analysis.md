# Sensitivity Analysis API

## Overview

The `calculateSensitivity` function performs sensitivity analysis on assignment problems, determining how much each cost matrix element can change before the optimal assignment changes.

## Function Signature

```typescript
function calculateSensitivity(
  costMatrix: number[][],
  assignment: number[],
  mode: 'min' | 'max' = 'min'
): (number | null)[][]
```

## Parameters

### `costMatrix: number[][]`
- **Type**: Two-dimensional array of numbers
- **Description**: Original cost matrix used for assignment
- **Requirements**: Same matrix used to generate the assignment

### `assignment: number[]`
- **Type**: Array of integers
- **Description**: Optimal assignment from Hungarian algorithm where `assignment[i] = j` means row `i` is assigned to column `j`
- **Requirements**: Must be a valid optimal assignment for the given cost matrix

### `mode: 'min' | 'max'`
- **Type**: String literal union
- **Default**: `'min'`
- **Description**: Optimization mode used for the original assignment
- **Must match**: The mode used when computing the assignment

## Return Value

### `(number | null)[][]`

A matrix of the same dimensions as `costMatrix` where each element represents:

- **`number`**: Maximum change allowed before assignment changes
- **`null`**: Calculation error or invalid position
- **`Infinity`**: Can change infinitely without affecting assignment

## Mathematical Interpretation

### For Assigned Cells $(i,j)$ where `assignment[i] = j`

The sensitivity $s_{ij}$ represents the maximum increase (minimization) or decrease (maximization) in cost before the assignment becomes suboptimal:

**Minimization**: $c_{ij} + s_{ij}$ is the maximum cost before alternative assignment becomes better
**Maximization**: $c_{ij} - s_{ij}$ is the minimum cost before alternative assignment becomes better

### For Non-Assigned Cells $(i,j)$ where `assignment[i] ≠ j`

The sensitivity represents how much the cost must change to make this cell part of the optimal assignment:

**Minimization**: $c_{ij} - s_{ij}$ would make this assignment competitive
**Maximization**: $c_{ij} + s_{ij}$ would make this assignment competitive

## Examples

### Basic Usage

```typescript
const costMatrix = [
  [4, 1, 3],
  [2, 0, 5],
  [3, 2, 2]
];

const { assignment } = hungarianAlgorithm(costMatrix, 'min');
const sensitivity = calculateSensitivity(costMatrix, assignment, 'min');

// sensitivity[i][j] tells us how much element (i,j) can change
// before the optimal assignment changes
```

### Interpreting Results

```typescript
// If sensitivity[0][1] = 5 for an assigned cell
// The cost can increase from 1 to 6 before assignment changes

// If sensitivity[0][2] = 3 for a non-assigned cell  
// The cost must decrease from 3 to 0 to enter the assignment
```

### Color-Coded Visualization

The application uses color coding based on sensitivity values:

```typescript
function getSensitivityColor(value: number | null): string {
  if (value === null) return 'bg-gray-100 border border-gray-300';     // Error
  if (value === Infinity || value > 10) return 'bg-emerald-100';      // Very stable
  if (value >= 6) return 'bg-yellow-100';                             // Stable  
  if (value >= 4) return 'bg-orange-100';                             // Moderate
  return 'bg-red-100';                                                 // Sensitive
}
```

## Algorithm Details

### For Non-Assigned Cells

Direct calculation comparing with current assignment:

```typescript
// For cell (i,j) not in assignment
const currentAssignedCol = assignment[i];
const currentCost = costMatrix[i][currentAssignedCol];
const thisCellCost = costMatrix[i][j];

if (mode === 'min') {
  sensitivity = thisCellCost - currentCost + 1;
} else {
  sensitivity = currentCost - thisCellCost + 1; 
}
```

### For Assigned Cells

Binary search to find exact threshold:

```typescript
// Find maximum change before assignment changes
let maxChange = 0;
let step = 1;

// Exponential search for upper bound
while (step <= MAX_SEARCH) {
  const testMatrix = deepCopyMatrix(costMatrix);
  testMatrix[row][col] = originalValue + (mode === 'min' ? step : -step);
  
  const newAssignment = hungarianAlgorithm(testMatrix, mode);
  if (!arraysEqual(newAssignment.assignment, assignment)) {
    break;
  }
  
  maxChange = step;
  step *= 2;
}

// Binary search for exact threshold
// ... (detailed implementation)
```

## Performance Characteristics

### Time Complexity
- **Non-assigned cells**: $O(1)$ per cell
- **Assigned cells**: $O(\log S \cdot n^3)$ per cell where $S$ is search bound
- **Full matrix**: $O(n^2 \log S \cdot n^3) = O(n^5 \log S)$

### Space Complexity
- $O(n^2)$ for result matrix and temporary copies

### Optimization Strategies

1. **Early Termination**: Stop search when sensitivity exceeds practical threshold
2. **Adaptive Bounds**: Adjust search range based on matrix values
3. **Caching**: Reuse Hungarian algorithm results when possible

## Edge Cases

### Empty Assignment
```typescript
const sensitivity = calculateSensitivity([], [], 'min');
// Returns: []
```

### Single Element
```typescript
const matrix = [[5]];
const assignment = [0];
const sensitivity = calculateSensitivity(matrix, assignment, 'min');
// Returns: [[finite_number]]
```

### Degenerate Cases
```typescript
// Multiple optimal solutions may result in low sensitivity values
const matrix = [
  [1, 1],
  [1, 1]
];
// Any assignment is optimal, sensitivities may be 0 or very small
```

## Error Handling

### Invalid Inputs
- **Mismatched dimensions**: Returns matrix of `null` values
- **Invalid assignment**: May produce unexpected results
- **Non-numeric values**: Results in `null` for affected cells

### Calculation Errors
- **Infinite loops**: Protected by maximum iteration bounds
- **Numerical precision**: May affect very small sensitivity values
- **Algorithm failures**: Individual cells return `null`

## Validation

Recommended input validation:

```typescript
function validateSensitivityInputs(
  costMatrix: number[][],
  assignment: number[],
  mode: 'min' | 'max'
): boolean {
  // Check matrix validity
  if (!validateMatrix(costMatrix)) return false;
  
  // Check assignment length
  if (assignment.length !== costMatrix.length) return false;
  
  // Check assignment validity
  const cols = costMatrix[0]?.length || 0;
  return assignment.every(col => col >= 0 && col < cols);
}
```

## Use Cases

### 1. Robustness Analysis
```typescript
// Identify which costs are most critical
const sensitivity = calculateSensitivity(costs, assignment, 'min');
const criticalCells = [];

sensitivity.forEach((row, i) => {
  row.forEach((value, j) => {
    if (value !== null && value < 5) {
      criticalCells.push({row: i, col: j, sensitivity: value});
    }
  });
});
```

### 2. What-If Scenarios
```typescript
// Check if cost increase affects assignment
const newCost = originalCost + increase;
const maxAllowedIncrease = sensitivity[row][col];

if (increase <= maxAllowedIncrease) {
  console.log("Assignment remains optimal");
} else {
  console.log("Assignment may change - recalculation needed");
}
```

### 3. Contract Negotiations
```typescript
// Find negotiation flexibility for each supplier
const flexibilityReport = suppliers.map((supplier, i) => ({
  supplier: supplier.name,
  currentCost: costMatrix[task][i],
  maxIncrease: sensitivity[task][i],
  negotiationRoom: sensitivity[task][i] / costMatrix[task][i] * 100 // percentage
}));
```

## Related Functions

- [`hungarianAlgorithm`](./hungarian-algorithm.md): Required for computing assignments
- [`validateMatrix`](./matrix-utils.md): Input validation
- [`deepCopyMatrix`](./matrix-utils.md): Safe matrix copying for testing