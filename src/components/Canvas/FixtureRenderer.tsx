import React, { useMemo, useRef, useState } from "react"
import { useFrame, ThreeEvent, extend } from "@react-three/fiber"
import * as THREE from "three"
import { Text } from "troika-three-text"
import { ParsedFixture } from "../../lib/fixtures"
import { Billboard } from "@react-three/drei"

// Extend R3F to include troika text
extend({ Text })

// TypeScript declarations
declare module "troika-three-text" {
  export class Text extends THREE.Mesh {
    text: string
    fontSize: number
    color: string | number
    anchorX: string | number
    anchorY: string | number
    outlineWidth: number
    outlineColor: string | number
    constructor()
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      text: {
        position?: [number, number, number]
        text?: string
        fontSize?: number
        color?: string | number
        anchorX?: string | number
        anchorY?: string | number
        outlineWidth?: number
        outlineColor?: string | number
        onClick?: (event: any) => void
        [key: string]: any
      }
    }
  }
}

interface FixtureRendererProps {
  fixture: ParsedFixture
  selected?: boolean
  showLabels?: boolean
  showMeta?: boolean
  hideUnselected?: boolean
  depth?: number
  selectedTags?: string[]
  selectedFixtures?: ParsedFixture[]
  onSelect?: (fixture: ParsedFixture) => void
}

function FixtureRenderer({
  fixture,
  selected = false,
  showLabels = false,
  showMeta = false,
  hideUnselected = false,
  depth = 0,
  selectedTags = [],
  selectedFixtures = [],
  onSelect,
}: FixtureRendererProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const [hovered, setHovered] = useState(false)

  // Create geometry from points
  const { geometry, boundingBox } = useMemo(() => {
    const geom = new THREE.BufferGeometry()

    if (fixture.points.length > 0) {
      const positions = new Float32Array(fixture.points.length * 3)

      fixture.points.forEach((point, i) => {
        positions[i * 3] = point.x
        positions[i * 3 + 1] = point.y
        positions[i * 3 + 2] = point.z
      })

      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    }

    const bbox = new THREE.Box3()
    if (fixture.points.length > 0) {
      bbox.setFromPoints(fixture.points)
    }

    return { geometry: geom, boundingBox: bbox }
  }, [fixture.points])

  // Check if this fixture should show points based on selection and hideUnselected setting
  const shouldShowPoints = useMemo(() => {
    // If hideUnselected is enabled, only show selected fixtures
    if (hideUnselected && !selected) {
      return false
    }

    // If no filters are active, show all points
    if (selectedTags.length === 0 && selectedFixtures.length === 0) {
      return true
    }

    // Check if this fixture matches tags or is in selectedFixtures
    const matchesTags = selectedTags.some((tag) => fixture.tags.includes(tag))
    const matchesFixtures = selectedFixtures.some(
      (f) => f.label === fixture.label
    )

    return matchesTags || matchesFixtures
  }, [
    fixture.tags,
    fixture.label,
    selectedTags,
    selectedFixtures,
    selected,
    hideUnselected,
  ])

  // Create bounding box wireframe
  const boundingBoxGeometry = useMemo(() => {
    if (boundingBox.isEmpty()) return null

    const size = boundingBox.getSize(new THREE.Vector3())
    const center = boundingBox.getCenter(new THREE.Vector3())

    const boxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z)
    boxGeometry.translate(center.x, center.y, center.z)

    return boxGeometry
  }, [boundingBox])

  // Material colors
  const pointMaterial = useMemo(() => {
    let color = "#ffffff" // Green by default
    if (selected)
      color = "#ffffff" // Blue if selected
    else if (hovered) color = "#ffffff" // Orange if hovered

    return new THREE.PointsMaterial({
      color,
      size: selected ? 5 : 3,
      sizeAttenuation: false,
      transparent: true,
      opacity: shouldShowPoints ? 1 : 0,
      depthTest: true,
      depthWrite: true,
    })
  }, [selected, hovered, shouldShowPoints])

  const boxMaterial = useMemo(() => {
    let color = "#ffffff" // White by default
    if (selected)
      color = "#0000ff" // Blue if selected
    else if (hovered) color = "#ff8800" // Orange if hovered

    const baseOpacity = selected ? 0.8 : 0.3

    return new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
      transparent: true,
      opacity: shouldShowPoints ? baseOpacity : 0,
      depthTest: true,
      depthWrite: false, // Wireframes don't need to write depth
    })
  }, [selected, hovered, shouldShowPoints])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (onSelect && showMeta) {
      onSelect(fixture)
    }
  }

  const labelPosition = useMemo(() => {
    if (fixture.points.length === 0)
      return [0, 0, 0] as [number, number, number]

    // Use pre-calculated geometric center from fixture parsing
    const center = fixture.center

    // Add slight vertical offset for better visibility
    const size = boundingBox.getSize(new THREE.Vector3())
    return [center.x, center.y, center.z] as [number, number, number]
  }, [fixture.center, boundingBox])

  // Check if we should allow meta labeling
  const withMeta = depth === 1

  return (
    <group
    // onPointerOver={(e) => {
    //   e.stopPropagation()
    //   setHovered(true)
    // }}
    // onPointerOut={(e) => {
    //   e.stopPropagation()
    //   setHovered(false)
    // }}
    >
      {/* Points */}
      {fixture.points.length > 0 && (
        <points
          ref={pointsRef}
          geometry={geometry}
          material={pointMaterial}
          // onClick={handleClick}
          renderOrder={depth * 10 + 1} // Points render first within depth level
        />
      )}

      {/* Bounding box */}
      {withMeta && boundingBoxGeometry && (
        <mesh
          geometry={boundingBoxGeometry}
          material={boxMaterial}
          // onClick={handleClick}
          renderOrder={depth * 10 + 2} // Wireframes render after points
        />
      )}

      {/* Label */}
      {withMeta && showLabels && shouldShowPoints && (
        <Billboard
          position={labelPosition}
          renderOrder={depth * 10 + 3}
        >
          <text
            text={fixture.label}
            fontWeight={"bold"}
            fontSize={6}
            color={"#000000"}
            anchorX="center"
            anchorY="middle"
          />
        </Billboard>
      )}

      {/* Render children */}
      {fixture.children.map((child, index) => (
        <FixtureRenderer
          key={`${child.label}-${index}`}
          fixture={child}
          selected={selected}
          showLabels={showLabels}
          showMeta={showMeta}
          hideUnselected={hideUnselected}
          selectedTags={selectedTags}
          selectedFixtures={selectedFixtures}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </group>
  )
}

export default FixtureRenderer
