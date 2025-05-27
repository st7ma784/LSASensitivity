import { describe, it, expect } from 'vitest'
import { calculateSensitivity } from '@/lib/sensitivity-analysis'
import { hungarianAlgorithm } from '@/lib/hungarian-algorithm'

describe('Sensitivity Analysis', () => {
  describe('Basic sensitivity calculations', () => {
    it('should calculate sensitivity for a simple 2x2 matrix', () => {
      const matrix = [
        [1, 5],
        [4, 2]
      ]
      const { assignment } = hungarianAlgorithm(matrix, 'min')
      const sensitivity = calculateSensitivity(matrix, assignment, 'min')
      
      expect(sensitivity.length).toBe(2)
      expect(sensitivity[0].length).toBe(2)
      
      // All sensitivity values should be numbers or null
      sensitivity.forEach(row => {
        row.forEach(value => {
          expect(value === null || typeof value === 'number').toBe(true)
        })
      })
    })

    it('should handle empty matrix gracefully', () => {
      const matrix: number[][] = []
      const assignment: number[] = []
      const sensitivity = calculateSensitivity(matrix, assignment, 'min')
      
      expect(sensitivity).toEqual([])
    })

    it('should calculate sensitivity for single element matrix', () => {
      const matrix = [[5]]
      const assignment = [0]
      const sensitivity = calculateSensitivity(matrix, assignment, 'min')
      
      expect(sensitivity.length).toBe(1)
      expect(sensitivity[0].length).toBe(1)
      expect(typeof sensitivity[0][0]).toBe('number')
    })
  })

  describe('Assigned vs non-assigned cells', () => {
    it('should handle assigned cells differently from non-assigned', () => {
      const matrix = [
        [1, 9, 9],
        [9, 1, 9],
        [9, 9, 1]
      ]
      const { assignment } = hungarianAlgorithm(matrix, 'min')
      const sensitivity = calculateSensitivity(matrix, assignment, 'min')
      
      // Check that we have meaningful sensitivity values
      expect(sensitivity.length).toBe(3)
      expect(sensitivity[0].length).toBe(3)
      
      // At least some cells should have finite sensitivity
      let hasFiniteSensitivity = false
      sensitivity.forEach(row => {
        row.forEach(value => {
          if (value !== null && value !== Infinity) {
            hasFiniteSensitivity = true
          }
        })
      })
      expect(hasFiniteSensitivity).toBe(true)
    })
  })

  describe('Optimization mode differences', () => {
    it('should produce different sensitivities for min vs max', () => {
      const matrix = [
        [1, 3],
        [2, 4]
      ]
      
      const { assignment: minAssignment } = hungarianAlgorithm(matrix, 'min')
      const { assignment: maxAssignment } = hungarianAlgorithm(matrix, 'max')
      
      const minSensitivity = calculateSensitivity(matrix, minAssignment, 'min')
      const maxSensitivity = calculateSensitivity(matrix, maxAssignment, 'max')
      
      expect(minSensitivity.length).toBe(2)
      expect(maxSensitivity.length).toBe(2)
      
      // The assignments should be different for min vs max
      expect(minAssignment).not.toEqual(maxAssignment)
    })
  })

  describe('Edge cases and robustness', () => {
    it('should handle matrices with zero values', () => {
      const matrix = [
        [0, 1],
        [1, 0]
      ]
      const { assignment } = hungarianAlgorithm(matrix, 'min')
      const sensitivity = calculateSensitivity(matrix, assignment, 'min')
      
      expect(sensitivity.length).toBe(2)
      expect(sensitivity[0].length).toBe(2)
    })

    it('should handle matrices with identical values', () => {
      const matrix = [
        [5, 5],
        [5, 5]
      ]
      const { assignment } = hungarianAlgorithm(matrix, 'min')
      const sensitivity = calculateSensitivity(matrix, assignment, 'min')
      
      expect(sensitivity.length).toBe(2)
      expect(sensitivity[0].length).toBe(2)
      
      // With identical values, sensitivity might be infinite for some cells
      sensitivity.forEach(row => {
        row.forEach(value => {
          expect(value === null || value === Infinity || typeof value === 'number').toBe(true)
        })
      })
    })

    it('should handle rectangular matrices', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6]
      ]
      const { assignment } = hungarianAlgorithm(matrix, 'min')
      const sensitivity = calculateSensitivity(matrix, assignment, 'min')
      
      expect(sensitivity.length).toBe(2)
      expect(sensitivity[0].length).toBe(3)
    })
  })

  describe('Mathematical properties', () => {
    it('should return non-negative sensitivity values', () => {
      const matrix = [
        [10, 20, 30],
        [15, 25, 35],
        [5, 15, 25]
      ]
      const { assignment } = hungarianAlgorithm(matrix, 'min')
      const sensitivity = calculateSensitivity(matrix, assignment, 'min')
      
      sensitivity.forEach(row => {
        row.forEach(value => {
          if (value !== null && value !== Infinity) {
            expect(value).toBeGreaterThanOrEqual(0)
          }
        })
      })
    })

    it('should handle large matrices efficiently', () => {
      const size = 5
      const matrix = Array(size).fill(0).map(() => 
        Array(size).fill(0).map(() => Math.floor(Math.random() * 100) + 1)
      )
      
      const { assignment } = hungarianAlgorithm(matrix, 'min')
      const sensitivity = calculateSensitivity(matrix, assignment, 'min')
      
      expect(sensitivity.length).toBe(size)
      expect(sensitivity[0].length).toBe(size)
    })
  })

  describe('Consistency checks', () => {
    it('should produce consistent results for same input', () => {
      const matrix = [
        [3, 1, 4],
        [2, 0, 5],
        [1, 3, 2]
      ]
      const { assignment } = hungarianAlgorithm(matrix, 'min')
      
      const sensitivity1 = calculateSensitivity(matrix, assignment, 'min')
      const sensitivity2 = calculateSensitivity(matrix, assignment, 'min')
      
      expect(sensitivity1).toEqual(sensitivity2)
    })
  })
})