/**
 * Unit tests for calculateParallaxOffset function
 */

import { describe, it, expect } from 'vitest'
import { calculateParallaxOffset } from '../calculateParallaxOffset'

describe('calculateParallaxOffset', () => {
  it('returns base position when scrollProgress is 0', () => {
    const base: [number, number, number] = [0, -50, -100]
    const result = calculateParallaxOffset(0, base, 0.3)
    expect(result).toEqual([0, -50, -100])
  })

  it('calculates correct Y and Z offsets at full scroll with intensity 1', () => {
    const base: [number, number, number] = [0, -50, -100]
    const result = calculateParallaxOffset(1, base, 1.0)
    // Y: -50 + (1 * 1 * 50) = 0, Z: -100 + (1 * 1 * 20) = -80
    expect(result).toEqual([0, 0, -80])
  })

  it('calculates correct offsets at half scroll with default intensity', () => {
    const base: [number, number, number] = [0, -50, -100]
    const result = calculateParallaxOffset(0.5, base, 0.3)
    // Y: -50 + (0.5 * 0.3 * 50) = -42.5, Z: -100 + (0.5 * 0.3 * 20) = -97
    expect(result[1]).toBeCloseTo(-42.5)
    expect(result[2]).toBeCloseTo(-97)
  })

  it('keeps X-axis unchanged', () => {
    const base: [number, number, number] = [10, -50, -100]
    const result = calculateParallaxOffset(0.8, base, 0.5)
    expect(result[0]).toBe(10)
  })

  it('produces no offset when intensity is 0', () => {
    const base: [number, number, number] = [0, -50, -100]
    const result = calculateParallaxOffset(1, base, 0)
    expect(result).toEqual([0, -50, -100])
  })

  it('clamps scrollProgress below 0 to 0', () => {
    const base: [number, number, number] = [0, -50, -100]
    const result = calculateParallaxOffset(-0.5, base, 0.3)
    expect(result).toEqual([0, -50, -100])
  })

  it('clamps scrollProgress above 1 to 1', () => {
    const base: [number, number, number] = [0, -50, -100]
    const result = calculateParallaxOffset(1.5, base, 0.3)
    expect(result[1]).toBeCloseTo(-35)
    expect(result[2]).toBeCloseTo(-94)
  })

  it('clamps intensity below 0 to 0', () => {
    const base: [number, number, number] = [0, -50, -100]
    const result = calculateParallaxOffset(0.5, base, -0.5)
    expect(result).toEqual([0, -50, -100])
  })

  it('clamps intensity above 1 to 1', () => {
    const base: [number, number, number] = [0, -50, -100]
    const result = calculateParallaxOffset(0.5, base, 1.5)
    // Y: -50 + (0.5 * 1 * 50) = -25, Z: -100 + (0.5 * 1 * 20) = -90
    expect(result[1]).toBeCloseTo(-25)
    expect(result[2]).toBeCloseTo(-90)
  })

  it('returns fallback [0, -50, -100] for non-finite basePosition', () => {
    const invalid: [number, number, number] = [NaN, -50, -100]
    const result = calculateParallaxOffset(0.5, invalid, 0.3)
    expect(result).toEqual([0, -50, -100])
  })
})
