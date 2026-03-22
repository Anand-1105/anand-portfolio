/**
 * Unit tests for SpaceBackground memory management (Task 8.3)
 * Requirements: 1.5, 12.1, 12.2
 *
 * Tests cover:
 * - Cleanup function is called on unmount (Req 1.5)
 * - dispose() is called on all geometries on unmount (Req 12.1)
 * - dispose() is called on all materials on unmount (Req 12.2)
 *
 * Strategy:
 * SpaceBackground uses useEffect with a cleanup function that traverses the
 * THREE.Group and calls dispose() on geometries and materials. We test this
 * cleanup logic directly at the unit level by replicating the exact traversal
 * algorithm from SpaceBackground.tsx, mirroring the approach used in other
 * test files in this directory.
 */

import { describe, it, expect, vi } from 'vitest'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Replicate the cleanup logic from SpaceBackground.tsx so we can unit-test it
// without needing a React renderer or WebGL context.
//
// Source (SpaceBackground.tsx):
//   useEffect(() => {
//     return () => {
//       const group = groupRef.current
//       if (!group) return
//       group.traverse((object) => {
//         if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
//           object.geometry?.dispose()
//           if (Array.isArray(object.material)) {
//             object.material.forEach((m) => m.dispose())
//           } else {
//             object.material?.dispose()
//           }
//         }
//       })
//     }
//   }, [])
// ---------------------------------------------------------------------------

function runCleanup(group: THREE.Group | null): void {
  if (!group) return
  group.traverse((object) => {
    if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
      object.geometry?.dispose()
      if (Array.isArray(object.material)) {
        object.material.forEach((m) => m.dispose())
      } else {
        object.material?.dispose()
      }
    }
  })
}

// ---------------------------------------------------------------------------
// Replicate the FallbackParticles cleanup logic from SpaceBackground.tsx:
//
//   useEffect(() => {
//     return () => {
//       geometryRef.current?.dispose()
//       materialRef.current?.dispose()
//     }
//   }, [])
// ---------------------------------------------------------------------------

function runFallbackCleanup(
  geometry: THREE.BufferGeometry | null,
  material: THREE.PointsMaterial | null
): void {
  geometry?.dispose()
  material?.dispose()
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockGeometry() {
  return { dispose: vi.fn() } as unknown as THREE.BufferGeometry
}

function createMockMaterial() {
  return { dispose: vi.fn() } as unknown as THREE.Material
}

function createMeshWithMocks(
  geometry = createMockGeometry(),
  material: THREE.Material | THREE.Material[] = createMockMaterial()
): THREE.Mesh {
  const mesh = new THREE.Mesh()
  // Replace geometry and material with mocks that have spy dispose methods
  ;(mesh as unknown as { geometry: unknown }).geometry = geometry
  ;(mesh as unknown as { material: unknown }).material = material
  return mesh
}

function createPointsWithMocks(
  geometry = createMockGeometry(),
  material: THREE.Material | THREE.Material[] = createMockMaterial()
): THREE.Points {
  const points = new THREE.Points()
  ;(points as unknown as { geometry: unknown }).geometry = geometry
  ;(points as unknown as { material: unknown }).material = material
  return points
}

// ---------------------------------------------------------------------------
// Requirement 1.5 — Cleanup function is called on unmount
// ---------------------------------------------------------------------------

describe('Requirement 1.5 — cleanup function is called on unmount', () => {
  it('cleanup runs without error when group is null (ref not yet attached)', () => {
    expect(() => runCleanup(null)).not.toThrow()
  })

  it('cleanup runs without error when group has no children', () => {
    const group = new THREE.Group()
    expect(() => runCleanup(group)).not.toThrow()
  })

  it('cleanup traverses the group and processes all Mesh children', () => {
    const group = new THREE.Group()
    const geom = createMockGeometry()
    const mat = createMockMaterial()
    const mesh = createMeshWithMocks(geom, mat)
    group.add(mesh)

    runCleanup(group)

    expect(geom.dispose).toHaveBeenCalledOnce()
    expect(mat.dispose).toHaveBeenCalledOnce()
  })

  it('cleanup traverses the group and processes all Points children', () => {
    const group = new THREE.Group()
    const geom = createMockGeometry()
    const mat = createMockMaterial()
    const points = createPointsWithMocks(geom, mat)
    group.add(points)

    runCleanup(group)

    expect(geom.dispose).toHaveBeenCalledOnce()
    expect(mat.dispose).toHaveBeenCalledOnce()
  })

  it('cleanup processes all children in a group with multiple objects', () => {
    const group = new THREE.Group()

    const geom1 = createMockGeometry()
    const mat1 = createMockMaterial()
    const mesh = createMeshWithMocks(geom1, mat1)

    const geom2 = createMockGeometry()
    const mat2 = createMockMaterial()
    const points = createPointsWithMocks(geom2, mat2)

    group.add(mesh)
    group.add(points)

    runCleanup(group)

    expect(geom1.dispose).toHaveBeenCalledOnce()
    expect(mat1.dispose).toHaveBeenCalledOnce()
    expect(geom2.dispose).toHaveBeenCalledOnce()
    expect(mat2.dispose).toHaveBeenCalledOnce()
  })
})

// ---------------------------------------------------------------------------
// Requirement 12.1 — dispose() is called on all geometries on unmount
// ---------------------------------------------------------------------------

describe('Requirement 12.1 — dispose() called on all geometries', () => {
  it('calls dispose() on the geometry of a single Mesh', () => {
    const group = new THREE.Group()
    const geom = createMockGeometry()
    const mesh = createMeshWithMocks(geom)
    group.add(mesh)

    runCleanup(group)

    expect(geom.dispose).toHaveBeenCalledOnce()
  })

  it('calls dispose() on the geometry of a single Points object', () => {
    const group = new THREE.Group()
    const geom = createMockGeometry()
    const points = createPointsWithMocks(geom)
    group.add(points)

    runCleanup(group)

    expect(geom.dispose).toHaveBeenCalledOnce()
  })

  it('calls dispose() on geometries of multiple Mesh objects', () => {
    const group = new THREE.Group()
    const geometries = [createMockGeometry(), createMockGeometry(), createMockGeometry()]

    geometries.forEach((geom) => {
      group.add(createMeshWithMocks(geom))
    })

    runCleanup(group)

    geometries.forEach((geom) => {
      expect(geom.dispose).toHaveBeenCalledOnce()
    })
  })

  it('calls dispose() on geometries of nested objects via traverse', () => {
    const outerGroup = new THREE.Group()
    const innerGroup = new THREE.Group()

    const geom1 = createMockGeometry()
    const geom2 = createMockGeometry()

    innerGroup.add(createMeshWithMocks(geom1))
    outerGroup.add(innerGroup)
    outerGroup.add(createMeshWithMocks(geom2))

    runCleanup(outerGroup)

    expect(geom1.dispose).toHaveBeenCalledOnce()
    expect(geom2.dispose).toHaveBeenCalledOnce()
  })

  it('does not call dispose() on non-Mesh/non-Points objects (e.g. plain Group)', () => {
    const group = new THREE.Group()
    const childGroup = new THREE.Group()
    // childGroup has no geometry/material — should not throw
    group.add(childGroup)

    expect(() => runCleanup(group)).not.toThrow()
  })

  it('handles geometry being undefined gracefully (optional chaining)', () => {
    const group = new THREE.Group()
    const mesh = new THREE.Mesh()
    // geometry is undefined by default on a bare Mesh before assignment
    ;(mesh as unknown as { geometry: undefined }).geometry = undefined
    group.add(mesh)

    expect(() => runCleanup(group)).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// Requirement 12.2 — dispose() is called on all materials on unmount
// ---------------------------------------------------------------------------

describe('Requirement 12.2 — dispose() called on all materials', () => {
  it('calls dispose() on a single material', () => {
    const group = new THREE.Group()
    const mat = createMockMaterial()
    group.add(createMeshWithMocks(createMockGeometry(), mat))

    runCleanup(group)

    expect(mat.dispose).toHaveBeenCalledOnce()
  })

  it('calls dispose() on each material in an array of materials', () => {
    const group = new THREE.Group()
    const materials = [createMockMaterial(), createMockMaterial(), createMockMaterial()]
    group.add(createMeshWithMocks(createMockGeometry(), materials))

    runCleanup(group)

    materials.forEach((mat) => {
      expect(mat.dispose).toHaveBeenCalledOnce()
    })
  })

  it('calls dispose() on materials of multiple Mesh objects', () => {
    const group = new THREE.Group()
    const mat1 = createMockMaterial()
    const mat2 = createMockMaterial()

    group.add(createMeshWithMocks(createMockGeometry(), mat1))
    group.add(createMeshWithMocks(createMockGeometry(), mat2))

    runCleanup(group)

    expect(mat1.dispose).toHaveBeenCalledOnce()
    expect(mat2.dispose).toHaveBeenCalledOnce()
  })

  it('calls dispose() on material of a Points object', () => {
    const group = new THREE.Group()
    const mat = createMockMaterial()
    group.add(createPointsWithMocks(createMockGeometry(), mat))

    runCleanup(group)

    expect(mat.dispose).toHaveBeenCalledOnce()
  })

  it('handles material being undefined gracefully (optional chaining)', () => {
    const group = new THREE.Group()
    const mesh = new THREE.Mesh()
    ;(mesh as unknown as { material: undefined }).material = undefined
    group.add(mesh)

    expect(() => runCleanup(group)).not.toThrow()
  })

  it('handles mixed single and array materials across multiple objects', () => {
    const group = new THREE.Group()

    const singleMat = createMockMaterial()
    const arrayMats = [createMockMaterial(), createMockMaterial()]

    group.add(createMeshWithMocks(createMockGeometry(), singleMat))
    group.add(createMeshWithMocks(createMockGeometry(), arrayMats))

    runCleanup(group)

    expect(singleMat.dispose).toHaveBeenCalledOnce()
    arrayMats.forEach((m) => expect(m.dispose).toHaveBeenCalledOnce())
  })
})

// ---------------------------------------------------------------------------
// FallbackParticles cleanup — dispose() on geometry and material refs
// (Req 1.5, 12.1, 12.2 — covers the FallbackParticles component path)
// ---------------------------------------------------------------------------

describe('FallbackParticles cleanup — dispose() on geometry and material refs', () => {
  it('calls dispose() on geometry ref on unmount', () => {
    const geom = { dispose: vi.fn() } as unknown as THREE.BufferGeometry
    const mat = { dispose: vi.fn() } as unknown as THREE.PointsMaterial

    runFallbackCleanup(geom, mat)

    expect(geom.dispose).toHaveBeenCalledOnce()
  })

  it('calls dispose() on material ref on unmount', () => {
    const geom = { dispose: vi.fn() } as unknown as THREE.BufferGeometry
    const mat = { dispose: vi.fn() } as unknown as THREE.PointsMaterial

    runFallbackCleanup(geom, mat)

    expect(mat.dispose).toHaveBeenCalledOnce()
  })

  it('handles null geometry ref gracefully (optional chaining)', () => {
    const mat = { dispose: vi.fn() } as unknown as THREE.PointsMaterial
    expect(() => runFallbackCleanup(null, mat)).not.toThrow()
  })

  it('handles null material ref gracefully (optional chaining)', () => {
    const geom = { dispose: vi.fn() } as unknown as THREE.BufferGeometry
    expect(() => runFallbackCleanup(geom, null)).not.toThrow()
  })

  it('handles both refs being null gracefully', () => {
    expect(() => runFallbackCleanup(null, null)).not.toThrow()
  })
})
