import { proxy, subscribe } from 'valtio'
import { fixtureLoader, ParsedFixture } from './fixtures'

interface FixtureStore {
  // State
  selectedTags: string[]
  showLabels: boolean
  availableTags: string[]
  fixtureCategories: string[]
  teFixture?: ParsedFixture
  loading: boolean
  error?: string

  // Actions
  setSelectedTags: (tags: string[]) => void
  setShowLabels: (show: boolean) => void
  loadTeFixture: () => Promise<void>
  handleFixtureSelect: (fixture: ParsedFixture) => void
  handleCanvasClick: () => void
  clearFilters: () => void
}

export const fixtureStore = proxy<FixtureStore>({
  // Initial state
  selectedTags: [],
  showLabels: false,
  availableTags: [],
  fixtureCategories: ['edge', 'panel'],
  teFixture: undefined,
  loading: false,
  error: undefined,

  // Actions
  setSelectedTags: (tags: string[]) => {
    fixtureStore.selectedTags = tags
  },

  setShowLabels: (show: boolean) => {
    fixtureStore.showLabels = show
  },

  loadTeFixture: async () => {
    try {
      fixtureStore.loading = true
      fixtureStore.error = undefined
      
      const fixture = await fixtureLoader.parseFixture('TE/TE')
      fixtureStore.teFixture = fixture
      
      // Extract available tags
      const tags = fixtureLoader.getAllTags([fixture])
      fixtureStore.availableTags = tags
    } catch (err) {
      console.error('Failed to load TE fixture:', err)
      fixtureStore.error = err instanceof Error ? err.message : 'Failed to load fixture'
    } finally {
      fixtureStore.loading = false
    }
  },

  handleFixtureSelect: (fixture: ParsedFixture) => {
    // Add all fixture tags to the selected tags
    const newTags = [...new Set([...fixtureStore.selectedTags, ...fixture.tags])]
    fixtureStore.setSelectedTags(newTags)
  },

  handleCanvasClick: () => {
    // Clear all filters when clicking on canvas
    fixtureStore.selectedTags = []
  },

  clearFilters: () => {
    fixtureStore.selectedTags = []
  }
})

// Auto-load fixture data when store is created
fixtureStore.loadTeFixture()