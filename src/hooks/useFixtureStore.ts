import { useSnapshot } from "valtio"
import { fixtureStore, fixtureActions } from "../lib/fixtureStore"

export function useFixtureStore() {
  const snap = useSnapshot(fixtureStore)

  return {
    // State (reactive snapshots) - NOTE: cameraTarget and desiredCameraTarget excluded to avoid re-renders
    fixture: snap.fixture,
    allFixtures: snap.allFixtures,
    selectedTopLevelFixture: snap.selectedTopLevelFixture,
    selectedFixtures: snap.selectedFixtures,
    selectedTags: snap.selectedTags,
    showLabels: snap.showLabels,
    hideUnhighlighted: snap.hideUnhighlighted,
    availableTags: snap.availableTags,
    loading: snap.loading,
    error: snap.error,
    menuOpen: snap.menuOpen,

    // Actions (direct references to actions)
    setSelectedTopLevelFixture: fixtureActions.setSelectedTopLevelFixture,
    setSelectedFixtures: fixtureActions.setSelectedFixtures,
    toggleFixtureSelection: fixtureActions.toggleFixtureSelection,
    selectAllFixtures: fixtureActions.selectAllFixtures,
    clearSelectedFixtures: fixtureActions.clearSelectedFixtures,
    setSelectedTags: fixtureActions.setSelectedTags,
    clearSelectedTags: fixtureActions.clearSelectedTags,
    setShowLabels: fixtureActions.setShowLabels,
    loadAllFixtures: fixtureActions.loadAllFixtures,
    handleFixtureSelect: fixtureActions.handleFixtureSelect,
    handleCanvasClick: fixtureActions.handleCanvasClick,
    clearFilters: fixtureActions.clearFilters,
    focusOnFixture: fixtureActions.focusOnFixture,
    setMenuOpen: fixtureActions.setMenuOpen,
    setCameraTarget: fixtureActions.setCameraTarget,
    setDesiredCameraTarget: fixtureActions.setDesiredCameraTarget,
  }
}
