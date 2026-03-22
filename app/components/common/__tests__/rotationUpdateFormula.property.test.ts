/**
 * Property 10: Rotation Update Formula
 *
 * For any rotation speed and frame delta, when rotation is enabled, the
 * Y-axis rotation should increment by rotationSpeed × delta, and the
 * X-axis rotation should increment by (rotationSpeed × 0.5) × delta.
 * Z-axis rotation remains unchanged.
 *
 * **Validates: Requirements 4.1, 4.2**
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { updateRotation } from '../updateRotation'

describe('Property 10: Rotation Update Formula', () => {
  test('Y-axis rotation increments by rotationSpeed × delta', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-1000), max: Math.fround(1000), noNaN: true }), // currentRotation.y
        fc.float({ min: Math.fround(0.001), max: Math.fround(1), noNaN: true }),    // rotationSpeed (positive)
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true }),  // delta (positive)
        (currentY, rotationSpeed, delta) => {
          const current = { x: 0, y: currentY, z: 0 }
          const result = updateRotation(current, rotationSpeed, delta)
          const expectedY = currentY + rotationSpeed * delta
          return Math.abs(result.y - expectedY) < 1e-5
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('X-axis rotation increments by (rotationSpeed × 0.5) × delta', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-1000), max: Math.fround(1000), noNaN: true }), // currentRotation.x
        fc.float({ min: Math.fround(0.001), max: Math.fround(1), noNaN: true }),    // rotationSpeed (positive)
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true }),  // delta (positive)
        (currentX, rotationSpeed, delta) => {
          const current = { x: currentX, y: 0, z: 0 }
          const result = updateRotation(current, rotationSpeed, delta)
          const expectedX = currentX + rotationSpeed * 0.5 * delta
          return Math.abs(result.x - expectedX) < 1e-5
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('Z-axis rotation remains unchanged', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(-1000), max: Math.fround(1000), noNaN: true }), // currentRotation.z
        fc.float({ min: Math.fround(0.001), max: Math.fround(1), noNaN: true }),    // rotationSpeed
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true }),  // delta
        (currentZ, rotationSpeed, delta) => {
          const current = { x: 0, y: 0, z: currentZ }
          const result = updateRotation(current, rotationSpeed, delta)
          return result.z === currentZ
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('Y-axis increment is exactly twice the X-axis increment', () => {
    fc.assert(
      fc.property(
        fc.record({
          x: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
          y: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
          z: fc.float({ min: Math.fround(-100), max: Math.fround(100), noNaN: true }),
        }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(1), noNaN: true }),   // rotationSpeed
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.1), noNaN: true }), // delta
        (current, rotationSpeed, delta) => {
          const result = updateRotation(current, rotationSpeed, delta)
          const deltaY = result.y - current.y
          const deltaX = result.x - current.x
          // Y increment should be exactly 2× the X increment
          return Math.abs(deltaY - 2 * deltaX) < 1e-5
        }
      ),
      { numRuns: 1000 }
    )
  })
})
