import { useEffect, useRef } from "react"
import { OrbitControls } from "@react-three/drei"
import { Group } from "three"
import FixtureRenderer from "../FixtureRenderer"
import ControllerRenderer from "../ControllerRenderer"
import { fixtureLoader, ParsedFixture } from "../../../lib/fixtures"
import { useFixtureStore } from "../../../hooks/useFixtureStore"

function Scene() {
  const {
    allFixtures,
    selectedTopLevelFixture,
    selectedFixtures,
    selectedTags,
    fixture,
    showLabels,
    hideUnhighlighted,
    loading,
    error,
    handleFixtureSelect,
    handleCanvasClick,
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

  const currentFixture = fixture

  if (error || !currentFixture) {
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

  // Use current selected fixture
  const fixtureList = [currentFixture]

  return (
    <>
      {/* <group onClick={handleCanvasClick}> */}
      <group>
        {/* All fixtures */}
        {fixtureList.map((fixture, index) => (
          <FixtureRenderer
            key={`${fixture.id}-${index}`}
            fixture={fixture}
            showLabels={showLabels}
            showMeta={true}
            selectedTags={[...selectedTags]}
            selectedFixtures={[...selectedFixtures]}
            onSelect={handleFixtureSelect}
          />
        ))}

        {/* Controllers */}
        <ControllerRenderer 
          showLabels={showLabels} 
          selectedFixtures={[...selectedFixtures]}
          selectedTags={[...selectedTags]}
        />
      </group>
    </>
  )
}

export default Scene
