/**
 * Statistical distribution types for matrix initialization
 */
export type DistributionType = 
  | 'uniform' 
  | 'gaussian' 
  | 'normal'
  | 'poisson'
  | 'bimodal'
  | 'exponential' 
  | 'halfNormal'
  | 'weibull'
  | 'gamma'
  | 'discrete';

/**
 * Parameters for different distributions
 */
export interface DistributionParams {
  uniform: { min: number; max: number };
  gaussian: { mean: number; stdDev: number };
  normal: { mean: number; stdDev: number };
  poisson: { lambda: number };
  bimodal: { mean1: number; stdDev1: number; mean2: number; stdDev2: number; weight: number };
  exponential: { lambda: number };
  halfNormal: { sigma: number };
  weibull: { shape: number; scale: number };
  gamma: { shape: number; rate: number };
  discrete: { values: number[] };
}

/**
 * Generate random number from Box-Muller transformation (Gaussian)
 */
function generateGaussian(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdDev + mean;
}

/**
 * Generate random number from exponential distribution
 */
function generateExponential(lambda: number): number {
  return -Math.log(1 - Math.random()) / lambda;
}

/**
 * Generate random number from half-normal distribution
 */
function generateHalfNormal(sigma: number): number {
  const gaussian = generateGaussian(0, sigma);
  return Math.abs(gaussian);
}

/**
 * Generate random number from Weibull distribution
 */
function generateWeibull(shape: number, scale: number): number {
  const u = Math.random();
  return scale * Math.pow(-Math.log(1 - u), 1 / shape);
}

/**
 * Generate random number from Gamma distribution (using Marsaglia and Tsang method)
 */
function generateGamma(shape: number, rate: number): number {
  if (shape < 1) {
    // Use rejection method for shape < 1
    const u = Math.random();
    return generateGamma(1 + shape, rate) * Math.pow(u, 1 / shape);
  }
  
  const d = shape - 1/3;
  const c = 1 / Math.sqrt(9 * d);
  
  while (true) {
    let x, v;
    do {
      x = generateGaussian(0, 1);
      v = 1 + c * x;
    } while (v <= 0);
    
    v = v * v * v;
    const u = Math.random();
    
    if (u < 1 - 0.0331 * x * x * x * x) {
      return d * v / rate;
    }
    
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v / rate;
    }
  }
}

/**
 * Generate random number from Poisson distribution
 */
function generatePoisson(lambda: number): number {
  if (lambda <= 0) return 0;
  
  // For small lambda, use Knuth's algorithm
  if (lambda < 30) {
    const l = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    
    do {
      k++;
      p *= Math.random();
    } while (p > l);
    
    return k - 1;
  }
  
  // For large lambda, use normal approximation
  return Math.max(0, Math.round(generateGaussian(lambda, Math.sqrt(lambda))));
}

/**
 * Generate random number from bimodal normal distribution (sum of two normals)
 */
function generateBimodal(mean1: number, stdDev1: number, mean2: number, stdDev2: number, weight: number): number {
  // Weight determines probability of choosing first distribution (0-1)
  const clampedWeight = Math.max(0, Math.min(1, weight));
  
  if (Math.random() < clampedWeight) {
    return generateGaussian(mean1, stdDev1);
  } else {
    return generateGaussian(mean2, stdDev2);
  }
}

/**
 * Generate random number from discrete distribution
 */
function generateDiscrete(values: number[]): number {
  if (values.length === 0) return 0;
  const index = Math.floor(Math.random() * values.length);
  return values[index];
}

/**
 * Generate a random value based on distribution type and parameters
 */
export function generateRandomValue(
  distribution: DistributionType,
  params: DistributionParams[DistributionType]
): number {
  switch (distribution) {
    case 'uniform':
      const uniformParams = params as DistributionParams['uniform'];
      return Math.random() * (uniformParams.max - uniformParams.min) + uniformParams.min;
      
    case 'gaussian':
      const gaussianParams = params as DistributionParams['gaussian'];
      return generateGaussian(gaussianParams.mean, gaussianParams.stdDev);
      
    case 'normal':
      const normalParams = params as DistributionParams['normal'];
      return generateGaussian(normalParams.mean, normalParams.stdDev);
      
    case 'poisson':
      const poissonParams = params as DistributionParams['poisson'];
      return generatePoisson(poissonParams.lambda);
      
    case 'bimodal':
      const bimodalParams = params as DistributionParams['bimodal'];
      return generateBimodal(bimodalParams.mean1, bimodalParams.stdDev1, 
                           bimodalParams.mean2, bimodalParams.stdDev2, bimodalParams.weight);
      
    case 'exponential':
      const expParams = params as DistributionParams['exponential'];
      return generateExponential(expParams.lambda);
      
    case 'halfNormal':
      const halfNormalParams = params as DistributionParams['halfNormal'];
      return generateHalfNormal(halfNormalParams.sigma);
      
    case 'weibull':
      const weibullParams = params as DistributionParams['weibull'];
      return generateWeibull(weibullParams.shape, weibullParams.scale);
      
    case 'gamma':
      const gammaParams = params as DistributionParams['gamma'];
      return generateGamma(gammaParams.shape, gammaParams.rate);
      
    case 'discrete':
      const discreteParams = params as DistributionParams['discrete'];
      return generateDiscrete(discreteParams.values);
      
    default:
      return Math.random() * 100 + 1; // Fallback to uniform [1, 101)
  }
}

/**
 * Initialize a matrix with values from a statistical distribution
 */
export function initializeMatrix(
  rows: number, 
  cols: number,
  distribution: DistributionType = 'uniform',
  params?: DistributionParams[DistributionType]
): number[][] {
  // Default parameters for each distribution
  const defaultParams: DistributionParams = {
    uniform: { min: 1, max: 100 },
    gaussian: { mean: 50, stdDev: 20 },
    normal: { mean: 50, stdDev: 20 },
    poisson: { lambda: 25 },
    bimodal: { mean1: 30, stdDev1: 10, mean2: 70, stdDev2: 10, weight: 0.5 },
    exponential: { lambda: 0.1 },
    halfNormal: { sigma: 30 },
    weibull: { shape: 2, scale: 50 },
    gamma: { shape: 2, rate: 0.05 },
    discrete: { values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] }
  };

  const actualParams = params || defaultParams[distribution];
  const matrix: number[][] = [];
  
  for (let i = 0; i < rows; i++) {
    matrix[i] = [];
    for (let j = 0; j < cols; j++) {
      let value = generateRandomValue(distribution, actualParams);
      
      // Ensure positive values and round to reasonable precision
      value = Math.max(0.1, Math.abs(value));
      matrix[i][j] = Math.round(value * 10) / 10; // Round to 1 decimal place
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
