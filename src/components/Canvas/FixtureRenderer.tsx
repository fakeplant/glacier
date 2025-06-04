import React, { useMemo, useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ParsedFixture } from '../../lib/fixtures'

interface FixtureRendererProps {
  fixture: ParsedFixture
  showLabels?: boolean
  showMeta?: boolean
  depth?: number
  selectedTags?: string[]
  onSelect?: (fixture: ParsedFixture) => void
}

function FixtureRenderer({ fixture, showLabels = false, depth = 0, selectedTags = [], onSelect }: FixtureRendererProps) {
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
    if (hovered) color = '#ff8800'
    
    return new THREE.PointsMaterial({ 
      color, 
      size: 2, 
      sizeAttenuation: false 
    })
  }, [hovered])

  const boxMaterial = useMemo(() => {
    let color = '#ffffff'
    if (hovered) color = '#ff8800'
    
    return new THREE.MeshBasicMaterial({ 
      color, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    })
  }, [hovered])

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (onSelect) {
      onSelect(fixture)
    }
  }

  const labelPosition = useMemo(() => {
    if (boundingBox.isEmpty()) return [0, 0, 0] as [number, number, number]
    
    const center = boundingBox.getCenter(new THREE.Vector3())
    const size = boundingBox.getSize(new THREE.Vector3())
    
    return [center.x, center.y + size.y / 2 + 2, center.z] as [number, number, number]
  }, [boundingBox])

  // Check if this fixture should show points based on tag filtering
  const shouldShowPoints = useMemo(() => {
    if (selectedTags.length === 0) return true

    // Only check if this fixture itself has matching tags
    return selectedTags.some((tag) => fixture.tags.includes(tag))
  }, [fixture.tags, selectedTags])


  // Check if we should allow meta labeling
  const shouldShowMeta = depth === 1

  return (
    <group>
      {/* Points */}
      {shouldShowPoints && fixture.points.length > 0 && (
        <points
          ref={pointsRef}
          geometry={geometry}
          material={pointMaterial}
          onClick={shouldShowMeta && handleClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        />
      )}
      
      {/* Bounding box */}
      {shouldShowPoints && shouldShowMeta && boundingBoxGeometry && (
        <mesh
          geometry={boundingBoxGeometry}
          material={boxMaterial}
          onClick={shouldShowMeta && handleClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        />
      )}
      
      {/* Label */}
      {shouldShowPoints && shouldShowMeta && showLabels && (
        <Html position={labelPosition} center>
          <div style={{
            color:  '#ffffff',
            fontSize: '12px',
            fontFamily: 'monospace',
            textAlign: 'center',
            pointerEvents: 'none',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
            textWrap: 'nowrap',
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
          showLabels={showLabels}
          selectedTags={selectedTags}
          onSelect={onSelect}
          depth={depth + 1}
        />
      ))}
    </group>
  )
}

export default FixtureRenderer