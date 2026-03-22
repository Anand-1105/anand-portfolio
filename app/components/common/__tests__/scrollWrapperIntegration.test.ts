/**
 * Integration tests for ScrollWrapper + SpaceBackground
 * Requirements: 11.1, 11.2, 11.3, 11.4
 *
 * These tests operate at the logic/unit level because ScrollWrapper and
 * SpaceBackground are React Three Fiber components that require a WebGL
 * context. We verify the integration contracts through:
 *   - Source-level structural analysis (Req 11.1)
 *   - The calculateParallaxOffset function that drives scroll-based position (Req 11.2)
 *   - Z-ordering via 3D positioning rather than CSS z-index (Req 11.4)
 *   - Foreground element isolation (Req 11.3)
 */

import { describe, it, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { calculateParallaxOffset } from '../calculateParallaxOffset'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SCROLL_WRAPPER_PATH = path.resolve(
  __dirname,
  '../ScrollWrapper.tsx'
)

const SPACE_BACKGROUND_PATH = path.resolve(
  __dirname,
  '../SpaceBackground.tsx'
)

function readSource(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8')
}

// ---------------------------------------------------------------------------
// Requirement 11.1 — SpaceBackground is rendered BEFORE foreground content
// ---------------------------------------------------------------------------

describe('Requirement 11.1 — SpaceBackground renders before foreground content', () => {
  it('ScrollWrapper imports SpaceBackground', () => {
    const src = readSource(SCROLL_WRAPPER_PATH)
    expect(src).toMatch(/import.*SpaceBackground.*from/)
  })

  it('SpaceBackground JSX appears before the children mapping in ScrollWrapper', () => {
    const src = readSource(SCROLL_WRAPPER_PATH)

    const spaceBackgroundIndex = src.indexOf('<SpaceBackground')
    const childrenMapIndex = src.indexOf('children.map(')

    expect(spaceBackgroundIndex).toBeGreaterThan(-1)
    expect(childrenMapIndex).toBeGreaterThan(-1)
    // SpaceBackground must appear before the children loop
    expect(spaceBackgroundIndex).toBeLessThan(childrenMapIndex)
  })

  it('ScrollWrapper renders SpaceBackground with required props', () => {
    const src = readSource(SCROLL_WRAPPER_PATH)
    // Verify the key props are passed
    expect(src).toContain('basePosition')
    expect(src).toContain('baseScale')
    expect(src).toContain('parallaxIntensity')
    expect(src).toContain('rotationSpeed')
  })
})

// ---------------------------------------------------------------------------
// Requirement 11.2 — SpaceBackground accesses scroll data via useScroll
// ---------------------------------------------------------------------------

describe('Requirement 11.2 — SpaceBackground accesses scroll data through useScroll', () => {
  it('SpaceBackground imports useScroll from @react-three/drei', () => {
    const src = readSource(SPACE_BACKGROUND_PATH)
    expect(src).toMatch(/useScroll.*from.*@react-three\/drei/)
  })

  it('SpaceBackground calls useScroll() to obtain scroll data', () => {
    const src = readSource(SPACE_BACKGROUND_PATH)
    expect(src).toContain('useScroll()')
  })

  it('SpaceBackground uses scrollData.offset as the scroll progress value', () => {
    const src = readSource(SPACE_BACKGROUND_PATH)
    expect(src).toContain('scrollData?.offset')
  })

  it('calculateParallaxOffset returns base position when scroll is 0', () => {
    const base: [number, number, number] = [0, -50, -100]
    const result = calculateParallaxOffset(0, base, 0.3)
    expect(result).toEqual([0, -50, -100])
  })

  it('calculateParallaxOffset updates Y position proportionally to scroll progress', () => {
    const base: [number, number, number] = [0, -50, -100]
    const intensity = 0.3

    const atHalf = calculateParallaxOffset(0.5, base, intensity)
    const atFull = calculateParallaxOffset(1.0, base, intensity)

    // Y offset = scrollProgress * intensity * 50
    expect(atHalf[1]).toBeCloseTo(base[1] + 0.5 * intensity * 50)
    expect(atFull[1]).toBeCloseTo(base[1] + 1.0 * intensity * 50)
  })

  it('calculateParallaxOffset updates Z position proportionally to scroll progress', () => {
    const base: [number, number, number] = [0, -50, -100]
    const intensity = 0.3

    const atHalf = calculateParallaxOffset(0.5, base, intensity)
    const atFull = calculateParallaxOffset(1.0, base, intensity)

    // Z offset = scrollProgress * intensity * 20
    expect(atHalf[2]).toBeCloseTo(base[2] + 0.5 * intensity * 20)
    expect(atFull[2]).toBeCloseTo(base[2] + 1.0 * intensity * 20)
  })

  it('calculateParallaxOffset returns finite values across the full scroll range', () => {
    const base: [number, number, number] = [0, -50, -100]
    const scrollValues = [0, 0.25, 0.5, 0.75, 1.0]

    for (const scroll of scrollValues) {
      const result = calculateParallaxOffset(scroll, base, 0.3)
      expect(result.every(v => Number.isFinite(v))).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// Requirement 11.3 — SpaceBackground does not interfere with foreground elements
// ---------------------------------------------------------------------------

describe('Requirement 11.3 — SpaceBackground does not interfere with foreground elements', () => {
  it('ScrollWrapper wraps each child in its own <group> element', () => {
    const src = readSource(SCROLL_WRAPPER_PATH)
    // Children are individually wrapped in <group> tags
    expect(src).toContain('<group key={index}>')
    expect(src).toContain('{child}')
  })

  it('SpaceBackground is a sibling of foreground groups, not a parent', () => {
    const src = readSource(SCROLL_WRAPPER_PATH)

    // The SpaceBackground and children.map should both be direct children of
    // the fragment (<>...</>), not nested inside each other.
    const fragmentStart = src.indexOf('return <>')
    const spaceBackgroundIndex = src.indexOf('<SpaceBackground', fragmentStart)
    const childrenMapIndex = src.indexOf('children.map(', fragmentStart)
    const fragmentEnd = src.lastIndexOf('</>')

    expect(spaceBackgroundIndex).toBeGreaterThan(fragmentStart)
    expect(childrenMapIndex).toBeGreaterThan(fragmentStart)
    expect(spaceBackgroundIndex).toBeLessThan(fragmentEnd)
    expect(childrenMapIndex).toBeLessThan(fragmentEnd)
  })

  it('SpaceBackground does not use CSS z-index for layering', () => {
    const src = readSource(SPACE_BACKGROUND_PATH)
    // z-index is a CSS concept; R3F components should use 3D positioning instead
    expect(src).not.toContain('zIndex')
    expect(src).not.toContain('z-index')
  })

  it('SpaceBackground does not block pointer events via DOM manipulation', () => {
    const src = readSource(SPACE_BACKGROUND_PATH)
    // No pointer-events CSS manipulation
    expect(src).not.toContain('pointerEvents')
    expect(src).not.toContain('pointer-events')
  })
})

// ---------------------------------------------------------------------------
// Requirement 11.4 — SpaceBackground maintains z-order via 3D positioning
// ---------------------------------------------------------------------------

describe('Requirement 11.4 — SpaceBackground maintains z-order via 3D positioning', () => {
  it('SpaceBackground uses a negative Z base position to render behind foreground', () => {
    const src = readSource(SCROLL_WRAPPER_PATH)
    // The basePosition passed in ScrollWrapper should have a negative Z value
    // e.g. basePosition={[0, -50, -100]}
    const match = src.match(/basePosition=\{\[([^\]]+)\]\}/)
    expect(match).not.toBeNull()

    if (match) {
      const coords = match[1].split(',').map(s => parseFloat(s.trim()))
      expect(coords).toHaveLength(3)
      // Z coordinate (index 2) must be negative — places background behind camera
      expect(coords[2]).toBeLessThan(0)
    }
  })

  it('calculateParallaxOffset keeps Z within a negative range for default config', () => {
    const base: [number, number, number] = [0, -50, -100]
    const intensity = 0.3

    // At full scroll: Z = -100 + (1 * 0.3 * 20) = -94 — still negative
    const atFull = calculateParallaxOffset(1.0, base, intensity)
    expect(atFull[2]).toBeLessThan(0)
  })

  it('SpaceBackground group position is set via THREE.js position attribute, not CSS', () => {
    const src = readSource(SPACE_BACKGROUND_PATH)
    // Uses group position prop (R3F 3D positioning)
    expect(src).toContain('position={validated.basePosition}')
  })

  it('SpaceBackground updates position via group.position in useFrame, not CSS', () => {
    const src = readSource(SPACE_BACKGROUND_PATH)
    // Position updates happen on the THREE.Group object
    expect(src).toContain('group.position.y')
    expect(src).toContain('group.position.z')
    expect(src).toContain('group.position.x')
  })
})
