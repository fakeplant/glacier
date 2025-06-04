import React, { useMemo, useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ParsedFixture } from '../../lib/fixtures'

interface FixtureRendererProps {
  fixture: ParsedFixture
  highlighted?: boolean
  showLabels?: boolean
  showMeta?: boolean
  hideUnhighlighted?: boolean
  depth?: number
  selectedTags?: string[]
  selectedFixtures?: ParsedFixture[]
  onSelect?: (fixture: ParsedFixture) => void
}

function FixtureRenderer({ 
  fixture, 
  highlighted = false,
  showLabels = false, 
  showMeta = false,
  hideUnhighlighted = false,
  depth = 0, 
  selectedTags = [], 
  selectedFixtures = [],
  onSelect 
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
      
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    }
    
    const bbox = new THREE.Box3()
    if (fixture.points.length > 0) {
      bbox.setFromPoints(fixture.points)
    }
    
    return { geometry: geom, boundingBox: bbox }
  }, [fixture.points])

    // Check if this fixture should show points based on highlighting and hideUnhighlighted setting
  const shouldShowPoints = useMemo(() => {
    // If hideUnhighlighted is enabled, only show highlighted fixtures
    if (hideUnhighlighted && !highlighted) {
      return false
    }
    
    // If no filters are active, show all points
    if (selectedTags.length === 0 && selectedFixtures.length === 0) {
      return true
    }

    // Check if this fixture matches tags or is in selectedFixtures
    const matchesTags = selectedTags.some((tag) => fixture.tags.includes(tag))
    const matchesFixtures = selectedFixtures.some(f => f.label === fixture.label)
    
    return matchesTags || matchesFixtures
  }, [fixture.tags, fixture.label, selectedTags, selectedFixtures, highlighted, hideUnhighlighted])

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
    let color = '#00ff00'
    if (highlighted) color = '#ffff00'
    else if (hovered) color = '#ff8800'
    
    return new THREE.PointsMaterial({ 
      color, 
      size: highlighted ? 3 : 2, 
      sizeAttenuation: false,
      transparent: true,
      opacity: shouldShowPoints ? 1 : 0
    })
  }, [highlighted, hovered, shouldShowPoints])

  const boxMaterial = useMemo(() => {
    let color = '#ffffff'
    if (highlighted) color = '#ffff00'
    else if (hovered) color = '#ff8800'
    
    const baseOpacity = highlighted ? 0.8 : 0.3
    
    return new THREE.MeshBasicMaterial({ 
      color, 
      wireframe: true,
      transparent: true,
      opacity: shouldShowPoints ? baseOpacity : 0
    })
  }, [highlighted, hovered, shouldShowPoints])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (onSelect && showMeta) {
      onSelect(fixture)
    }
  }

  const labelPosition = useMemo(() => {
    if (boundingBox.isEmpty()) return [0, 0, 0] as [number, number, number]
    
    const center = boundingBox.getCenter(new THREE.Vector3())
    const size = boundingBox.getSize(new THREE.Vector3())
    
    return [center.x, center.y + size.y / 2 + 2, center.z] as [number, number, number]
  }, [boundingBox])

  // Check if we should allow meta labeling
  const shouldShowMeta = depth === 1

  return (
    <group onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          
          >
      {/* Points */}
      {fixture.points.length > 0 && (
        <points
          ref={pointsRef}
          geometry={geometry}
          material={pointMaterial}
          onClick={handleClick}
          
        />
      )}
      
      {/* Bounding box */}
      {shouldShowMeta && boundingBoxGeometry && (
        <mesh
          geometry={boundingBoxGeometry}
          material={boxMaterial}
          onClick={handleClick}
          // onPointerEnter={() => setHovered(true)}
          // onPointerLeave={() => setHovered(false)}
        />
      )}
      
      {/* Label */}
      {shouldShowMeta && showLabels && (
        <Html position={labelPosition} center>
          <div style={{
            color: highlighted ? '#ffff00' : '#ffffff',
            fontSize: '12px',
            fontFamily: 'monospace',
            textAlign: 'center',
            pointerEvents: 'none',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            textWrap: 'nowrap',
            opacity: shouldShowPoints ? 1 : 0,
          }}>
            {fixture.label}
          </div>
        </Html>
      )}
      
      {/* Render children */}
      {fixture.children.map((child, index) => (
        <FixtureRenderer
          key={`${child.label}-${index}`}
          fixture={child}
          highlighted={highlighted}
          showLabels={showLabels}
          showMeta={showMeta}
          hideUnhighlighted={hideUnhighlighted}
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