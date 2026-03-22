/**
 * Unit tests for SpaceBackground prop validation logic (Task 6.1)
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { validateSpaceBackgroundProps } from '../validateSpaceBackgroundProps'

const DEFAULT_BASE_POSITION: [number, number, number] = [0, -50, -100]
const DEFAULT_BASE_SCALE = 180
const DEFAULT_PARALLAX_INTENSITY = 0.3
const DEFAULT_ROTATION_SPEED = 0.05

function validProps() {
  return {
    basePosition: [0, -50, -100] as [number, number, number],
    baseScale: 180,
    parallaxIntensity: 0.3,
    rotationSpeed: 0.05,
    enableParallax: true,
    enableRotation: true,
  }
}

describe('validateSpaceBackgroundProps', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  describe('valid props pass through unchanged', () => {
    it('returns valid props as-is', () => {
      const props = validProps()
      const result = validateSpaceBackgroundProps(props)
      expect(result.basePosition).toEqual([0, -50, -100])
      expect(result.baseScale).toBe(180)
      expect(result.parallaxIntensity).toBe(0.3)
      expect(result.rotationSpeed).toBe(0.05)
    })
  })

  describe('basePosition validation (Requirement 7.1)', () => {
    it('falls back to default when basePosition contains NaN', () => {
      const props = { ...validProps(), basePosition: [NaN, -50, -100] as [number, number, number] }
      const result = validateSpaceBackgroundProps(props)
      expect(result.basePosition).toEqual(DEFAULT_BASE_POSITION)
    })

    it('falls back to default when basePosition contains Infinity', () => {
      const props = { ...validProps(), basePosition: [0, Infinity, -100] as [number, number, number] }
      const result = validateSpaceBackgroundProps(props)
      expect(result.basePosition).toEqual(DEFAULT_BASE_POSITION)
    })

    it('falls back to default when basePosition contains -Infinity', () => {
      const props = { ...validProps(), basePosition: [0, -50, -Infinity] as [number, number, number] }
      const result = validateSpaceBackgroundProps(props)
      expect(result.basePosition).toEqual(DEFAULT_BASE_POSITION)
    })

    it('accepts valid finite basePosition', () => {
      const pos: [number, number, number] = [10, -30, -80]
      const props = { ...validProps(), basePosition: pos }
      const result = validateSpaceBackgroundProps(props)
      expect(result.basePosition).toEqual(pos)
    })
  })

  describe('baseScale validation (Requirement 7.2)', () => {
    it('falls back to default when baseScale is 0', () => {
      const props = { ...validProps(), baseScale: 0 }
      const result = validateSpaceBackgroundProps(props)
      expect(result.baseScale).toBe(DEFAULT_BASE_SCALE)
    })

    it('falls back to default when baseScale is negative', () => {
      const props = { ...validProps(), baseScale: -10 }
      const result = validateSpaceBackgroundProps(props)
      expect(result.baseScale).toBe(DEFAULT_BASE_SCALE)
    })

    it('falls back to default when baseScale is NaN', () => {
      const props = { ...validProps(), baseScale: NaN }
      const result = validateSpaceBackgroundProps(props)
      expect(result.baseScale).toBe(DEFAULT_BASE_SCALE)
    })

    it('accepts positive baseScale', () => {
      const props = { ...validProps(), baseScale: 200 }
      const result = validateSpaceBackgroundProps(props)
      expect(result.baseScale).toBe(200)
    })
  })

  describe('parallaxIntensity validation (Requirement 7.3)', () => {
    it('clamps parallaxIntensity below 0 to 0', () => {
      const props = { ...validProps(), parallaxIntensity: -0.5 }
      const result = validateSpaceBackgroundProps(props)
      expect(result.parallaxIntensity).toBe(0)
    })

    it('clamps parallaxIntensity above 1 to 1', () => {
      const props = { ...validProps(), parallaxIntensity: 1.5 }
      const result = validateSpaceBackgroundProps(props)
      expect(result.parallaxIntensity).toBe(1)
    })

    it('falls back to default when parallaxIntensity is NaN', () => {
      const props = { ...validProps(), parallaxIntensity: NaN }
      const result = validateSpaceBackgroundProps(props)
      expect(result.parallaxIntensity).toBe(DEFAULT_PARALLAX_INTENSITY)
    })

    it('accepts parallaxIntensity at boundary 0', () => {
      const props = { ...validProps(), parallaxIntensity: 0 }
      const result = validateSpaceBackgroundProps(props)
      expect(result.parallaxIntensity).toBe(0)
    })

    it('accepts parallaxIntensity at boundary 1', () => {
      const props = { ...validProps(), parallaxIntensity: 1 }
      const result = validateSpaceBackgroundProps(props)
      expect(result.parallaxIntensity).toBe(1)
    })
  })

  describe('rotationSpeed validation (Requirement 7.4)', () => {
    it('falls back to default when rotationSpeed is 0', () => {
      const props = { ...validProps(), rotationSpeed: 0 }
      const result = validateSpaceBackgroundProps(props)
      expect(result.rotationSpeed).toBe(DEFAULT_ROTATION_SPEED)
    })

    it('falls back to default when rotationSpeed is negative', () => {
      const props = { ...validProps(), rotationSpeed: -0.1 }
      const result = validateSpaceBackgroundProps(props)
      expect(result.rotationSpeed).toBe(DEFAULT_ROTATION_SPEED)
    })

    it('falls back to default when rotationSpeed is NaN', () => {
      const props = { ...validProps(), rotationSpeed: NaN }
      const result = validateSpaceBackgroundProps(props)
      expect(result.rotationSpeed).toBe(DEFAULT_ROTATION_SPEED)
    })

    it('accepts positive rotationSpeed', () => {
      const props = { ...validProps(), rotationSpeed: 0.1 }
      const result = validateSpaceBackgroundProps(props)
      expect(result.rotationSpeed).toBe(0.1)
    })
  })

  describe('boolean flags pass through unchanged', () => {
    it('preserves enableParallax=false', () => {
      const props = { ...validProps(), enableParallax: false }
      const result = validateSpaceBackgroundProps(props)
      expect(result.enableParallax).toBe(false)
    })

    it('preserves enableRotation=false', () => {
      const props = { ...validProps(), enableRotation: false }
      const result = validateSpaceBackgroundProps(props)
      expect(result.enableRotation).toBe(false)
    })
  })
})
