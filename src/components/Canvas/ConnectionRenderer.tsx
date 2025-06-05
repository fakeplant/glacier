import React, { useMemo } from "react"
import * as THREE from "three"
import { Line } from "@react-three/drei"
import { Controller, ParsedFixture, fixtureLoader } from "../../lib/fixtures"
import { useFixtureStore } from "../../hooks/useFixtureStore"

interface ConnectionRendererProps {
  controllers: Controller[]
}

function ConnectionRenderer({ controllers }: ConnectionRendererProps) {
  const { allFixtures } = useFixtureStore()

  // Helper function to get the starting index of a component within the fixture's points array
  const getComponentStartIndex = (fixture: ParsedFixture, componentIndex: number): number => {
    if (componentIndex === 0) return 0
    
    // For panels, we need to calculate based on the actual component structure
    // Each component (panelRow) contributes its numPoints to the total
    let startIndex = 0
    
    // Look at the fixture definition to get component info
    if (fixture.definition.components && componentIndex < fixture.definition.components.length) {
      for (let i = 0; i < componentIndex; i++) {
        const component = fixture.definition.components[i]
        if (component.numPoints) {
          // Handle parameter substitution for numPoints
          const numPointsValue = typeof component.numPoints === "string" 
            ? parseInt(component.numPoints) || 0
            : component.numPoints
          startIndex += numPointsValue
        } else if (component.type === "panelRow") {
          // Default panelRow points if not specified - this is a fallback
          startIndex += 30 // rough estimate
        }
      }
    } else {
      // Fallback to the old method if we can't access component definitions
      const avgPointsPerComponent = Math.floor(fixture.points.length / Math.max(fixture.children.length, 1))
      startIndex = componentIndex * avgPointsPerComponent
    }
    
    return Math.min(startIndex, fixture.points.length - 1)
  }

  // Find all fixtures by ID across all loaded fixtures
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

  // Get points for a specific component
  const getComponentPoints = (fixture: ParsedFixture, componentIndex: number): THREE.Vector3[] => {
    if (!fixture.definition.components || componentIndex >= fixture.definition.components.length) {
      return []
    }

    const componentStartIndex = getComponentStartIndex(fixture, componentIndex)
    const component = fixture.definition.components[componentIndex]
    
    // Get number of points for this component
    let numPoints = 0
    if (component.numPoints) {
      numPoints = typeof component.numPoints === "string" 
        ? parseInt(component.numPoints) || 0
        : component.numPoints
    }

    const componentEndIndex = Math.min(componentStartIndex + numPoints, fixture.points.length)
    return fixture.points.slice(componentStartIndex, componentEndIndex)
  }

  // Generate the pixel order path for a given output
  const generatePixelOrderPath = (fixture: ParsedFixture, output: any): THREE.Vector3[] => {
    const path: THREE.Vector3[] = []
    
    if (!output.segments || output.segments.length === 0) {
      return path
    }

    output.segments.forEach((segment: any) => {
      if (segment.componentIndex === undefined) return

      const componentStartIndex = getComponentStartIndex(fixture, segment.componentIndex)
      const componentPoints = getComponentPoints(fixture, segment.componentIndex)
      
      if (componentPoints.length === 0) return

      // Handle segment start and length
      const segmentStart = segment.start || 0
      const segmentLength = segment.length || (componentPoints.length - segmentStart)
      const segmentEnd = Math.min(segmentStart + segmentLength, componentPoints.length)

      // Get the points for this segment
      const segmentPoints = componentPoints.slice(segmentStart, segmentEnd)
      
      // Reverse if needed
      if (segment.reverse) {
        segmentPoints.reverse()
      }

      // Add to path
      path.push(...segmentPoints)
    })

    return path
  }

  // Calculate port connection lines and pixel order paths
  const { connectionLines, pixelOrderPaths } = useMemo(() => {
    const connections: {
      start: THREE.Vector3
      end: THREE.Vector3
      color: string
      portNumber: number
    }[] = []

    const pixelPaths: {
      points: THREE.Vector3[]
      color: string
      portNumber: number
    }[] = []

    const portColors = ["#ff4444", "#44ff44", "#4444ff", "#ffff44"] // Red, Green, Blue, Yellow

    controllers.forEach((controller) => {
      Array.from(controller.ports.values()).forEach((port, portIndex) => {
        // Calculate port position relative to controller
        const portsArray = Array.from(controller.ports.values())
        const spacing = 3
        const startX = -(portsArray.length - 1) * spacing / 2
        const portOffsetX = startX + portIndex * spacing
        
        const portWorldPosition = new THREE.Vector3(
          controller.position.x + portOffsetX,
          controller.position.y - 4,
          controller.position.z + 5
        )

        const color = portColors[port.portNumber - 1] || "#ff4444"

        // Process each output on this port (there should be one output per fixture per port)
        port.outputs.forEach((output) => {
          // Find the fixture for this output
          const fixtureId = port.connectedFixtures.find(id => {
            const fixture = findFixtureById(id)
            return fixture && fixture.outputs.some(o => 
              o.host === controller.id && 
              o.universe === output.universe &&
              o.channel === output.channel
            )
          })
          
          if (!fixtureId) return
          const fixture = findFixtureById(fixtureId)
          if (!fixture || fixture.points.length === 0) return

          // Generate pixel order path for this output
          const pixelPoints = generatePixelOrderPath(fixture, output)
          
          if (pixelPoints.length > 0) {
            // Add connection line from port to first pixel
            connections.push({
              start: portWorldPosition.clone(),
              end: pixelPoints[0].clone(),
              color,
              portNumber: port.portNumber
            })

            // Add pixel order path
            pixelPaths.push({
              points: pixelPoints,
              color,
              portNumber: port.portNumber
            })
          }
        })
      })
    })

    return { connectionLines: connections, pixelOrderPaths: pixelPaths }
  }, [controllers, allFixtures])

  return (
    <group>
      {/* Port connection lines */}
      {connectionLines.map((line, index) => (
        <Line
          key={`connection-${index}`}
          points={[line.start, line.end]}
          color={line.color}
          lineWidth={8} // Thick connection lines
        />
      ))}

      {/* Pixel order paths */}
      {pixelOrderPaths.map((path, index) => (
        <Line
          key={`pixel-path-${index}`}
          points={path.points}
          color={path.color}
          lineWidth={4} // Thinner pixel order lines
        />
      ))}
    </group>
  )
}

export default ConnectionRenderer