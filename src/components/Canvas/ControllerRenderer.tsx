import React, { useMemo } from "react"
import * as THREE from "three"
import { Controller, ParsedFixture, fixtureLoader } from "../../lib/fixtures"
import { Billboard } from "@react-three/drei"
import { extend } from "@react-three/fiber"
import { Text } from "troika-three-text"
import ConnectionRenderer from "./ConnectionRenderer"
import { useFixtureStore } from "../../hooks/useFixtureStore"

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

interface ControllerRendererProps {
  showLabels?: boolean
  selectedFixtures?: string[]
  selectedTags?: string[]
}

function ControllerRenderer({ 
  showLabels = false, 
  selectedFixtures = [], 
  selectedTags = [] 
}: ControllerRendererProps) {
  const { allFixtures } = useFixtureStore()

  // Helper function to check if a fixture matches the current filters
  const fixtureMatchesFilters = (fixtureId: string): boolean => {
    // If no filters are active, all fixtures match
    if (selectedTags.length === 0 && selectedFixtures.length === 0) {
      return true
    }

    // Find the fixture by ID
    const findFixtureById = (id: string): ParsedFixture | null => {
      for (const [, topLevelFixture] of Object.entries(allFixtures)) {
        const search = (fixture: ParsedFixture): ParsedFixture | null => {
          if (fixture.id === id) return fixture
          for (const child of fixture.children) {
            const found = search(child)
            if (found) return found
          }
          return null
        }
        const found = search(topLevelFixture)
        if (found) return found
      }
      return null
    }

    const fixture = findFixtureById(fixtureId)
    if (!fixture) return false

    // Check if fixture matches selected fixtures
    const matchesFixtures = selectedFixtures.length === 0 || selectedFixtures.includes(fixture.id)
    
    // Check if fixture matches selected tags
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => fixture.tags.includes(tag))
    
    return matchesFixtures && matchesTags
  }

  const controllers = useMemo(() => {
    const allControllers = fixtureLoader.getControllers()
    
    // Filter controllers based on whether they have any connected fixtures that match current filters
    return allControllers.filter(controller => {
      // Check if any port has fixtures that match the current filters
      for (const port of controller.ports.values()) {
        if (port.connectedFixtures.some(fixtureId => fixtureMatchesFilters(fixtureId))) {
          return true
        }
      }
      return false
    })
  }, [selectedFixtures, selectedTags, allFixtures])

  return (
    <group>
      {controllers.map((controller) => (
        <ControllerComponent 
          key={controller.id} 
          controller={controller} 
          showLabels={showLabels}
        />
      ))}
      
      {/* Connection lines */}
      <ConnectionRenderer controllers={controllers} />
    </group>
  )
}

interface ControllerComponentProps {
  controller: Controller
  showLabels: boolean
}

function ControllerComponent({ controller, showLabels }: ControllerComponentProps) {
  // Controller box geometry and material
  const boxGeometry = useMemo(() => {
    return new THREE.BoxGeometry(15, 8, 10) // Size of controller box
  }, [])

  const boxMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#666666",
      transparent: true,
      opacity: 0.8,
      wireframe: false,
    })
  }, [])

  const wireframeMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: "#ffffff",
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    })
  }, [])

  // Port geometry and materials
  const portGeometry = useMemo(() => {
    return new THREE.SphereGeometry(1.5, 8, 8) // Small spheres for ports
  }, [])

  const getPortMaterial = (portNumber: number) => {
    const portColors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44"] // Red, Green, Blue, Yellow
    const color = portColors[portNumber - 1] || "#ff4444"
    
    return new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.9,
    })
  }

  // Calculate port positions around the controller
  const portPositions = useMemo(() => {
    const positions: THREE.Vector3[] = []
    const portsArray = Array.from(controller.ports.values())
    
    portsArray.forEach((port, index) => {
      // Position ports in a line along the front face of the controller
      const spacing = 3
      const startX = -(portsArray.length - 1) * spacing / 2
      const x = startX + index * spacing
      positions.push(new THREE.Vector3(x, -4, 5)) // Front face, bottom
    })
    
    return positions
  }, [controller.ports])

  return (
    <group position={[controller.position.x, controller.position.y, controller.position.z]}>
      {/* Main controller box */}
      <mesh geometry={boxGeometry} material={boxMaterial} />
      <mesh geometry={boxGeometry} material={wireframeMaterial} />
      
      {/* Controller label */}
      {showLabels && (
        <Billboard position={[0, 6, 0]}>
          <text
            text={`Controller\n${controller.id}`}
            fontSize={4}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          />
        </Billboard>
      )}

      {/* Port visualization */}
      {Array.from(controller.ports.values()).map((port, index) => {
        const position = portPositions[index]
        if (!position) return null

        return (
          <group key={port.portNumber} position={[position.x, position.y, position.z]}>
            {/* Port sphere */}
            <mesh geometry={portGeometry} material={getPortMaterial(port.portNumber)} />
            
            {/* Port label */}
            {showLabels && (
              <Billboard position={[0, 3, 0]}>
                <text
                  text={`P${port.portNumber}`}
                  fontSize={2}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                />
              </Billboard>
            )}
          </group>
        )
      })}
    </group>
  )
}

export default ControllerRenderer