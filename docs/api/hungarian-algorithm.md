# Hungarian Algorithm API

## Overview

The `hungarianAlgorithm` function implements the Hungarian algorithm for solving assignment problems optimally in polynomial time.

## Function Signature

```typescript
function hungarianAlgorithm(
  costMatrix: number[][],
  mode: 'min' | 'max' = 'min'
): AssignmentResult
```

## Parameters

### `costMatrix: number[][]`
- **Type**: Two-dimensional array of numbers
- **Description**: The cost matrix where `costMatrix[i][j]` represents the cost of assigning row `i` to column `j`
- **Constraints**: 
  - All values must be finite numbers
  - Matrix can be rectangular (different number of rows and columns)
  - Empty matrices are handled gracefully

### `mode: 'min' | 'max'`
- **Type**: String literal union
- **Default**: `'min'`
- **Description**: Optimization objective
  - `'min'`: Find assignment that minimizes total cost
  - `'max'`: Find assignment that maximizes total cost

## Return Value

### `AssignmentResult`

```typescript
interface AssignmentResult {
  cost: number;        // Total cost of optimal assignment
  assignment: number[]; // Array where assignment[i] = j means row i assigned to column j
}
```

#### Properties

- **`cost`**: The optimal total cost/profit of the assignment
- **`assignment`**: Array of length equal to number of rows, where each element indicates the assigned column for that row

## Mathematical Guarantees

### Optimality
The function always returns a globally optimal solution. For minimization problems:
$$\text{cost} = \min \sum_{i=1}^{n} c_{i,\text{assignment}[i]}$$

### Time Complexity
- **Best case**: $O(n^2)$ when matrix is already optimally reduced
- **Average case**: $O(n^3)$
- **Worst case**: $O(n^3)$

### Space Complexity
- $O(n^2)$ for internal matrix operations

## Examples

### Basic Minimization

```typescript
const costMatrix = [
  [4, 1, 3],
  [2, 0, 5], 
  [3, 2, 2]
];

const result = hungarianAlgorithm(costMatrix, 'min');
// result.cost = 3 (optimal: 1 + 0 + 2)
// result.assignment = [1, 1, 2] means:
//   Row 0 → Column 1 (cost 1)
//   Row 1 → Column 1 (cost 0) 
//   Row 2 → Column 2 (cost 2)
```

### Profit Maximization

```typescript
const profitMatrix = [
  [3, 5, 1],
  [4, 2, 6],
  [2, 3, 4]
];

const result = hungarianAlgorithm(profitMatrix, 'max');
// Finds assignment that maximizes total profit
```

### Rectangular Matrix

```typescript
// More workers than tasks
const matrix = [
  [1, 4],
  [2, 3],
  [3, 2]
];

const result = hungarianAlgorithm(matrix, 'min');
// result.assignment.length = 3 (number of rows)
// Some workers may be unassigned (assigned to dummy columns)
```

## Edge Cases

### Empty Matrix
```typescript
const result = hungarianAlgorithm([], 'min');
// result.cost = 0
// result.assignment = []
```

### Single Element
```typescript
const result = hungarianAlgorithm([[5]], 'min');
// result.cost = 5
// result.assignment = [0]
```

### Zero Costs
```typescript
const matrix = [
  [0, 1],
  [1, 0]
];
const result = hungarianAlgorithm(matrix, 'min');
// result.cost = 0 (optimal assignment uses zeros)
```

## Implementation Details

### Matrix Preprocessing

1. **Square Matrix Creation**: Non-square matrices are padded:
   - Minimization: Pad with zeros
   - Maximization: Pad with maximum value

2. **Maximization Conversion**: Transform to minimization problem:
   ```
   c'[i][j] = max_value - c[i][j]
   ```

### Algorithm Steps

1. **Row Reduction**: Subtract minimum from each row
2. **Column Reduction**: Subtract minimum from each column  
3. **Zero Coverage**: Find minimum line cover of zeros
4. **Optimal Assignment**: Extract assignment if enough zeros covered
5. **Zero Creation**: Create additional zeros if needed (repeat from step 3)

### Assignment Extraction

Uses augmenting path method to find valid assignment among zero positions:
- Each row assigned to exactly one column
- Each column assigned to at most one row
- Only zero-cost positions used

## Error Handling

The function handles various edge cases gracefully:

- **Invalid input**: Returns `{cost: 0, assignment: []}`
- **Non-numeric values**: May produce unexpected results (validate input)
- **Infinite values**: Should be avoided in cost matrix
- **Negative values**: Supported (algorithm handles arbitrary real values)

## Performance Considerations

### Large Matrices
For matrices larger than 100×100, consider:
- Progress callbacks for long-running computations
- Approximate algorithms for real-time applications
- Matrix sparsity optimizations

### Memory Usage
Peak memory usage is approximately 5× the input matrix size due to:
- Working matrix copies
- Intermediate data structures
- Assignment tracking arrays

## Validation

Always validate inputs for production use:

```typescript
function validateCostMatrix(matrix: number[][]): boolean {
  if (matrix.length === 0) return true; // Empty matrix OK
  
  const cols = matrix[0].length;
  if (cols === 0) return false;
  
  return matrix.every(row => 
    row.length === cols && 
    row.every(val => Number.isFinite(val))
  );
}
```

## Related Functions

- [`calculateSensitivity`](./sensitivity-analysis.md): Analyze robustness of assignments
- [`validateMatrix`](./matrix-utils.md): Input validation utilities
- [`deepCopyMatrix`](./matrix-utils.md): Safe matrix copying