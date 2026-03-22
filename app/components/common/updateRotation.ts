/**
 * Calculates the updated rotation values after one animation frame.
 *
 * - Y-axis increments by rotationSpeed × delta (Requirement 4.1)
 * - X-axis increments by (rotationSpeed × 0.5) × delta (Requirement 4.2)
 * - Z-axis is unchanged
 *
 * @param currentRotation - Current rotation in radians for each axis
 * @param rotationSpeed   - Positive rotation speed value
 * @param delta           - Frame time delta in seconds (positive)
 * @returns Updated rotation object
 */
export function updateRotation(
  currentRotation: { x: number; y: number; z: number },
  rotationSpeed: number,
  delta: number
): { x: number; y: number; z: number } {
  return {
    x: currentRotation.x + rotationSpeed * 0.5 * delta,
    y: currentRotation.y + rotationSpeed * delta,
    z: currentRotation.z,
  }
}
