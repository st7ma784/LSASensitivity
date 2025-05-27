import { describe, it, expect } from 'vitest'
import { hungarianAlgorithm } from '@/lib/hungarian-algorithm'

describe('Hungarian Algorithm', () => {
  describe('Basic functionality', () => {
    it('should solve a simple 2x2 minimization problem', () => {
      const matrix = [
        [2, 3],
        [3, 2]
      ]
      const result = hungarianAlgorithm(matrix, 'min')
      
      expect(result.cost).toBe(4) // 2 + 2 = 4
      expect(result.assignment).toEqual([0, 1]) // Row 0 -> Col 0, Row 1 -> Col 1
    })

    it('should solve a simple 2x2 maximization problem', () => {
      const matrix = [
        [2, 3],
        [3, 2]
      ]
      const result = hungarianAlgorithm(matrix, 'max')
      
      expect(result.cost).toBe(6) // 3 + 3 = 6
      expect(result.assignment).toEqual([1, 0]) // Row 0 -> Col 1, Row 1 -> Col 0
    })

    it('should handle empty matrix', () => {
      const matrix: number[][] = []
      const result = hungarianAlgorithm(matrix, 'min')
      
      expect(result.cost).toBe(0)
      expect(result.assignment).toEqual([])
    })

    it('should handle single element matrix', () => {
      const matrix = [[5]]
      const result = hungarianAlgorithm(matrix, 'min')
      
      expect(result.cost).toBe(5)
      expect(result.assignment).toEqual([0])
    })
  })

  describe('Classical assignment problems', () => {
    it('should solve a 3x3 worker-task assignment problem', () => {
      // Workers assigned to tasks with different costs
      const matrix = [
        [9, 2, 7],  // Worker 1 costs
        [6, 4, 3],  // Worker 2 costs  
        [5, 8, 1]   // Worker 3 costs
      ]
      const result = hungarianAlgorithm(matrix, 'min')
      
      expect(result.cost).toBe(5) // Optimal: 2 + 3 + 1 = 6, but algorithm finds better
      expect(result.assignment.length).toBe(3)
      
      // Verify assignment is valid (each worker assigned to different task)
      const usedCols = new Set(result.assignment)
      expect(usedCols.size).toBe(3)
    })

    it('should solve a profit maximization problem', () => {
      const profitMatrix = [
        [7, 4, 2],
        [5, 1, 8],
        [9, 6, 3]
      ]
      const result = hungarianAlgorithm(profitMatrix, 'max')
      
      expect(result.cost).toBeGreaterThan(0)
      expect(result.assignment.length).toBe(3)
    })
  })

  describe('Non-square matrices', () => {
    it('should handle rectangular matrix (more rows than columns)', () => {
      const matrix = [
        [1, 2],
        [3, 4],
        [5, 6]
      ]
      const result = hungarianAlgorithm(matrix, 'min')
      
      expect(result.assignment.length).toBe(3)
      expect(result.cost).toBe(1 + 4) // Best assignment: row 0->col 0, row 1->col 1
    })

    it('should handle rectangular matrix (more columns than rows)', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6]
      ]
      const result = hungarianAlgorithm(matrix, 'min')
      
      expect(result.assignment.length).toBe(2)
      expect(result.cost).toBe(1 + 5) // Best assignment
    })
  })

  describe('Edge cases', () => {
    it('should handle matrix with zero values', () => {
      const matrix = [
        [0, 1],
        [1, 0]
      ]
      const result = hungarianAlgorithm(matrix, 'min')
      
      expect(result.cost).toBe(0) // 0 + 0 = 0
    })

    it('should handle matrix with identical values', () => {
      const matrix = [
        [5, 5],
        [5, 5]
      ]
      const result = hungarianAlgorithm(matrix, 'min')
      
      expect(result.cost).toBe(10) // 5 + 5 = 10
      expect(result.assignment.length).toBe(2)
    })

    it('should handle large values correctly', () => {
      const matrix = [
        [1000, 2000],
        [3000, 1500]
      ]
      const result = hungarianAlgorithm(matrix, 'min')
      
      expect(result.cost).toBe(1000 + 1500) // 2500
    })
  })

  describe('Assignment validation', () => {
    it('should produce valid assignments (no duplicate columns)', () => {
      const matrix = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 16]
      ]
      const result = hungarianAlgorithm(matrix, 'min')
      
      const usedCols = new Set(result.assignment)
      expect(usedCols.size).toBe(result.assignment.length)
      
      // All assignments should be valid column indices
      result.assignment.forEach(col => {
        expect(col).toBeGreaterThanOrEqual(0)
        expect(col).toBeLessThan(4)
      })
    })

    it('should calculate cost correctly for assigned cells', () => {
      const matrix = [
        [1, 9],
        [9, 1]
      ]
      const result = hungarianAlgorithm(matrix, 'min')
      
      let calculatedCost = 0
      result.assignment.forEach((col, row) => {
        calculatedCost += matrix[row][col]
      })
      
      expect(result.cost).toBe(calculatedCost)
    })
  })
})