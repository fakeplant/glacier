import { proxy, subscribe } from 'valtio'
import { fixtureLoader, ParsedFixture } from './fixtures'

interface FixtureStore {
  // State
  selectedFixture?: string
  selectedTags: string[]
  showLabels: boolean
  availableTags: string[]
  fixtureCategories: string[]
  teFixture?: ParsedFixture
  loading: boolean
  error?: string

  // Actions
  setSelectedFixture: (fixture?: string) => void
  setSelectedTags: (tags: string[]) => void
  setShowLabels: (show: boolean) => void
  loadTeFixture: () => Promise<void>
  handleFixtureSelect: (fixture: ParsedFixture) => void
  clearFilters: () => void
}

export const fixtureStore = proxy<FixtureStore>({
  // Initial state
  selectedFixture: undefined,
  selectedTags: [],
  showLabels: false,
  availableTags: [],
  fixtureCategories: ['edge', 'panel'],
  teFixture: undefined,
  loading: false,
  error: undefined,

  // Actions
  setSelectedFixture: (fixture?: string) => {
    fixtureStore.selectedFixture = fixture
    if (fixture) {
      // When selecting a category, also filter by its tag
      fixtureStore.selectedTags = [fixture]
    } else {
      fixtureStore.selectedTags = []
    }
  },

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
    // For now, we'll use fixture categories (edge/panel)
    const category = fixture.definition.components?.[0]?.type.split('/')[0]
    if (category) {
      const currentSelection = fixtureStore.selectedFixture
      fixtureStore.setSelectedFixture(category === currentSelection ? undefined : category)
    }
  },

  clearFilters: () => {
    fixtureStore.selectedFixture = undefined
    fixtureStore.selectedTags = []
  }
})

// Auto-load fixture data when store is created
fixtureStore.loadTeFixture()