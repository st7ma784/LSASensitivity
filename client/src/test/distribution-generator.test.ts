import { describe, it, expect } from 'vitest'
import { generateRandomValue, initializeMatrix, DistributionType, DistributionParams } from '@/lib/matrix-utils'

describe('Statistical Distribution Generator', () => {
  describe('Uniform Distribution', () => {
    it('should generate values within specified range', () => {
      const params: DistributionParams['uniform'] = { min: 10, max: 50 }
      const samples = Array.from({ length: 100 }, () => 
        generateRandomValue('uniform', params)
      )
      
      samples.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(10)
        expect(value).toBeLessThan(50)
      })
    })

    it('should have roughly uniform distribution', () => {
      const params: DistributionParams['uniform'] = { min: 0, max: 100 }
      const samples = Array.from({ length: 1000 }, () => 
        generateRandomValue('uniform', params)
      )
      
      const buckets = [0, 0, 0, 0, 0] // 5 buckets for 0-20, 20-40, etc.
      samples.forEach(value => {
        const bucketIndex = Math.floor(value / 20)
        if (bucketIndex < 5) buckets[bucketIndex]++
      })
      
      // Each bucket should have roughly 200 samples (±50 tolerance)
      buckets.forEach(count => {
        expect(count).toBeGreaterThan(150)
        expect(count).toBeLessThan(250)
      })
    })
  })

  describe('Gaussian Distribution', () => {
    it('should generate values around the mean', () => {
      const params: DistributionParams['gaussian'] = { mean: 50, stdDev: 10 }
      const samples = Array.from({ length: 1000 }, () => 
        generateRandomValue('gaussian', params)
      )
      
      const sampleMean = samples.reduce((sum, val) => sum + val, 0) / samples.length
      
      // Sample mean should be close to population mean (within 2 standard errors)
      expect(Math.abs(sampleMean - 50)).toBeLessThan(2)
    })

    it('should follow bell curve distribution', () => {
      const params: DistributionParams['gaussian'] = { mean: 0, stdDev: 1 }
      const samples = Array.from({ length: 1000 }, () => 
        generateRandomValue('gaussian', params)
      )
      
      // About 68% should be within 1 standard deviation
      const withinOneStd = samples.filter(val => Math.abs(val) <= 1).length
      expect(withinOneStd / samples.length).toBeGreaterThan(0.6)
      expect(withinOneStd / samples.length).toBeLessThan(0.8)
    })
  })

  describe('Exponential Distribution', () => {
    it('should generate positive values with correct rate', () => {
      const params: DistributionParams['exponential'] = { lambda: 0.5 }
      const samples = Array.from({ length: 1000 }, () => 
        generateRandomValue('exponential', params)
      )
      
      // All values should be positive
      samples.forEach(value => {
        expect(value).toBeGreaterThan(0)
      })
      
      // Mean should be approximately 1/lambda
      const sampleMean = samples.reduce((sum, val) => sum + val, 0) / samples.length
      expect(Math.abs(sampleMean - 2)).toBeLessThan(0.5) // 1/0.5 = 2
    })

    it('should be heavily skewed toward small values', () => {
      const params: DistributionParams['exponential'] = { lambda: 1 }
      const samples = Array.from({ length: 1000 }, () => 
        generateRandomValue('exponential', params)
      )
      
      // Most values should be less than 3 (about 95% for lambda=1)
      const smallValues = samples.filter(val => val < 3).length
      expect(smallValues / samples.length).toBeGreaterThan(0.9)
    })
  })

  describe('Half-Normal Distribution', () => {
    it('should generate only positive values', () => {
      const params: DistributionParams['halfNormal'] = { sigma: 10 }
      const samples = Array.from({ length: 100 }, () => 
        generateRandomValue('halfNormal', params)
      )
      
      samples.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have mode at zero', () => {
      const params: DistributionParams['halfNormal'] = { sigma: 1 }
      const samples = Array.from({ length: 1000 }, () => 
        generateRandomValue('halfNormal', params)
      )
      
      // Most values should be small (close to zero)
      const smallValues = samples.filter(val => val < 1).length
      expect(smallValues / samples.length).toBeGreaterThan(0.3)
    })
  })

  describe('Discrete Distribution', () => {
    it('should only generate values from provided set', () => {
      const params: DistributionParams['discrete'] = { values: [10, 20, 30, 40, 50] }
      const samples = Array.from({ length: 100 }, () => 
        generateRandomValue('discrete', params)
      )
      
      samples.forEach(value => {
        expect(params.values).toContain(value)
      })
    })

    it('should have roughly equal probability for each value', () => {
      const values = [1, 2, 3, 4, 5]
      const params: DistributionParams['discrete'] = { values }
      const samples = Array.from({ length: 1000 }, () => 
        generateRandomValue('discrete', params)
      )
      
      const counts = values.map(val => 
        samples.filter(sample => sample === val).length
      )
      
      // Each value should appear roughly 200 times (±50 tolerance)
      counts.forEach(count => {
        expect(count).toBeGreaterThan(150)
        expect(count).toBeLessThan(250)
      })
    })
  })

  describe('Matrix Initialization with Distributions', () => {
    it('should create matrix with correct dimensions', () => {
      const matrix = initializeMatrix(3, 4, 'uniform')
      
      expect(matrix.length).toBe(3)
      expect(matrix[0].length).toBe(4)
      expect(matrix[1].length).toBe(4)
      expect(matrix[2].length).toBe(4)
    })

    it('should generate positive values for all distributions', () => {
      const distributions: DistributionType[] = [
        'uniform', 'gaussian', 'exponential', 'halfNormal', 
        'weibull', 'gamma', 'discrete'
      ]
      
      distributions.forEach(distribution => {
        const matrix = initializeMatrix(2, 2, distribution)
        
        matrix.forEach(row => {
          row.forEach(value => {
            expect(value).toBeGreaterThan(0)
            expect(Number.isFinite(value)).toBe(true)
          })
        })
      })
    })

    it('should respect custom parameters', () => {
      const matrix = initializeMatrix(2, 2, 'uniform', { min: 100, max: 200 })
      
      matrix.forEach(row => {
        row.forEach(value => {
          expect(value).toBeGreaterThanOrEqual(100)
          expect(value).toBeLessThan(200)
        })
      })
    })

    it('should produce different matrices on repeated calls', () => {
      const matrix1 = initializeMatrix(3, 3, 'uniform')
      const matrix2 = initializeMatrix(3, 3, 'uniform')
      
      // Matrices should be different (very low probability of being identical)
      let identical = true
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          if (matrix1[i][j] !== matrix2[i][j]) {
            identical = false
            break
          }
        }
        if (!identical) break
      }
      
      expect(identical).toBe(false)
    })

    it('should round values to reasonable precision', () => {
      const matrix = initializeMatrix(2, 2, 'gaussian')
      
      matrix.forEach(row => {
        row.forEach(value => {
          // Should be rounded to 1 decimal place
          expect(value * 10).toBe(Math.round(value * 10))
        })
      })
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle edge case parameters gracefully', () => {
      // Very small standard deviation
      const smallStdDev = generateRandomValue('gaussian', { mean: 50, stdDev: 0.1 })
      expect(Number.isFinite(smallStdDev)).toBe(true)
      
      // Very high lambda for exponential
      const highLambda = generateRandomValue('exponential', { lambda: 10 })
      expect(highLambda).toBeGreaterThan(0)
      expect(Number.isFinite(highLambda)).toBe(true)
    })

    it('should handle single-value discrete distribution', () => {
      const value = generateRandomValue('discrete', { values: [42] })
      expect(value).toBe(42)
    })

    it('should handle empty discrete values gracefully', () => {
      expect(() => {
        generateRandomValue('discrete', { values: [] })
      }).not.toThrow()
    })
  })

  describe('Statistical Properties', () => {
    it('should maintain expected statistical properties for Weibull', () => {
      const params: DistributionParams['weibull'] = { shape: 2, scale: 50 }
      const samples = Array.from({ length: 1000 }, () => 
        generateRandomValue('weibull', params)
      )
      
      // All values should be positive
      samples.forEach(value => {
        expect(value).toBeGreaterThan(0)
      })
      
      // For shape=2, scale=50, mean should be approximately scale * Γ(1 + 1/shape)
      const sampleMean = samples.reduce((sum, val) => sum + val, 0) / samples.length
      expect(sampleMean).toBeGreaterThan(40)
      expect(sampleMean).toBeLessThan(60)
    })

    it('should maintain expected statistical properties for Gamma', () => {
      const params: DistributionParams['gamma'] = { shape: 2, rate: 0.1 }
      const samples = Array.from({ length: 1000 }, () => 
        generateRandomValue('gamma', params)
      )
      
      // All values should be positive
      samples.forEach(value => {
        expect(value).toBeGreaterThan(0)
      })
      
      // Mean should be shape/rate = 2/0.1 = 20
      const sampleMean = samples.reduce((sum, val) => sum + val, 0) / samples.length
      expect(Math.abs(sampleMean - 20)).toBeLessThan(5)
    })
  })
})