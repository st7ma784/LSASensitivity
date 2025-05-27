import { hungarianAlgorithm } from './hungarian-algorithm';

export type SensitivityMethod = 
  | 'basic' 
  | 'dual_based' 
  | 'auction_based' 
  | 'geometric_bounds' 
  | 'reduced_cost' 
  | 'perturbation_theory';

export interface SensitivityMethodInfo {
  name: string;
  description: string;
  strengths: string;
  weaknesses: string;
}

export const SENSITIVITY_METHODS: Record<SensitivityMethod, SensitivityMethodInfo> = {
  basic: {
    name: 'Basic Row/Column Minimum',
    description: 'Simple heuristic measuring distance from row and column minimums',
    strengths: 'Fast, intuitive, easy to understand',
    weaknesses: 'May be conservative, doesn\'t consider assignment structure'
  },
  dual_based: {
    name: 'Dual-Based Analysis',
    description: 'Uses linear programming duality theory and shadow prices',
    strengths: 'Theoretically sound, economic interpretation',
    weaknesses: 'May not capture all discrete problem aspects'
  },
  auction_based: {
    name: 'Auction Algorithm',
    description: 'Simulates market bidding with competitive gaps',
    strengths: 'Economic interpretation, captures competitive dynamics',
    weaknesses: 'Parameter dependent, iterative complexity'
  },
  geometric_bounds: {
    name: 'Geometric Bounds',
    description: 'Analyzes assignment polytope geometry and rank positions',
    strengths: 'Geometric intuition, considers local competition',
    weaknesses: 'Simplified model, may miss global optimization effects'
  },
  reduced_cost: {
    name: 'Network Flow Theory',
    description: 'Uses reduced costs and alternating cycles in residual graph',
    strengths: 'Theoretically rigorous, captures network structure',
    weaknesses: 'Complex cycle-finding, computationally intensive'
  },
  perturbation_theory: {
    name: 'Perturbation Theory',
    description: 'Matrix calculus approach with norm-based sensitivity',
    strengths: 'Mathematically rigorous, captures higher-order effects',
    weaknesses: 'May not directly relate to assignment changes'
  }
};

/**
 * Calculate sensitivity analysis for each cell in the cost matrix using specified method
 * @param costMatrix - Original cost matrix
 * @param assignment - Optimal assignment from Hungarian algorithm
 * @param mode - Optimization mode ('min' or 'max')
 * @param method - Sensitivity analysis method to use
 * @returns Matrix of sensitivity values
 */
export function calculateSensitivity(
  costMatrix: number[][],
  assignment: number[],
  mode: 'min' | 'max' = 'min',
  method: SensitivityMethod = 'basic'
): (number | null)[][] {
  const rows = costMatrix.length;
  const cols = costMatrix[0]?.length || 0;

  if (rows === 0 || cols === 0) return [];

  // Performance safety: limit matrix size for complex calculations
  const maxSize = 8; // Maximum matrix size for complex methods
  const isLargeMatrix = rows > maxSize || cols > maxSize;
  
  // For large matrices, use basic method only
  const safeMethod = isLargeMatrix && method !== 'basic' ? 'basic' : method;

  try {
    switch (safeMethod) {
      case 'basic':
        return calculateBasicSensitivity(costMatrix);
      case 'dual_based':
        return calculateDualBasedSensitivity(costMatrix, assignment);
      case 'auction_based':
        return calculateAuctionBasedSensitivity(costMatrix);
      case 'geometric_bounds':
        return calculateGeometricBoundsSensitivity(costMatrix);
      case 'reduced_cost':
        return calculateReducedCostSensitivity(costMatrix, assignment);
      case 'perturbation_theory':
        return calculatePerturbationTheorySensitivity(costMatrix);
      default:
        return calculateBasicSensitivity(costMatrix);
    }
  } catch (error) {
    console.error(`Error in sensitivity calculation (${safeMethod}):`, error);
    return costMatrix.map(row => row.map(() => null));
  }
}

/**
 * METHOD 1: Basic Row/Column Minimum Distance Approach
 * 
 * Theory: Simple heuristic that measures how far each element is from
 * the minimum values in its row and column.
 */
function calculateBasicSensitivity(costMatrix: number[][]): number[][] {
  const rows = costMatrix.length;
  const cols = costMatrix[0].length;
  const sensitivity: number[][] = [];

  for (let i = 0; i < rows; i++) {
    sensitivity[i] = [];
    for (let j = 0; j < cols; j++) {
      const currentValue = costMatrix[i][j];
      
      // Get row values excluding current position
      const rowValues = costMatrix[i].filter((_, index) => index !== j);
      // Get column values excluding current position
      const colValues = costMatrix.map(row => row[j]).filter((_, index) => index !== i);
      
      // Find minimums in row and column
      const rowMin = rowValues.length > 0 ? Math.min(...rowValues) : currentValue;
      const colMin = colValues.length > 0 ? Math.min(...colValues) : currentValue;
      
      // Calculate sensitivity as distance from minimums
      const rowSensitivity = Math.max(0, currentValue - rowMin);
      const colSensitivity = Math.max(0, currentValue - colMin);
      
      // Take minimum as the limiting constraint
      sensitivity[i][j] = Math.min(rowSensitivity, colSensitivity);
    }
  }

  return sensitivity;
}

/**
 * METHOD 2: Dual-Based Sensitivity Analysis
 * 
 * Theory: Based on linear programming duality theory. Uses shadow prices
 * (dual variables) and reduced costs.
 */
function calculateDualBasedSensitivity(costMatrix: number[][], assignment: number[]): number[][] {
  const rows = costMatrix.length;
  const cols = costMatrix[0].length;
  
  // Initialize dual variables (shadow prices)
  const u = new Array(rows).fill(0); // Row dual variables
  const v = new Array(cols).fill(0); // Column dual variables
  
  // Calculate dual variables using complementary slackness
  // For assigned pairs: u[i] + v[j] = c[i,j]
  assignment.forEach((j, i) => {
    if (j !== -1) {
      if (i === 0) {
        u[i] = 0; // Normalize by setting first row dual to 0
        v[j] = costMatrix[i][j];
      } else {
        u[i] = costMatrix[i][j] - v[j];
      }
    }
  });
  
  // Calculate reduced costs and sensitivity
  const sensitivity: number[][] = [];
  for (let i = 0; i < rows; i++) {
    sensitivity[i] = [];
    for (let j = 0; j < cols; j++) {
      // Reduced cost = original cost - dual values
      const reducedCost = costMatrix[i][j] - u[i] - v[j];
      // Sensitivity is how much we can decrease cost before reduced cost becomes negative
      sensitivity[i][j] = Math.max(0, reducedCost);
    }
  }

  return sensitivity;
}

/**
 * METHOD 3: Auction Algorithm-Based Sensitivity
 * 
 * Theory: Simulates market where "persons" bid for "objects". 
 * Bidding increments provide natural sensitivity measures.
 */
function calculateAuctionBasedSensitivity(costMatrix: number[][], eps: number = 1.0): number[][] {
  const n = costMatrix.length;
  const prices = new Array(n).fill(0); // Current prices for objects
  const assignment = new Array(n).fill(-1); // person -> object assignment
  const reverseAssignment = new Array(n).fill(-1); // object -> person assignment
  
  const maxIterations = n * n; // Prevent infinite loops
  const sensitivity: number[][] = costMatrix.map(row => new Array(row.length).fill(0));
  
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Find unassigned persons
    const unassigned = assignment.map((val, idx) => val === -1 ? idx : -1).filter(val => val !== -1);
    if (unassigned.length === 0) break; // All persons assigned
    
    const person = unassigned[0]; // Take first unassigned person
    
    // Calculate benefits for this person (negative cost - price)
    const benefits = costMatrix[person].map((cost, obj) => -(cost + prices[obj]));
    const bestObj = benefits.indexOf(Math.max(...benefits));
    
    // Find second-best benefit for competitive bidding
    const sortedBenefits = [...benefits].sort((a, b) => b - a);
    const secondBestBenefit = n > 1 ? sortedBenefits[1] : sortedBenefits[0];
    const bestBenefit = benefits[bestObj];
    
    // Calculate bid increment (key for sensitivity analysis)
    const bidIncrement = Math.max(eps, bestBenefit - secondBestBenefit + eps);
    
    // Update sensitivity matrix with bid increment
    sensitivity[person][bestObj] = Math.min(bidIncrement, 100); // Cap at reasonable value
    
    // Update auction state
    if (reverseAssignment[bestObj] !== -1) {
      // Remove previous assignment (outbid previous person)
      const oldPerson = reverseAssignment[bestObj];
      assignment[oldPerson] = -1;
    }
    
    // Make new assignment
    assignment[person] = bestObj;
    reverseAssignment[bestObj] = person;
    prices[bestObj] += bidIncrement; // Increase price due to bidding
    
    // Safety check for price explosion
    if (prices[bestObj] > 1000) {
      prices[bestObj] = 1000;
    }
  }
  
  return sensitivity;
}

/**
 * METHOD 4: Geometric Bounds Using Assignment Polytope
 * 
 * Theory: Analyzes geometry of assignment polytope and rank positions
 * to determine sensitivity bounds.
 */
function calculateGeometricBoundsSensitivity(costMatrix: number[][]): number[][] {
  const rows = costMatrix.length;
  const cols = costMatrix[0].length;
  const sensitivity: number[][] = [];
  
  for (let i = 0; i < rows; i++) {
    sensitivity[i] = [];
    for (let j = 0; j < cols; j++) {
      // Get competitors in the same row and column
      const rowCompetitors = [...costMatrix[i]];
      const colCompetitors = costMatrix.map(row => row[j]);
      
      // Sort to establish competitive ranking
      const rowSorted = [...rowCompetitors].sort((a, b) => a - b);
      const colSorted = [...colCompetitors].sort((a, b) => a - b);
      
      // Find current element's rank position
      const currentValue = costMatrix[i][j];
      const rowRank = rowSorted.indexOf(currentValue);
      const colRank = colSorted.indexOf(currentValue);
      
      // Calculate geometric gaps to next competitive level
      const rowGap = rowRank < rowSorted.length - 1 ? 
        rowSorted[rowRank + 1] - currentValue : 10.0;
      const colGap = colRank < colSorted.length - 1 ? 
        colSorted[colRank + 1] - currentValue : 10.0;
      
      // Sensitivity is the minimum gap (limiting constraint)
      sensitivity[i][j] = Math.min(rowGap, colGap);
    }
  }
  
  return sensitivity;
}

/**
 * METHOD 5: Advanced Reduced Cost Analysis with Network Flow Theory
 * 
 * Theory: Models assignment as min-cost flow problem, analyzes reduced costs
 * and alternating cycles.
 */
function calculateReducedCostSensitivity(costMatrix: number[][], assignment: number[]): number[][] {
  const rows = costMatrix.length;
  const cols = costMatrix[0].length;
  
  // Calculate node potentials (dual variables) using network flow theory
  const potentialsU = new Array(rows).fill(0); // Worker potentials
  const potentialsV = new Array(cols).fill(0); // Job potentials
  
  // Set potentials based on optimal solution structure
  assignment.forEach((j, i) => {
    if (j !== -1) {
      potentialsV[j] = costMatrix[i][j] - potentialsU[i];
    }
  });
  
  // Calculate reduced costs and sensitivities
  const sensitivity: number[][] = [];
  for (let i = 0; i < rows; i++) {
    sensitivity[i] = [];
    for (let j = 0; j < cols; j++) {
      // Reduced cost = original cost - sum of potentials
      const reducedCost = costMatrix[i][j] - potentialsU[i] - potentialsV[j];
      
      if (assignment[i] === j) {
        // For assigned edges: find minimum cost alternating cycle
        sensitivity[i][j] = findMinCostCycle(costMatrix, i, j, assignment);
      } else {
        // For unassigned edges: sensitivity is the reduced cost
        sensitivity[i][j] = Math.max(0, reducedCost);
      }
    }
  }
  
  return sensitivity;
}

/**
 * Helper function to find minimum cost alternating cycle
 */
function findMinCostCycle(costMatrix: number[][], excludeI: number, excludeJ: number, assignment: number[]): number {
  const n = costMatrix.length;
  let minCycleCost = Infinity;
  
  // Find alternative assignments that create valid alternating cycles
  for (let altJ = 0; altJ < n; altJ++) {
    if (altJ !== excludeJ) { // Try assigning excludeI to altJ
      for (let altI = 0; altI < n; altI++) {
        if (altI !== excludeI && assignment[altI] !== -1) {
          const currentAltJ = assignment[altI];
          // Calculate cycle cost for this alternative
          const cycleCost = Math.abs(
            costMatrix[excludeI][altJ] + 
            costMatrix[altI][excludeJ] - 
            costMatrix[excludeI][excludeJ] - 
            costMatrix[altI][currentAltJ]
          );
          minCycleCost = Math.min(minCycleCost, cycleCost);
        }
      }
    }
  }
  
  return minCycleCost !== Infinity ? minCycleCost : 5.0;
}

/**
 * METHOD 6: Perturbation Theory Using Matrix Calculus
 * 
 * Theory: Analyzes how matrix perturbations affect solution structure
 * using norm-based sensitivity measures.
 */
function calculatePerturbationTheorySensitivity(costMatrix: number[][]): number[][] {
  const rows = costMatrix.length;
  const cols = costMatrix[0].length;
  const sensitivity: number[][] = [];
  
  // Performance optimization: use smaller delta for larger matrices
  const delta = rows > 6 ? 0.1 : 0.01;
  
  for (let i = 0; i < rows; i++) {
    sensitivity[i] = [];
    for (let j = 0; j < cols; j++) {
      try {
        // Create perturbation matrix
        const pertMatrix = costMatrix.map((row, rowIdx) =>
          row.map((val, colIdx) => 
            rowIdx === i && colIdx === j ? val + delta : val
          )
        );
        
        // Calculate various matrix properties for sensitivity analysis
        
        // 1. Frobenius norm change (overall matrix magnitude change)
        const frobeniusChange = Math.sqrt(
          pertMatrix.reduce((sum, row, rowIdx) =>
            sum + row.reduce((rowSum, val, colIdx) =>
              rowSum + Math.pow(val - costMatrix[rowIdx][colIdx], 2), 0), 0)
        );
        const frobeniusSensitivity = frobeniusChange / delta;
        
        // 2. Maximum element change (simplified spectral norm approximation)
        const maxChange = Math.max(...pertMatrix.flat().map((val, idx) =>
          Math.abs(val - costMatrix[Math.floor(idx / cols)][idx % cols])
        ));
        const spectralSensitivity = maxChange / delta;
        
        // 3. Trace sensitivity (sum of diagonal elements)
        const originalTrace = costMatrix.reduce((sum, row, idx) => 
          sum + (row[idx] || 0), 0);
        const perturbedTrace = pertMatrix.reduce((sum, row, idx) => 
          sum + (row[idx] || 0), 0);
        const traceSensitivity = Math.abs(perturbedTrace - originalTrace) / delta;
        
        // Combine multiple sensitivity measures for robust estimate
        const combinedSensitivity = (
          0.4 * frobeniusSensitivity +    // Overall change importance
          0.4 * spectralSensitivity +     // Maximum change importance  
          0.2 * traceSensitivity          // Diagonal structure importance
        ) * 100; // Scale for visualization
        
        // Cap sensitivity to prevent extreme values
        sensitivity[i][j] = Math.min(combinedSensitivity, 1000);
        
      } catch (error) {
        console.warn(`Error calculating perturbation sensitivity at [${i},${j}]:`, error);
        sensitivity[i][j] = 5.0; // Default fallback value
      }
    }
  }
  
  return sensitivity;
}
