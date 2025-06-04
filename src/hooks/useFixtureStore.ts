import { useSnapshot } from 'valtio'
import { fixtureStore } from '../lib/fixtureStore'

export function useFixtureStore() {
  const snap = useSnapshot(fixtureStore)
  
  return {
    // State (reactive snapshots)
    allFixtures: snap.allFixtures,
    selectedTopLevelFixture: snap.selectedTopLevelFixture,
    selectedFixtures: snap.selectedFixtures,
    selectedTags: snap.selectedTags,
    showLabels: snap.showLabels,
    hideUnhighlighted: snap.hideUnhighlighted,
    availableTags: snap.availableTags,
    loading: snap.loading,
    error: snap.error,

    // Actions (direct references to store)
    setSelectedTopLevelFixture: fixtureStore.setSelectedTopLevelFixture,
    setSelectedFixtures: fixtureStore.setSelectedFixtures,
    toggleFixtureSelection: fixtureStore.toggleFixtureSelection,
    selectAllFixtures: fixtureStore.selectAllFixtures,
    clearAllFixtures: fixtureStore.clearAllFixtures,
    setSelectedTags: fixtureStore.setSelectedTags,
    setShowLabels: fixtureStore.setShowLabels,
    setHideUnhighlighted: fixtureStore.setHideUnhighlighted,
    loadAllFixtures: fixtureStore.loadAllFixtures,
    handleFixtureSelect: fixtureStore.handleFixtureSelect,
    handleCanvasClick: fixtureStore.handleCanvasClick,
    clearFilters: fixtureStore.clearFilters,
  }
}