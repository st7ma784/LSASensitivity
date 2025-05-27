import { describe, it, expect } from 'vitest'
import { 
  initializeMatrix, 
  getCostMatrixColor, 
  getSensitivityColor, 
  deepCopyMatrix, 
  validateMatrix 
} from '@/lib/matrix-utils'

describe('Matrix Utilities', () => {
  describe('initializeMatrix', () => {
    it('should create matrix with correct dimensions', () => {
      const matrix = initializeMatrix(3, 4)
      
      expect(matrix.length).toBe(3) // rows
      expect(matrix[0].length).toBe(4) // columns
      expect(matrix[1].length).toBe(4) // all rows same length
      expect(matrix[2].length).toBe(4)
    })

    it('should create matrix with positive values', () => {
      const matrix = initializeMatrix(2, 2)
      
      matrix.forEach(row => {
        row.forEach(value => {
          expect(value).toBeGreaterThan(0)
          expect(value).toBeLessThanOrEqual(100)
          expect(Number.isInteger(value)).toBe(true)
        })
      })
    })

    it('should handle edge cases', () => {
      const matrix1x1 = initializeMatrix(1, 1)
      expect(matrix1x1.length).toBe(1)
      expect(matrix1x1[0].length).toBe(1)

      const matrix5x1 = initializeMatrix(5, 1)
      expect(matrix5x1.length).toBe(5)
      expect(matrix5x1[0].length).toBe(1)
    })
  })

  describe('getCostMatrixColor', () => {
    it('should return correct colors for value ranges', () => {
      expect(getCostMatrixColor(10)).toBe('bg-blue-50 border border-blue-200') // <= 25
      expect(getCostMatrixColor(25)).toBe('bg-blue-50 border border-blue-200') // <= 25
      
      expect(getCostMatrixColor(30)).toBe('bg-blue-100 border border-blue-300') // 26-50
      expect(getCostMatrixColor(50)).toBe('bg-blue-100 border border-blue-300') // <= 50
      
      expect(getCostMatrixColor(60)).toBe('bg-blue-200 border border-blue-400') // 51-75
      expect(getCostMatrixColor(75)).toBe('bg-blue-200 border border-blue-400') // <= 75
      
      expect(getCostMatrixColor(80)).toBe('bg-blue-300 border border-blue-500') // > 75
      expect(getCostMatrixColor(100)).toBe('bg-blue-300 border border-blue-500') // > 75
    })

    it('should handle edge values correctly', () => {
      expect(getCostMatrixColor(0)).toBe('bg-blue-50 border border-blue-200')
      expect(getCostMatrixColor(26)).toBe('bg-blue-100 border border-blue-300')
      expect(getCostMatrixColor(51)).toBe('bg-blue-200 border border-blue-400')
      expect(getCostMatrixColor(76)).toBe('bg-blue-300 border border-blue-500')
    })
  })

  describe('getSensitivityColor', () => {
    it('should return correct colors for sensitivity ranges', () => {
      expect(getSensitivityColor(null)).toBe('bg-gray-100 border border-gray-300')
      expect(getSensitivityColor(Infinity)).toBe('bg-emerald-100 border border-emerald-300')
      expect(getSensitivityColor(15)).toBe('bg-emerald-100 border border-emerald-300') // > 10
      
      expect(getSensitivityColor(8)).toBe('bg-yellow-100 border border-yellow-300') // 6-10
      expect(getSensitivityColor(6)).toBe('bg-yellow-100 border border-yellow-300') // >= 6
      
      expect(getSensitivityColor(5)).toBe('bg-orange-100 border border-orange-300') // 4-5
      expect(getSensitivityColor(4)).toBe('bg-orange-100 border border-orange-300') // >= 4
      
      expect(getSensitivityColor(3)).toBe('bg-red-100 border border-red-300') // < 4
      expect(getSensitivityColor(1)).toBe('bg-red-100 border border-red-300') // < 4
    })

    it('should handle boundary values correctly', () => {
      expect(getSensitivityColor(10)).toBe('bg-yellow-100 border border-yellow-300')
      expect(getSensitivityColor(11)).toBe('bg-emerald-100 border border-emerald-300')
      expect(getSensitivityColor(5.99)).toBe('bg-orange-100 border border-orange-300')
      expect(getSensitivityColor(3.99)).toBe('bg-red-100 border border-red-300')
    })
  })

  describe('deepCopyMatrix', () => {
    it('should create independent copy of matrix', () => {
      const original = [[1, 2], [3, 4]]
      const copy = deepCopyMatrix(original)
      
      // Modify original
      original[0][0] = 999
      
      // Copy should be unchanged
      expect(copy[0][0]).toBe(1)
      expect(copy).toEqual([[1, 2], [3, 4]])
    })

    it('should handle empty matrix', () => {
      const original: number[][] = []
      const copy = deepCopyMatrix(original)
      
      expect(copy).toEqual([])
      expect(copy).not.toBe(original) // Different references
    })

    it('should handle irregular matrices', () => {
      const original = [[1], [2, 3], [4, 5, 6]]
      const copy = deepCopyMatrix(original)
      
      expect(copy).toEqual([[1], [2, 3], [4, 5, 6]])
      
      // Modify original
      original[1][1] = 999
      expect(copy[1][1]).toBe(3) // Copy unchanged
    })
  })

  describe('validateMatrix', () => {
    it('should validate correct matrices', () => {
      expect(validateMatrix([[1, 2], [3, 4]])).toBe(true)
      expect(validateMatrix([[0]])).toBe(true)
      expect(validateMatrix([[1, 2, 3], [4, 5, 6]])).toBe(true)
    })

    it('should reject empty matrices', () => {
      expect(validateMatrix([])).toBe(false)
      expect(validateMatrix([[]])).toBe(false)
    })

    it('should reject irregular matrices', () => {
      expect(validateMatrix([[1, 2], [3]])).toBe(false) // Different row lengths
      expect(validateMatrix([[1], [2, 3]])).toBe(false) // Different row lengths
    })

    it('should reject matrices with invalid values', () => {
      expect(validateMatrix([[1, -1], [2, 3]])).toBe(false) // Negative values
      expect(validateMatrix([[1, Infinity], [2, 3]])).toBe(false) // Infinity
      expect(validateMatrix([[1, NaN], [2, 3]])).toBe(false) // NaN
    })

    it('should handle edge cases', () => {
      expect(validateMatrix([[0, 0], [0, 0]])).toBe(true) // All zeros valid
      expect(validateMatrix([[1.5, 2.7]])).toBe(true) // Decimal values valid
    })
  })
})