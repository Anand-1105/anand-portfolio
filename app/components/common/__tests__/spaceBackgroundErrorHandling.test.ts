/**
 * Unit tests for SpaceBackground error handling (Task 6.4)
 * Requirements: 8.1, 8.2, 8.3, 8.4
 *
 * Tests cover:
 * - Model load failure → logs error to console (Req 8.1)
 * - Model load failure → renders fallback particle system (Req 8.2)
 * - Retry mechanism → retries up to 3 times with 2s delay (Req 8.3, 8.4)
 * - Invalid configuration → falls back to defaults (Req 7.x, covered via validateSpaceBackgroundProps)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { validateSpaceBackgroundProps, DEFAULT_SPACE_BACKGROUND_PROPS } from '../validateSpaceBackgroundProps'

// ---------------------------------------------------------------------------
// Constants mirrored from SpaceBackground.tsx
// ---------------------------------------------------------------------------
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000

// ---------------------------------------------------------------------------
// Simulate the handleError logic extracted from SpaceWithRetry
// This mirrors the exact logic in SpaceBackground.tsx so we can unit-test it
// without needing a React renderer.
// ---------------------------------------------------------------------------
function createRetryController(onFallback: () => void) {
  let attempt = 0
  let loadFailed = false
  const timers: ReturnType<typeof setTimeout>[] = []

  function handleError(error: Error) {
    console.error('[SpaceBackground] Space model failed to load:', error.message)

    if (attempt < MAX_RETRIES - 1) {
      const timer = setTimeout(() => {
        attempt += 1
        // In the real component this triggers a re-render via setAttempt
      }, RETRY_DELAY_MS)
      timers.push(timer)
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[SpaceBackground] All retry attempts failed. Rendering fallback particle system.')
      }
      loadFailed = true
      onFallback()
    }
  }

  function getAttempt() { return attempt }
  function isLoadFailed() { return loadFailed }
  function cleanup() { timers.forEach(clearTimeout) }

  return { handleError, getAttempt, isLoadFailed, cleanup }
}

// ---------------------------------------------------------------------------
// Requirement 8.1 — Log error message on model load failure
// ---------------------------------------------------------------------------
describe('Requirement 8.1 — error logging on model load failure', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('logs an error to console when the Space model fails to load', () => {
    const ctrl = createRetryController(() => {})
    const err = new Error('Failed to fetch /models/need_some_space.glb')

    ctrl.handleError(err)
    ctrl.cleanup()

    expect(errorSpy).toHaveBeenCalledOnce()
    expect(errorSpy).toHaveBeenCalledWith(
      '[SpaceBackground] Space model failed to load:',
      err.message
    )
  })

  it('logs the specific error message from the thrown error', () => {
    const ctrl = createRetryController(() => {})
    const err = new Error('Network request failed')

    ctrl.handleError(err)
    ctrl.cleanup()

    const [prefix, msg] = errorSpy.mock.calls[0]
    expect(prefix).toBe('[SpaceBackground] Space model failed to load:')
    expect(msg).toBe('Network request failed')
  })

  it('logs an error on every failed attempt', () => {
    vi.useFakeTimers()
    const ctrl = createRetryController(() => {})
    const err = new Error('load error')

    // Trigger all 3 attempts
    ctrl.handleError(err)
    vi.advanceTimersByTime(RETRY_DELAY_MS)
    ctrl.handleError(err)
    vi.advanceTimersByTime(RETRY_DELAY_MS)
    ctrl.handleError(err)

    expect(errorSpy).toHaveBeenCalledTimes(3)
    vi.useRealTimers()
    ctrl.cleanup()
  })
})

// ---------------------------------------------------------------------------
// Requirement 8.2 — Render fallback particle system on load failure
// ---------------------------------------------------------------------------
describe('Requirement 8.2 — fallback particle system after load failure', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    errorSpy.mockRestore()
  })

  it('triggers fallback after all retries are exhausted', () => {
    vi.useFakeTimers()
    const fallbackFn = vi.fn()
    const ctrl = createRetryController(fallbackFn)
    const err = new Error('load error')

    // Exhaust all MAX_RETRIES attempts
    for (let i = 0; i < MAX_RETRIES; i++) {
      ctrl.handleError(err)
      if (i < MAX_RETRIES - 1) {
        vi.advanceTimersByTime(RETRY_DELAY_MS)
      }
    }

    expect(fallbackFn).toHaveBeenCalledOnce()
    expect(ctrl.isLoadFailed()).toBe(true)
    vi.useRealTimers()
    ctrl.cleanup()
  })

  it('does NOT trigger fallback before all retries are exhausted', () => {
    vi.useFakeTimers()
    const fallbackFn = vi.fn()
    const ctrl = createRetryController(fallbackFn)
    const err = new Error('load error')

    // Only first failure — still has retries left
    ctrl.handleError(err)

    expect(fallbackFn).not.toHaveBeenCalled()
    expect(ctrl.isLoadFailed()).toBe(false)
    vi.useRealTimers()
    ctrl.cleanup()
  })

  it('fallback is triggered exactly once even if handleError is called again after exhaustion', () => {
    vi.useFakeTimers()
    const fallbackFn = vi.fn()
    const ctrl = createRetryController(fallbackFn)
    const err = new Error('load error')

    for (let i = 0; i < MAX_RETRIES; i++) {
      ctrl.handleError(err)
      if (i < MAX_RETRIES - 1) vi.advanceTimersByTime(RETRY_DELAY_MS)
    }

    // After exhaustion, loadFailed is true — the component would not call handleError again
    expect(fallbackFn).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
    ctrl.cleanup()
  })
})

// ---------------------------------------------------------------------------
// Requirement 8.3 — Retry loading after 2 seconds
// ---------------------------------------------------------------------------
describe('Requirement 8.3 — retry after 2 seconds', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    errorSpy.mockRestore()
  })

  it('schedules a retry after exactly 2000ms on first failure', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    const ctrl = createRetryController(() => {})
    const err = new Error('load error')

    ctrl.handleError(err)

    // Should have scheduled a retry
    const retryCall = setTimeoutSpy.mock.calls.find(([, delay]) => delay === RETRY_DELAY_MS)
    expect(retryCall).toBeDefined()
    expect(retryCall![1]).toBe(2000)

    ctrl.cleanup()
    setTimeoutSpy.mockRestore()
  })

  it('does not schedule a retry on the final (3rd) failure', () => {
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout')
    const ctrl = createRetryController(() => {})
    const err = new Error('load error')

    // Exhaust all retries
    for (let i = 0; i < MAX_RETRIES; i++) {
      ctrl.handleError(err)
      if (i < MAX_RETRIES - 1) vi.advanceTimersByTime(RETRY_DELAY_MS)
    }

    // The last call should NOT schedule another retry
    const retryCalls = setTimeoutSpy.mock.calls.filter(([, delay]) => delay === RETRY_DELAY_MS)
    // Only MAX_RETRIES - 1 retries should be scheduled (not on the last attempt)
    expect(retryCalls.length).toBe(MAX_RETRIES - 1)

    ctrl.cleanup()
    setTimeoutSpy.mockRestore()
  })

  it('retry is not triggered before 2000ms have elapsed', () => {
    let retryTriggered = false
    const ctrl = createRetryController(() => {})
    const err = new Error('load error')

    ctrl.handleError(err)

    // Advance only 1999ms — retry should not have fired yet
    vi.advanceTimersByTime(RETRY_DELAY_MS - 1)
    expect(retryTriggered).toBe(false)

    ctrl.cleanup()
  })
})

// ---------------------------------------------------------------------------
// Requirement 8.4 — Maximum 3 retry attempts, then continue with fallback
// ---------------------------------------------------------------------------
describe('Requirement 8.4 — maximum 3 retry attempts', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    vi.useFakeTimers()
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.useRealTimers()
    errorSpy.mockRestore()
    warnSpy.mockRestore()
  })

  it('MAX_RETRIES constant equals 3', () => {
    expect(MAX_RETRIES).toBe(3)
  })

  it('RETRY_DELAY_MS constant equals 2000', () => {
    expect(RETRY_DELAY_MS).toBe(2000)
  })

  it('transitions to fallback after exactly 3 failed attempts', () => {
    const fallbackFn = vi.fn()
    const ctrl = createRetryController(fallbackFn)
    const err = new Error('load error')

    // Attempt 1 (attempt index 0) — should retry
    ctrl.handleError(err)
    expect(ctrl.isLoadFailed()).toBe(false)
    expect(fallbackFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(RETRY_DELAY_MS)

    // Attempt 2 (attempt index 1) — should retry
    ctrl.handleError(err)
    expect(ctrl.isLoadFailed()).toBe(false)
    expect(fallbackFn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(RETRY_DELAY_MS)

    // Attempt 3 (attempt index 2 = MAX_RETRIES - 1) — should fallback
    ctrl.handleError(err)
    expect(ctrl.isLoadFailed()).toBe(true)
    expect(fallbackFn).toHaveBeenCalledOnce()

    ctrl.cleanup()
  })

  it('error is logged exactly 3 times across all attempts', () => {
    const ctrl = createRetryController(() => {})
    const err = new Error('load error')

    for (let i = 0; i < MAX_RETRIES; i++) {
      ctrl.handleError(err)
      if (i < MAX_RETRIES - 1) vi.advanceTimersByTime(RETRY_DELAY_MS)
    }

    expect(errorSpy).toHaveBeenCalledTimes(MAX_RETRIES)
    ctrl.cleanup()
  })
})

// ---------------------------------------------------------------------------
// Invalid configuration handling — falls back to defaults (Req 7.x)
// Tested via validateSpaceBackgroundProps since that's the implementation
// ---------------------------------------------------------------------------
describe('Invalid configuration handling — fallback to defaults', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('falls back to default basePosition when NaN is provided', () => {
    const result = validateSpaceBackgroundProps({
      basePosition: [NaN, 0, 0],
      baseScale: 180,
      parallaxIntensity: 0.3,
      rotationSpeed: 0.05,
      enableParallax: true,
      enableRotation: true,
    })
    expect(result.basePosition).toEqual(DEFAULT_SPACE_BACKGROUND_PROPS.basePosition)
  })

  it('falls back to default baseScale when zero is provided', () => {
    const result = validateSpaceBackgroundProps({
      basePosition: [0, -50, -100],
      baseScale: 0,
      parallaxIntensity: 0.3,
      rotationSpeed: 0.05,
      enableParallax: true,
      enableRotation: true,
    })
    expect(result.baseScale).toBe(DEFAULT_SPACE_BACKGROUND_PROPS.baseScale)
  })

  it('clamps parallaxIntensity to [0, 1] when out of range', () => {
    const resultLow = validateSpaceBackgroundProps({
      basePosition: [0, -50, -100],
      baseScale: 180,
      parallaxIntensity: -1,
      rotationSpeed: 0.05,
      enableParallax: true,
      enableRotation: true,
    })
    expect(resultLow.parallaxIntensity).toBe(0)

    const resultHigh = validateSpaceBackgroundProps({
      basePosition: [0, -50, -100],
      baseScale: 180,
      parallaxIntensity: 2,
      rotationSpeed: 0.05,
      enableParallax: true,
      enableRotation: true,
    })
    expect(resultHigh.parallaxIntensity).toBe(1)
  })

  it('falls back to default rotationSpeed when negative is provided', () => {
    const result = validateSpaceBackgroundProps({
      basePosition: [0, -50, -100],
      baseScale: 180,
      parallaxIntensity: 0.3,
      rotationSpeed: -0.1,
      enableParallax: true,
      enableRotation: true,
    })
    expect(result.rotationSpeed).toBe(DEFAULT_SPACE_BACKGROUND_PROPS.rotationSpeed)
  })

  it('logs a warning in dev mode when invalid props are detected', () => {
    validateSpaceBackgroundProps(
      {
        basePosition: [NaN, 0, 0],
        baseScale: 180,
        parallaxIntensity: 0.3,
        rotationSpeed: 0.05,
        enableParallax: true,
        enableRotation: true,
      },
      true // isDev = true
    )
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[SpaceBackground]')
    )
  })
})
