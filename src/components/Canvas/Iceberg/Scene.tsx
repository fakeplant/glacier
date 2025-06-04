import { useEffect, useRef } from 'react'
import { Bounds, OrbitControls } from '@react-three/drei'
import { Group } from 'three'
import FixtureRenderer from '../FixtureRenderer'
import { fixtureLoader, ParsedFixture } from '../../../lib/fixtures'
import { useFixtureStore } from '../../../hooks/useFixtureStore'

function Scene() {
  const {
    selectedFixture,
    selectedTags,
    showLabels,
    teFixture,
    loading,
    error,
    handleFixtureSelect
  } = useFixtureStore()
  
  const highlightedGroupRef = useRef<Group>(null)

  if (loading) {
    return (
      <>
        <ambientLight intensity={1.5} />
        <directionalLight
          castShadow
          position={[2.5, 8, 5]}
          intensity={1.5}
          shadow-mapSize={1024}
        />
        <group>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="gray" />
          </mesh>
        </group>
      </>
    )
  }

  if (error || !teFixture) {
    return (
      <>
        <ambientLight intensity={1.5} />
        <directionalLight
          castShadow
          position={[2.5, 8, 5]}
          intensity={1.5}
          shadow-mapSize={1024}
        />
        <group>
          <mesh>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="red" />
          </mesh>
        </group>
      </>
    )
  }

  // Filter fixtures by tags if any are selected
  const filteredFixtures = selectedTags.length > 0 
    ? fixtureLoader.filterByTags([teFixture], [...selectedTags])
    : [teFixture]

  // Separate highlighted and normal fixtures for selective bounds
  const isHighlighted = (fixture: any) => {
    if (!selectedFixture) return false
    return fixture.definition.components?.some((comp: any) => 
      comp.type.startsWith(selectedFixture + '/')
    ) || false
  }

  const highlightedFixtures = filteredFixtures.filter(isHighlighted)
  const normalFixtures = filteredFixtures.filter(f => !isHighlighted(f))

  return (
    <>
      <OrbitControls 
        enablePan={true} 
        enableZoom={true} 
        enableRotate={true}
        dampingFactor={0.05}
        enableDamping={true}
      />
      
      <ambientLight intensity={1.5} />
      <directionalLight
        castShadow
        position={[2.5, 8, 5]}
        intensity={1.5}
        shadow-mapSize={1024}
      />
      
      <Bounds fit clip observe margin={1.2}>
        <group>
          {/* Normal fixtures */}
          {normalFixtures.map((fixture, index) => (
            <FixtureRenderer
              key={`normal-${fixture.label}-${index}`}
              fixture={fixture}
              highlighted={false}
              showLabels={showLabels}
              onSelect={handleFixtureSelect}
            />
          ))}
          
          {/* Highlighted fixtures group for bounds targeting */}
          <group ref={highlightedGroupRef}>
            {highlightedFixtures.map((fixture, index) => (
              <FixtureRenderer
                key={`highlighted-${fixture.label}-${index}`}
                fixture={fixture}
                highlighted={true}
                showLabels={showLabels}
                onSelect={handleFixtureSelect}
              />
            ))}
          </group>
        </group>
      </Bounds>
    </>
  )
}

export default Scene
