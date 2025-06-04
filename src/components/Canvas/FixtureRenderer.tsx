import React, { useMemo, useRef, useState } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Text, Bounds } from '@react-three/drei'
import * as THREE from 'three'
import { ParsedFixture } from '../../lib/fixtures'

interface FixtureRendererProps {
  fixture: ParsedFixture
  highlighted?: boolean
  showLabels?: boolean
  onSelect?: (fixture: ParsedFixture) => void
}

function FixtureRenderer({ fixture, highlighted = false, showLabels = false, onSelect }: FixtureRendererProps) {
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
    if (highlighted) color = '#ffff00'
    else if (hovered) color = '#ff8800'
    
    return new THREE.PointsMaterial({ 
      color, 
      size: highlighted ? 3 : 2, 
      sizeAttenuation: false 
    })
  }, [highlighted, hovered])

  const boxMaterial = useMemo(() => {
    let color = '#ffffff'
    if (highlighted) color = '#ffff00'
    else if (hovered) color = '#ff8800'
    
    return new THREE.MeshBasicMaterial({ 
      color, 
      wireframe: true,
      transparent: true,
      opacity: highlighted ? 0.8 : 0.3
    })
  }, [highlighted, hovered])

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

  return (
    <group>
      {/* Points */}
      {fixture.points.length > 0 && (
        <points
          ref={pointsRef}
          geometry={geometry}
          material={pointMaterial}
          onClick={handleClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        />
      )}
      
      {/* Bounding box */}
      {boundingBoxGeometry && (
        <mesh
          geometry={boundingBoxGeometry}
          material={boxMaterial}
          onClick={handleClick}
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
        />
      )}
      
      {/* Label */}
      {showLabels && (
        <Text
          position={labelPosition}
          fontSize={1}
          color={highlighted ? '#ffff00' : '#ffffff'}
          anchorX="center"
          anchorY="bottom"
        >
          {fixture.label}
        </Text>
      )}
      
      {/* Render children */}
      {fixture.children.map((child, index) => (
        <FixtureRenderer
          key={`${child.label}-${index}`}
          fixture={child}
          highlighted={highlighted}
          showLabels={showLabels}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}

export default FixtureRenderer