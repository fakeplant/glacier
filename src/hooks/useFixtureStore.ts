import { useSnapshot } from 'valtio'
import { fixtureStore } from '../lib/fixtureStore'

export function useFixtureStore() {
  const snap = useSnapshot(fixtureStore)
  
  return {
    // State (reactive snapshots)
    selectedFixture: snap.selectedFixture,
    selectedTags: snap.selectedTags,
    showLabels: snap.showLabels,
    availableTags: snap.availableTags,
    fixtureCategories: snap.fixtureCategories,
    teFixture: snap.teFixture,
    loading: snap.loading,
    error: snap.error,

    // Actions (direct references to store)
    setSelectedFixture: fixtureStore.setSelectedFixture,
    setSelectedTags: fixtureStore.setSelectedTags,
    setShowLabels: fixtureStore.setShowLabels,
    loadTeFixture: fixtureStore.loadTeFixture,
    handleFixtureSelect: fixtureStore.handleFixtureSelect,
    clearFilters: fixtureStore.clearFilters,
  }
}