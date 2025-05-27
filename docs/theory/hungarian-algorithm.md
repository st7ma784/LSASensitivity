# Hungarian Algorithm

The Hungarian algorithm is a combinatorial optimization algorithm that solves the assignment problem in polynomial time. It was developed by Harold Kuhn in 1955, based on earlier work by Hungarian mathematicians Dénes Kőnig and Jenő Egerváry.

## Mathematical Foundation

### Problem Definition

Given a cost matrix $C = [c_{ij}]$ of size $n \times m$, the assignment problem seeks to find a perfect matching that minimizes (or maximizes) the total cost:

$$\min \sum_{i=1}^{n} \sum_{j=1}^{m} c_{ij} x_{ij}$$

Subject to constraints:
- $\sum_{j=1}^{m} x_{ij} = 1$ for all $i \in \{1, 2, ..., n\}$ (each row assigned exactly once)
- $\sum_{i=1}^{n} x_{ij} \leq 1$ for all $j \in \{1, 2, ..., m\}$ (each column assigned at most once)
- $x_{ij} \in \{0, 1\}$ (binary decision variables)

### Algorithm Steps

#### Step 1: Matrix Preparation

For non-square matrices, pad with zeros (minimization) or maximum values (maximization) to create a square matrix.

For maximization problems, convert to minimization by subtracting all elements from the maximum value:
$$c'_{ij} = \max_{kl} c_{kl} - c_{ij}$$

#### Step 2: Row Reduction

Subtract the minimum value from each row:
$$c'_{ij} = c_{ij} - \min_j c_{ij}$$

**Mathematical Justification**: This transformation preserves the optimal assignment structure since we subtract a constant from each row.

#### Step 3: Column Reduction

Subtract the minimum value from each column:
$$c''_{ij} = c'_{ij} - \min_i c'_{ij}$$

#### Step 4: Zero Coverage

Find the minimum number of lines (rows and columns) needed to cover all zeros. If this number equals $n$, an optimal assignment exists among the zeros.

**Theorem (König-Egerváry)**: In a bipartite graph, the maximum matching size equals the minimum vertex cover size.

#### Step 5: Zero Creation (if needed)

If fewer than $n$ lines cover all zeros:
1. Find the minimum uncovered element $\delta$
2. Subtract $\delta$ from all uncovered elements
3. Add $\delta$ to all doubly-covered elements (intersection of covering lines)

This maintains optimality while creating new zeros.

#### Step 6: Assignment Extraction

Find an assignment using only zero positions. This can be done using augmenting path methods.

## Time Complexity

The Hungarian algorithm runs in $O(n^3)$ time:
- Matrix reduction: $O(n^2)$
- Zero coverage and creation: $O(n^3)$ worst case
- Assignment extraction: $O(n^2)$

## Implementation Details

### Handling Rectangular Matrices

For $n \times m$ matrices where $n \neq m$:
- **More rows than columns**: Some rows remain unassigned
- **More columns than rows**: Some columns remain unassigned

The algorithm handles this by padding the matrix to make it square.

### Maximization vs Minimization

**Minimization**: Direct application of the algorithm
**Maximization**: Transform by subtracting from maximum value

### Degeneracy

When multiple optimal solutions exist, the algorithm finds one of them. The sensitivity analysis can identify which elements have zero sensitivity (indicating alternative optimal solutions).

## Theoretical Properties

### Optimality

**Theorem**: The Hungarian algorithm finds a globally optimal solution to the assignment problem.

**Proof Sketch**: The algorithm maintains dual feasibility throughout, and terminates when primal-dual complementary slackness conditions are satisfied.

### Dual Problem

The dual of the assignment problem is:
$$\max \sum_{i=1}^{n} u_i + \sum_{j=1}^{m} v_j$$

Subject to: $u_i + v_j \leq c_{ij}$ for all $i,j$

The Hungarian algorithm implicitly solves both primal and dual problems simultaneously.

## Applications

1. **Task Assignment**: Assigning workers to jobs to minimize cost or maximize productivity
2. **Transportation**: Routing vehicles to minimize distance or time
3. **Manufacturing**: Assigning machines to products for optimal throughput
4. **Bioinformatics**: Sequence alignment and matching problems
5. **Computer Vision**: Object tracking and correspondence problems

## Example

Consider the cost matrix:
$$C = \begin{pmatrix}
4 & 1 & 3 \\
2 & 0 & 5 \\
3 & 2 & 2
\end{pmatrix}$$

**Step 1**: Row reduction
$$C' = \begin{pmatrix}
3 & 0 & 2 \\
2 & 0 & 5 \\
1 & 0 & 0
\end{pmatrix}$$

**Step 2**: Column reduction
$$C'' = \begin{pmatrix}
2 & 0 & 2 \\
1 & 0 & 5 \\
0 & 0 & 0
\end{pmatrix}$$

**Step 3**: Find assignment using zeros
Optimal assignment: $(1,2), (2,2), (3,1)$ with total cost $1 + 0 + 3 = 4$.

## References

1. Kuhn, H. W. (1955). "The Hungarian method for the assignment problem"
2. Munkres, J. (1957). "Algorithms for the assignment and transportation problems"
3. Papadimitriou, C. H., & Steiglitz, K. (1998). "Combinatorial Optimization"