import { proxy, subscribe } from "valtio"
import { fixtureLoader, ParsedFixture } from "./fixtures"

interface FixtureStore {
  // State
  fixture: ParsedFixture // Current top-level fixture (TE or Mothership)
  allFixtures: Record<string, ParsedFixture> // 'TE' | 'Mothership'
  selectedTopLevelFixture: string // 'TE' | 'Mothership'
  selectedFixtures: string[]
  selectedTags: string[]
  showLabels: boolean
  hideUnhighlighted: boolean
  availableTags: string[]
  loading: boolean
  error?: string

  // Actions
  setSelectedTopLevelFixture: (fixture: string) => void
  setSelectedFixtures: (fixtures: string[]) => void
  toggleFixtureSelection: (fixture: ParsedFixture) => void
  selectAllFixtures: () => void
  clearSelectedFixtures: () => void
  setSelectedTags: (tags: string[]) => void
  setShowLabels: (show: boolean) => void
  setHideUnhighlighted: (hide: boolean) => void
  loadAllFixtures: () => Promise<void>
  handleFixtureSelect: (fixture: ParsedFixture) => void
  clearSelectedTags: () => void
  handleCanvasClick: () => void
  clearFilters: () => void
}

export const fixtureStore = proxy<FixtureStore>({
  // Initial state
  allFixtures: {},
  selectedTopLevelFixture: "TE",
  selectedFixtures: [],
  selectedTags: [],
  showLabels: false,
  hideUnhighlighted: false,
  availableTags: [],
  loading: false,
  error: undefined,

  get fixture() {
    return fixtureStore.allFixtures[fixtureStore.selectedTopLevelFixture]
  },

  // Actions
  setSelectedTopLevelFixture: (fixture: string) => {
    fixtureStore.selectedTopLevelFixture = fixture
    // Clear selections when switching fixtures
    fixtureStore.selectedFixtures = []
    fixtureStore.selectedTags = []
  },

  setSelectedFixtures: (fixtures: ParsedFixture[]) => {
    fixtureStore.selectedFixtures = fixtures
  },

  toggleFixtureSelection: (fixture: ParsedFixture) => {
    const isSelected = fixtureStore.selectedFixtures.some(
      (f) => f.label === fixture.label
    )
    if (isSelected) {
      fixtureStore.selectedFixtures = fixtureStore.selectedFixtures.filter(
        (f) => f.label !== fixture.label
      )
    } else {
      fixtureStore.selectedFixtures = [
        ...fixtureStore.selectedFixtures,
        fixture,
      ]
    }
  },

  selectAllFixtures: () => {
    const currentFixture =
      fixtureStore.allFixtures[fixtureStore.selectedTopLevelFixture]
    if (currentFixture) {
      const allFixtures: ParsedFixture[] = []
      const traverse = (fixture: ParsedFixture) => {
        allFixtures.push(fixture)
        fixture.children.forEach(traverse)
      }
      traverse(currentFixture)
      fixtureStore.selectedFixtures = allFixtures
    }
  },

  clearSelectedFixtures: () => {
    fixtureStore.selectedFixtures = []
  },

  clearSelectedTags: () => {
    fixtureStore.selectedTags = []
  },

  setSelectedTags: (tags: string[]) => {
    fixtureStore.selectedTags = tags
  },

  setShowLabels: (show: boolean) => {
    fixtureStore.showLabels = show
  },

  setHideUnhighlighted: (hide: boolean) => {
    fixtureStore.hideUnhighlighted = hide
  },

  loadAllFixtures: async () => {
    try {
      fixtureStore.loading = true
      fixtureStore.error = undefined

      // Load both fixtures
      const [teFixture, mothershipFixture] = await Promise.all([
        fixtureLoader.parseFixture("TE/TE"),
        fixtureLoader.parseFixture("Mothership/Mothership"),
      ])

      fixtureStore.allFixtures = {
        TE: teFixture,
        Mothership: mothershipFixture,
      }

      // Extract available tags from all fixtures
      const allFixtureList = Object.values(fixtureStore.allFixtures)
      const tags = fixtureLoader.getAllTags(allFixtureList)
      fixtureStore.availableTags = tags
    } catch (err) {
      console.error("Failed to load fixtures:", err)
      fixtureStore.error =
        err instanceof Error ? err.message : "Failed to load fixtures"
    } finally {
      fixtureStore.loading = false
    }
  },

  handleFixtureSelect: (fixture: ParsedFixture) => {
    // Toggle fixture selection when clicked in 3D scene
    fixtureStore.toggleFixtureSelection(fixture)
  },

  handleCanvasClick: () => {
    // Clear all filters when clicking on canvas
    fixtureStore.selectedFixtures = []
    fixtureStore.selectedTags = []
  },

  clearFilters: () => {
    fixtureStore.selectedFixtures = []
    fixtureStore.selectedTags = []
  },
})

// Auto-load fixture data when store is created
fixtureStore.loadAllFixtures()
