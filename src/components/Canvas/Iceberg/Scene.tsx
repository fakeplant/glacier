import { useEffect, useRef } from "react"
import { OrbitControls } from "@react-three/drei"
import { Group } from "three"
import FixtureRenderer from "../FixtureRenderer"
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

  // Determine which fixtures should be highlighted (OR logic)
  const isHighlighted = (fixture: ParsedFixture): boolean => {
    // Check if fixture is in selectedFixtures
    const isSelectedFixture = selectedFixtures.some(
      (f) => f.label === fixture.label
    )

    // Check if fixture has any selected tags
    const hasSelectedTags = selectedTags.some((tag) =>
      fixture.tags.includes(tag)
    )

    return isSelectedFixture || hasSelectedTags
  }

  return (
    <>
      {/* <group onClick={handleCanvasClick}> */}
      <group>
        {/* All fixtures */}
        {fixtureList.map((fixture, index) => (
          <FixtureRenderer
            key={`${fixture.label}-${index}`}
            fixture={fixture as any}
            highlighted={isHighlighted(fixture as any)}
            showLabels={showLabels}
            showMeta={true}
            hideUnhighlighted={hideUnhighlighted}
            selectedTags={[...selectedTags] as any}
            selectedFixtures={[...selectedFixtures] as any}
            onSelect={handleFixtureSelect}
          />
        ))}
      </group>
    </>
  )
}

export default Scene
