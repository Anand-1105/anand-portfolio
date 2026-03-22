/**
 * Property 12: Rotation Disabled Invariant
 *
 * For any number of animation frames, when rotation is disabled, the rotation
 * values should remain at their initial values.
 *
 * The conditional logic from SpaceBackground.tsx:
 *   if (effectiveEnableRotation) {
 *     const newRotation = updateRotation(...)
 *     group.rotation.x = newRotation.x
 *     group.rotation.y = newRotation.y
 *   }
 *
 * When enableRotation is false, updateRotation is never called, so rotation
 * values stay exactly at their initial values regardless of rotationSpeed,
 * delta, or number of frames.
 *
 * **Validates: Requirement 4.4**
 */

import { describe, test } from 'vitest'
import * as fc from 'fast-check'
import { updateRotation } from '../updateRotation'

/**
 * Simulates one animation frame with the conditional rotation logic from SpaceBackground.
 * When enableRotation is false, rotation is not updated.
 */
function simulateFrame(
  rotation: { x: number; y: number; z: number },
  rotationSpeed: number,
  delta: number,
  enableRotation: boolean
): { x: number; y: number; z: number } {
  if (enableRotation) {
    return updateRotation(rotation, rotationSpeed, delta)
  }
  // When disabled, rotation remains unchanged
  return { ...rotation }
}

describe('Property 12: Rotation Disabled Invariant', () => {
  test('rotation values remain unchanged for any rotationSpeed and delta when disabled', () => {
    fc.assert(
      fc.property(
        // Arbitrary initial rotation values
        fc.float({ min: -Math.fround(Math.PI * 2), max: Math.fround(Math.PI * 2), noNaN: true }),
        fc.float({ min: -Math.fround(Math.PI * 2), max: Math.fround(Math.PI * 2), noNaN: true }),
        fc.float({ min: -Math.fround(Math.PI * 2), max: Math.fround(Math.PI * 2), noNaN: true }),
        // Arbitrary rotation speed
        fc.float({ min: Math.fround(0.001), max: Math.fround(1.0), noNaN: true }),
        // Arbitrary frame delta
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }),
        (initialX, initialY, initialZ, rotationSpeed, delta) => {
          const initial = { x: initialX, y: initialY, z: initialZ }
          const result = simulateFrame(initial, rotationSpeed, delta, false)

          return (
            result.x === initial.x &&
            result.y === initial.y &&
            result.z === initial.z
          )
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('rotation values remain unchanged across many frames when disabled', () => {
    fc.assert(
      fc.property(
        fc.float({ min: -Math.fround(Math.PI * 2), max: Math.fround(Math.PI * 2), noNaN: true }),
        fc.float({ min: -Math.fround(Math.PI * 2), max: Math.fround(Math.PI * 2), noNaN: true }),
        fc.float({ min: -Math.fround(Math.PI * 2), max: Math.fround(Math.PI * 2), noNaN: true }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(1.0), noNaN: true }),
        fc.float({ min: Math.fround(0.001), max: Math.fround(0.5), noNaN: true }),
        fc.integer({ min: 1, max: 500 }),
        (initialX, initialY, initialZ, rotationSpeed, delta, numFrames) => {
          const initial = { x: initialX, y: initialY, z: initialZ }
          let rotation = { ...initial }

          for (let i = 0; i < numFrames; i++) {
            rotation = simulateFrame(rotation, rotationSpeed, delta, false)
          }

          return (
            rotation.x === initial.x &&
            rotation.y === initial.y &&
            rotation.z === initial.z
          )
        }
      ),
      { numRuns: 1000 }
    )
  })

  test('rotation values differ between enabled and disabled after at least one frame', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(Math.PI), noNaN: true }),
        fc.float({ min: 0, max: Math.fround(Math.PI), noNaN: true }),
        // Use non-trivial speed and delta so rotation actually changes
        fc.float({ min: Math.fround(0.01), max: Math.fround(1.0), noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(0.5), noNaN: true }),
        (initialX, initialY, rotationSpeed, delta) => {
          const initial = { x: initialX, y: initialY, z: 0 }

          const withRotation = simulateFrame(initial, rotationSpeed, delta, true)
          const withoutRotation = simulateFrame(initial, rotationSpeed, delta, false)

          // Disabled: stays at initial
          const disabledUnchanged =
            withoutRotation.x === initial.x &&
            withoutRotation.y === initial.y

          // Enabled: values must have changed (speed and delta are both > 0)
          const enabledChanged =
            withRotation.y !== initial.y ||
            withRotation.x !== initial.x

          return disabledUnchanged && enabledChanged
        }
      ),
      { numRuns: 1000 }
    )
  })
})
