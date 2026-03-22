import { describe, it, expect } from 'vitest'
import { calculateParallaxOffset } from './SpaceBackground'

describe('calculateParallaxOffset', () => {
  describe('Y-axis offset calculation', () => {
    it('should calculate Y-axis offset as scrollProgress × intensity × 50', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const scrollProgress = 0.5
      const intensity = 0.3
      
      const result = calculateParallaxOffset(scrollProgress, basePosition, intensity)
      
      // Expected Y offset: 0.5 × 0.3 × 50 = 7.5
      // Expected Y position: -50 + 7.5 = -42.5
      expect(result[1]).toBe(-42.5)
    })

    it('should have zero Y offset when scrollProgress is 0', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const result = calculateParallaxOffset(0, basePosition, 0.3)
      
      expect(result[1]).toBe(-50)
    })

    it('should have maximum Y offset when scrollProgress is 1', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const intensity = 0.3
      const result = calculateParallaxOffset(1, basePosition, intensity)
      
      // Expected Y offset: 1 × 0.3 × 50 = 15
      // Expected Y position: -50 + 15 = -35
      expect(result[1]).toBe(-35)
    })
  })

  describe('Z-axis offset calculation', () => {
    it('should calculate Z-axis offset as scrollProgress × intensity × 20', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const scrollProgress = 0.5
      const intensity = 0.3
      
      const result = calculateParallaxOffset(scrollProgress, basePosition, intensity)
      
      // Expected Z offset: 0.5 × 0.3 × 20 = 3
      // Expected Z position: -100 + 3 = -97
      expect(result[2]).toBe(-97)
    })

    it('should have zero Z offset when scrollProgress is 0', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const result = calculateParallaxOffset(0, basePosition, 0.3)
      
      expect(result[2]).toBe(-100)
    })

    it('should have maximum Z offset when scrollProgress is 1', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const intensity = 0.3
      const result = calculateParallaxOffset(1, basePosition, intensity)
      
      // Expected Z offset: 1 × 0.3 × 20 = 6
      // Expected Z position: -100 + 6 = -94
      expect(result[2]).toBe(-94)
    })
  })

  describe('X-axis invariant', () => {
    it('should keep X-axis unchanged by parallax calculations', () => {
      const basePosition: [number, number, number] = [10, -50, -100]
      const result = calculateParallaxOffset(0.5, basePosition, 0.3)
      
      expect(result[0]).toBe(10)
    })

    it('should preserve X-axis for different scroll values', () => {
      const basePosition: [number, number, number] = [-5, -50, -100]
      
      const result1 = calculateParallaxOffset(0, basePosition, 0.3)
      const result2 = calculateParallaxOffset(0.5, basePosition, 0.3)
      const result3 = calculateParallaxOffset(1, basePosition, 0.3)
      
      expect(result1[0]).toBe(-5)
      expect(result2[0]).toBe(-5)
      expect(result3[0]).toBe(-5)
    })
  })

  describe('precondition validation', () => {
    it('should clamp scrollProgress below 0 to 0', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const result = calculateParallaxOffset(-0.5, basePosition, 0.3)
      
      // Should behave as if scrollProgress is 0
      expect(result[1]).toBe(-50)
      expect(result[2]).toBe(-100)
    })

    it('should clamp scrollProgress above 1 to 1', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const intensity = 0.3
      const result = calculateParallaxOffset(1.5, basePosition, intensity)
      
      // Should behave as if scrollProgress is 1
      // Y offset: 1 × 0.3 × 50 = 15
      // Z offset: 1 × 0.3 × 20 = 6
      expect(result[1]).toBe(-35)
      expect(result[2]).toBe(-94)
    })

    it('should clamp intensity below 0 to 0', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const result = calculateParallaxOffset(0.5, basePosition, -0.5)
      
      // Should behave as if intensity is 0
      expect(result[1]).toBe(-50)
      expect(result[2]).toBe(-100)
    })

    it('should clamp intensity above 1 to 1', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const result = calculateParallaxOffset(0.5, basePosition, 1.5)
      
      // Should behave as if intensity is 1
      // Y offset: 0.5 × 1 × 50 = 25
      // Z offset: 0.5 × 1 × 20 = 10
      expect(result[1]).toBe(-25)
      expect(result[2]).toBe(-90)
    })

    it('should return default position for non-finite basePosition', () => {
      const invalidPosition: [number, number, number] = [NaN, -50, -100]
      const result = calculateParallaxOffset(0.5, invalidPosition, 0.3)
      
      expect(result).toEqual([0, -50, -100])
    })
  })

  describe('output finiteness', () => {
    it('should return finite numbers for all components', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      const result = calculateParallaxOffset(0.5, basePosition, 0.3)
      
      expect(Number.isFinite(result[0])).toBe(true)
      expect(Number.isFinite(result[1])).toBe(true)
      expect(Number.isFinite(result[2])).toBe(true)
    })

    it('should return finite numbers at boundary values', () => {
      const basePosition: [number, number, number] = [0, -50, -100]
      
      const result1 = calculateParallaxOffset(0, basePosition, 0)
      const result2 = calculateParallaxOffset(1, basePosition, 1)
      
      expect(result1.every(v => Number.isFinite(v))).toBe(true)
      expect(result2.every(v => Number.isFinite(v))).toBe(true)
    })
  })
})
