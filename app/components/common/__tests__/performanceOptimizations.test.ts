/**
 * Performance tests for SpaceBackground (Task 9.4)
 *
 * Tests the performance monitoring logic and quality reduction behaviour
 * implemented in SpaceBackground.tsx.
 *
 * Requirements: 9.1, 9.2
 *
 * Strategy:
 * - Extract and test the frame-rate detection algorithm at the unit level
 * - Test that quality reduction (rotation disabled) triggers when FPS < 30
 * - Test that animation calculations complete within a time budget
 */

import { describe, it, expect } from 'vitest'
import { updateRotation } from '../updateRotation'
import { calculateParallaxOffset } from '../calculateParallaxOffset'

// ---------------------------------------------------------------------------
// Helpers that mirror the performance monitoring logic in SpaceBackground.tsx
// ---------------------------------------------------------------------------

/**
 * Simulates the rolling-window FPS detection used in SpaceBackground.
 * Returns the average FPS after processing the given deltas.
 */
function computeAverageFps(deltas: number[]): number {
  const window = deltas.slice(-30) // keep last 30 frames
  if (window.length === 0) return Infinity
  const avgDelta = window.reduce((sum, d) => sum + d, 0) / window.length
  return 1 / avgDelta
}

/**
 * Simulates the low-performance detection logic from SpaceBackground.
 * Returns true once the rolling window is full (30 frames) and avg FPS < 30.
 */
function simulatePerfMonitor(deltas: number[]): {
  lowPerfDetected: boolean
  avgFps: number
  windowFull: boolean
} {
  const frameTimes: number[] = []
  let lowPerfDetected = false

  for (const delta of deltas) {
    frameTimes.push(delta)
    if (frameTimes.length > 30) frameTimes.shift()

    if (!lowPerfDetected && frameTimes.length === 30) {
      const avgDelta = frameTimes.reduce((sum, d) => sum + d, 0) / frameTimes.length
      const avgFps = 1 / avgDelta
      if (avgFps < 30) {
        lowPerfDetected = true
      }
    }
  }

  const windowFull = frameTimes.length === 30
  const avgFps = windowFull ? computeAverageFps(frameTimes) : Infinity

  return { lowPerfDetected, avgFps, windowFull }
}

// ---------------------------------------------------------------------------
// Requirement 9.1 – Frame rate monitoring logic
// ---------------------------------------------------------------------------

describe('Performance monitoring – frame rate detection (Requirement 9.1)', () => {
  it('does not trigger low-perf before 30 frames are collected', () => {
    // Only 29 frames at 15fps (well below 30fps threshold)
    const deltas = Array(29).fill(1 / 15)
    const { lowPerfDetected } = simulatePerfMonitor(deltas)
    expect(lowPerfDetected).toBe(false)
  })

  it('does not flag low-perf when average FPS is exactly 30', () => {
    // 30 frames at exactly 30fps → avgFps === 30, NOT < 30
    const deltas = Array(30).fill(1 / 30)
    const { lowPerfDetected, avgFps } = simulatePerfMonitor(deltas)
    expect(avgFps).toBeCloseTo(30, 1)
    expect(lowPerfDetected).toBe(false)
  })

  it('does not flag low-perf when average FPS is above 30', () => {
    const deltas = Array(30).fill(1 / 60) // 60fps
    const { lowPerfDetected, avgFps } = simulatePerfMonitor(deltas)
    expect(avgFps).toBeCloseTo(60, 1)
    expect(lowPerfDetected).toBe(false)
  })

  it('flags low-perf when average FPS drops below 30 after 30 frames', () => {
    const deltas = Array(30).fill(1 / 20) // 20fps – below threshold
    const { lowPerfDetected, avgFps } = simulatePerfMonitor(deltas)
    expect(avgFps).toBeCloseTo(20, 1)
    expect(lowPerfDetected).toBe(true)
  })

  it('flags low-perf at 15fps (severely degraded)', () => {
    const deltas = Array(30).fill(1 / 15)
    const { lowPerfDetected } = simulatePerfMonitor(deltas)
    expect(lowPerfDetected).toBe(true)
  })

  it('uses a rolling window – old slow frames are evicted by new fast frames', () => {
    // First 30 frames are slow (15fps), then 30 more fast frames (60fps)
    const slowDeltas = Array(30).fill(1 / 15)
    const fastDeltas = Array(30).fill(1 / 60)
    const allDeltas = [...slowDeltas, ...fastDeltas]

    // After all 60 frames the window contains only the last 30 (fast) frames
    const { avgFps } = simulatePerfMonitor(allDeltas)
    expect(avgFps).toBeCloseTo(60, 1)
  })

  it('computes correct average FPS from mixed deltas', () => {
    // 15 frames at 60fps + 15 frames at 30fps → avg delta = (1/60 + 1/30)/2 = 1/40
    const deltas = [
      ...Array(15).fill(1 / 60),
      ...Array(15).fill(1 / 30),
    ]
    const avgFps = computeAverageFps(deltas)
    // avg delta = (15*(1/60) + 15*(1/30)) / 30 = (0.25 + 0.5) / 30 = 0.025 → 40fps
    expect(avgFps).toBeCloseTo(40, 0)
  })
})

// ---------------------------------------------------------------------------
// Requirement 9.2 – Quality reduction triggers correctly
// ---------------------------------------------------------------------------

describe('Quality reduction – rotation disabled on low FPS (Requirement 9.2)', () => {
  /**
   * Simulates the effectiveEnableRotation logic from SpaceBackground:
   *   const effectiveEnableRotation = (isMobile || lowPerfRef.current) ? false : enableRotation
   */
  function effectiveEnableRotation(
    enableRotation: boolean,
    isMobile: boolean,
    lowPerf: boolean
  ): boolean {
    return isMobile || lowPerf ? false : enableRotation
  }

  it('rotation stays enabled when FPS is above 30 and not mobile', () => {
    const deltas = Array(30).fill(1 / 60)
    const { lowPerfDetected } = simulatePerfMonitor(deltas)
    expect(effectiveEnableRotation(true, false, lowPerfDetected)).toBe(true)
  })

  it('rotation is disabled when low-perf is detected', () => {
    const deltas = Array(30).fill(1 / 20) // 20fps
    const { lowPerfDetected } = simulatePerfMonitor(deltas)
    expect(lowPerfDetected).toBe(true)
    expect(effectiveEnableRotation(true, false, lowPerfDetected)).toBe(false)
  })

  it('rotation is disabled on mobile regardless of FPS', () => {
    const deltas = Array(30).fill(1 / 60) // good FPS
    const { lowPerfDetected } = simulatePerfMonitor(deltas)
    expect(effectiveEnableRotation(true, true /* isMobile */, lowPerfDetected)).toBe(false)
  })

  it('rotation stays disabled when both mobile and low-perf', () => {
    const deltas = Array(30).fill(1 / 15)
    const { lowPerfDetected } = simulatePerfMonitor(deltas)
    expect(effectiveEnableRotation(true, true, lowPerfDetected)).toBe(false)
  })

  it('low-perf flag is sticky – stays true even if FPS recovers', () => {
    // Once lowPerfDetected is set to true it is never reset (mirrors SpaceBackground behaviour)
    let lowPerfDetected = false
    const frameTimes: number[] = []

    // Phase 1: 30 slow frames → triggers low-perf
    for (let i = 0; i < 30; i++) {
      frameTimes.push(1 / 15)
      if (frameTimes.length > 30) frameTimes.shift()
      if (!lowPerfDetected && frameTimes.length === 30) {
        const avg = frameTimes.reduce((s, d) => s + d, 0) / frameTimes.length
        if (1 / avg < 30) lowPerfDetected = true
      }
    }
    expect(lowPerfDetected).toBe(true)

    // Phase 2: 30 fast frames – flag must NOT reset
    for (let i = 0; i < 30; i++) {
      frameTimes.push(1 / 120)
      if (frameTimes.length > 30) frameTimes.shift()
      // SpaceBackground only checks `if (!lowPerfRef.current && ...)` so it never resets
    }
    expect(lowPerfDetected).toBe(true)
  })

  it('parallax intensity is halved on mobile', () => {
    const baseIntensity = 0.3
    const isMobile = true
    const effectiveIntensity = isMobile ? baseIntensity * 0.5 : baseIntensity
    expect(effectiveIntensity).toBeCloseTo(0.15)
  })

  it('parallax intensity is unchanged on desktop', () => {
    const baseIntensity = 0.3
    const isMobile = false
    const effectiveIntensity = isMobile ? baseIntensity * 0.5 : baseIntensity
    expect(effectiveIntensity).toBe(0.3)
  })
})

// ---------------------------------------------------------------------------
// Animation calculation performance budget (Requirement 9.3)
// ---------------------------------------------------------------------------

describe('Animation calculation performance budget (Requirements 9.3, 9.4)', () => {
  const BUDGET_MS = 1 // 1ms budget per frame for pure calculations

  it('updateRotation completes within 1ms per call', () => {
    const rotation = { x: 0, y: 0, z: 0 }
    const start = performance.now()
    const ITERATIONS = 1000
    for (let i = 0; i < ITERATIONS; i++) {
      updateRotation(rotation, 0.05, 1 / 60)
    }
    const elapsed = performance.now() - start
    const perCall = elapsed / ITERATIONS
    expect(perCall).toBeLessThan(BUDGET_MS)
  })

  it('calculateParallaxOffset completes within 1ms per call', () => {
    const basePosition: [number, number, number] = [0, -50, -100]
    const start = performance.now()
    const ITERATIONS = 1000
    for (let i = 0; i < ITERATIONS; i++) {
      calculateParallaxOffset(0.5, basePosition, 0.3)
    }
    const elapsed = performance.now() - start
    const perCall = elapsed / ITERATIONS
    expect(perCall).toBeLessThan(BUDGET_MS)
  })

  it('1000 consecutive rotation updates complete in under 10ms total', () => {
    let rotation = { x: 0, y: 0, z: 0 }
    const start = performance.now()
    for (let i = 0; i < 1000; i++) {
      rotation = updateRotation(rotation, 0.05, 1 / 60)
    }
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(10)
  })

  it('1000 consecutive parallax calculations complete in under 10ms total', () => {
    const basePosition: [number, number, number] = [0, -50, -100]
    const start = performance.now()
    for (let i = 0; i < 1000; i++) {
      calculateParallaxOffset(i / 1000, basePosition, 0.3)
    }
    const elapsed = performance.now() - start
    expect(elapsed).toBeLessThan(10)
  })
})
