import { useEffect, useRef } from 'react'
import { Bounds, OrbitControls } from '@react-three/drei'
import { Group } from 'three'
import FixtureRenderer from '../FixtureRenderer'
import { fixtureLoader, ParsedFixture } from '../../../lib/fixtures'
import { useFixtureStore } from '../../../hooks/useFixtureStore'

function Scene() {
  const {
    selectedTags,
    showLabels,
    teFixture,
    loading,
    error,
    handleFixtureSelect,
    handleCanvasClick
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

  // Use all fixtures - filtering happens at render level
  const allFixtures = [teFixture]

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
        <group onClick={handleCanvasClick}>
          {/* All fixtures */}
          {allFixtures.map((fixture, index) => (
            <FixtureRenderer
              key={`${fixture.label}-${index}`}
              fixture={fixture}
              showLabels={showLabels}
              selectedTags={[...selectedTags]}
              onSelect={handleFixtureSelect}
            />
          ))}
        </group>
      </Bounds>
    </>
  )
}

export default Scene
