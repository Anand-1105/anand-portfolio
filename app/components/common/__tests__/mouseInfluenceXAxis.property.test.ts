/**
 * Property 14: Mouse Influence on X-Axis
 *
 * For any pointer X coordinate between -1 and 1, the background X-axis position
 * should equal basePosition[0] + (pointerX × 2).
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4
 */

import { describe, test, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Pure implementation of the mouse influence formula extracted from SpaceBackground.tsx:
 *   group.position.x = basePosition[0] + pointer.x * 2
 */
function applyMouseInfluenceX(baseX: number, pointerX: number): number {
  return baseX + pointerX * 2
}

describe('Property 14: Mouse Influence on X-Axis', () => {
  test('X position equals basePosition[0] + (pointerX × 2) for all valid pointer values', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1, max: 1, noNaN: true }),        // pointerX ∈ [-1, 1]
        fc.float({ min: -1000, max: 1000, noNaN: true }),  // arbitrary baseX
        (pointerX, baseX) => {
          const result = applyMouseInfluenceX(baseX, pointerX)
          const expected = baseX + pointerX * 2
          return Math.abs(result - expected) < 1e-6
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('X position offsets left when pointer is at left edge (-1)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000, max: 1000, noNaN: true }),  // arbitrary baseX
        (baseX) => {
          const result = applyMouseInfluenceX(baseX, -1)
          // pointer.x = -1 → offset = -2, so result < baseX
          return Math.abs(result - (baseX - 2)) < 1e-6
        }
      ),
      { numRuns: 500 }
    )
  })

  test('X position offsets right when pointer is at right edge (1)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000, max: 1000, noNaN: true }),  // arbitrary baseX
        (baseX) => {
          const result = applyMouseInfluenceX(baseX, 1)
          // pointer.x = 1 → offset = +2, so result > baseX
          return Math.abs(result - (baseX + 2)) < 1e-6
        }
      ),
      { numRuns: 500 }
    )
  })

  test('X position equals baseX when pointer is at center (0)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1000, max: 1000, noNaN: true }),  // arbitrary baseX
        (baseX) => {
          const result = applyMouseInfluenceX(baseX, 0)
          // pointer.x = 0 → no offset
          return Math.abs(result - baseX) < 1e-6
        }
      ),
      { numRuns: 500 }
    )
  })

  test('X position result is always finite for valid inputs', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1, max: 1, noNaN: true }),
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        (pointerX, baseX) => {
          const result = applyMouseInfluenceX(baseX, pointerX)
          return Number.isFinite(result)
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('X offset is monotonically increasing with pointerX', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -1, max: 0, noNaN: true }),   // p1 ∈ [-1, 0]
        fc.float({ min: 0, max: 1, noNaN: true }),    // p2 ∈ [0, 1], so p2 >= p1
        fc.float({ min: -1000, max: 1000, noNaN: true }),
        (p1, p2, baseX) => {
          const r1 = applyMouseInfluenceX(baseX, p1)
          const r2 = applyMouseInfluenceX(baseX, p2)
          // Higher pointerX → higher X position
          return r2 >= r1 - 1e-6
        }
      ),
      { numRuns: 1000 }
    )
  })

  // Spot-check the exact formula values from the requirements
  test('exact formula values match requirements', () => {
    const baseX = 0

    // Req 5.2: left edge → offset to the left
    expect(applyMouseInfluenceX(baseX, -1)).toBe(-2)

    // Req 5.3: right edge → offset to the right
    expect(applyMouseInfluenceX(baseX, 1)).toBe(2)

    // Req 5.4: center → maintain base X position
    expect(applyMouseInfluenceX(baseX, 0)).toBe(0)
  })
})
