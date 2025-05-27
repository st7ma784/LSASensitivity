# Sensitivity Analysis

Sensitivity analysis determines how much each element in the cost matrix can change before the optimal assignment changes. This is crucial for understanding the robustness of the solution and identifying critical parameters.

## Mathematical Foundation

### Definition

For an optimal assignment with cost matrix $C = [c_{ij}]$ and optimal solution $x^* = [x^*_{ij}]$, the sensitivity $s_{ij}$ of element $c_{ij}$ is:

$$s_{ij} = \max\{\delta : \text{optimal assignment unchanged for } c_{ij} \pm \delta\}$$

### Types of Sensitivity

#### 1. Assigned Cell Sensitivity

For cells $(i,j)$ where $x^*_{ij} = 1$ (part of optimal assignment):

The sensitivity represents how much the cost can **increase** (minimization) or **decrease** (maximization) before an alternative assignment becomes optimal.

**Mathematical Approach**:
1. Increase $c_{ij}$ by $\delta$
2. Solve the perturbed problem
3. Find maximum $\delta$ where assignment remains unchanged

#### 2. Non-Assigned Cell Sensitivity  

For cells $(i,j)$ where $x^*_{ij} = 0$ (not in optimal assignment):

The sensitivity represents how much the cost must **decrease** (minimization) or **increase** (maximization) to enter the optimal assignment.

**Calculation**: Compare with current assignment cost for the same row:
$$s_{ij} = |c_{ij} - c_{ik}|$$
where $k$ is the currently assigned column for row $i$.

### Dual-Based Sensitivity Analysis

Using the dual variables $u_i$ (row potentials) and $v_j$ (column potentials) from the Hungarian algorithm:

#### Reduced Costs
$$\bar{c}_{ij} = c_{ij} - u_i - v_j$$

**Properties**:
- $\bar{c}_{ij} = 0$ for assigned cells (complementary slackness)
- $\bar{c}_{ij} \geq 0$ for all cells in minimization problems
- $\bar{c}_{ij} \leq 0$ for all cells in maximization problems

#### Sensitivity from Reduced Costs

For non-assigned cells, the sensitivity equals the reduced cost:
$$s_{ij} = |\bar{c}_{ij}| \text{ for } x^*_{ij} = 0$$

For assigned cells, sensitivity requires solving a modified assignment problem.

## Algorithm Implementation

### Binary Search Method

For assigned cells, we use binary search to find the exact sensitivity threshold:

```pseudocode
function calculateAssignedSensitivity(matrix, row, col, assignment):
    originalValue = matrix[row][col]
    maxChange = 0
    step = 1
    
    // Find upper bound
    while step <= MAX_SEARCH:
        testMatrix = matrix.copy()
        testMatrix[row][col] = originalValue + step
        newAssignment = hungarianAlgorithm(testMatrix)
        
        if newAssignment != assignment:
            break
        maxChange = step
        step *= 2
    
    // Binary search for exact threshold
    left = maxChange
    right = step
    while left < right:
        mid = (left + right + 1) / 2
        testMatrix = matrix.copy()
        testMatrix[row][col] = originalValue + mid
        newAssignment = hungarianAlgorithm(testMatrix)
        
        if newAssignment != assignment:
            right = mid - 1
        else:
            left = mid
    
    return left
```

### Direct Calculation Method

For non-assigned cells, sensitivity can be calculated directly:

$$s_{ij} = \begin{cases}
\infty & \text{if no competition} \\
|c_{ij} - c_{ik}| + 1 & \text{where } k \text{ is assigned column for row } i
\end{cases}$$

## Interpretation of Results

### Color Coding System

Our implementation uses a color-coded system to visualize sensitivity:

- **Green** ($s_{ij} = \infty$ or $s_{ij} > 10$): Very stable, large changes allowed
- **Yellow** ($6 \leq s_{ij} \leq 10$): Moderately stable
- **Orange** ($4 \leq s_{ij} < 6$): Somewhat sensitive
- **Red** ($s_{ij} < 4$): Highly sensitive, small changes affect optimality

### Practical Implications

#### High Sensitivity (Red/Orange)
- Small cost changes can alter the optimal assignment
- Requires careful monitoring and validation
- May indicate multiple near-optimal solutions

#### Low Sensitivity (Green)
- Cost can vary significantly without affecting assignment
- Robust solution
- Good candidates for approximation or rounding

## Advanced Topics

### Parametric Sensitivity Analysis

Consider cost matrix $C(\lambda) = C_0 + \lambda \Delta C$ where $\lambda$ is a parameter.

Find the range of $\lambda$ values for which the current assignment remains optimal:
$$\lambda_{min} \leq \lambda \leq \lambda_{max}$$

### Multi-Parameter Sensitivity

For simultaneous changes in multiple matrix elements:
$$C_{new} = C + \sum_k \delta_k E_k$$

where $E_k$ are unit matrices with 1 in position $(i_k, j_k)$.

The feasible region is defined by:
$$\sum_k \delta_k \leq S_{combined}$$

### Sensitivity Bounds

**Theorem**: For minimization problems, if $s_{ij}$ is the sensitivity of element $c_{ij}$, then:
$$c_{ij} - s_{ij} \leq c'_{ij} \leq c_{ij} + s_{ij}$$

where $c'_{ij}$ represents any cost value that maintains the current optimal assignment.

## Applications

### 1. Resource Planning
Understanding which resource costs are most critical for maintaining optimal allocation.

### 2. Contract Negotiations
Identifying which supplier prices have the most impact on optimal procurement decisions.

### 3. Robust Optimization
Designing solutions that remain optimal under uncertainty.

### 4. What-If Analysis
Analyzing the impact of potential cost changes before they occur.

## Computational Complexity

- **Direct method** for non-assigned cells: $O(1)$
- **Binary search** for assigned cells: $O(\log S \cdot n^3)$ where $S$ is the search bound
- **Complete sensitivity analysis**: $O(n^2 \log S \cdot n^3) = O(n^5 \log S)$

For practical applications, we use optimizations:
- Early termination when sensitivity exceeds threshold
- Cached intermediate results
- Adaptive search bounds

## Example

Consider the matrix and optimal assignment:
$$C = \begin{pmatrix}
1 & 5 & 9 \\
4 & 2 & 7 \\
6 & 8 & 3
\end{pmatrix}, \quad 
\text{Assignment: } (1,1), (2,2), (3,3)$$

**Sensitivity Analysis**:
- $s_{11} = 1$: Element $(1,1)$ can increase by 1 before alternative becomes optimal
- $s_{22} = 2$: Element $(2,2)$ can increase by 2
- $s_{33} = 5$: Element $(3,3)$ can increase by 5
- $s_{12} = 3$: Element $(1,2)$ must decrease by 3 to enter assignment

This indicates that position $(3,3)$ is most stable, while $(1,1)$ is most sensitive to changes.