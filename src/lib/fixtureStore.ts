import { proxy, subscribe } from "valtio"
import * as THREE from "three"
import { fixtureLoader, ParsedFixture } from "./fixtures"
import { persist } from "valtio-persist"
import { IndexedDBStrategy } from "valtio-persist/indexed-db"

interface FixtureStore {
  // State
  fixture: ParsedFixture | null // Current top-level fixture (TE or Mothership)
  allFixtures: Record<string, ParsedFixture> // 'TE' | 'Mothership'
  selectedTopLevelFixture: string // 'TE' | 'Mothership'
  selectedFixtures: string[]
  selectedTags: string[]
  showLabels: boolean
  hideUnhighlighted: boolean
  availableTags: string[]
  loading: boolean
  error?: string
  cameraTarget?: {
    position: [number, number, number]
    target: [number, number, number]
    zoom?: number
  }
  desiredCameraTarget?: {
    position: [number, number, number]
    target: [number, number, number]
    zoom?: number
  }
  menuOpen: boolean
}

interface FixtureActions {
  // Actions
  setSelectedTopLevelFixture: (fixture: string) => void
  setSelectedFixtures: (fixtures: string[]) => void
  toggleFixtureSelection: (fixture: ParsedFixture) => void
  selectAllFixtures: () => void
  clearSelectedFixtures: () => void
  setSelectedTags: (tags: string[]) => void
  setShowLabels: (show: boolean) => void
  loadAllFixtures: () => Promise<void>
  handleFixtureSelect: (fixture: ParsedFixture) => void
  clearSelectedTags: () => void
  handleCanvasClick: () => void
  clearFilters: () => void
  focusOnFixture: (fixtureId: string) => void
  setMenuOpen: (open: boolean) => void
  setCameraTarget: (
    target:
      | {
          position: [number, number, number]
          target: [number, number, number]
          zoom?: number
        }
      | undefined
  ) => void
  setDesiredCameraTarget: (
    target:
      | {
          position: [number, number, number]
          target: [number, number, number]
          zoom?: number
        }
      | undefined
  ) => void
}

const defaultState: FixtureStore = {
  // Initial state (with localStorage fallbacks)
  allFixtures: {} as Record<string, ParsedFixture>,
  selectedTopLevelFixture: "TE",
  selectedFixtures: [],
  selectedTags: [],
  showLabels: false,
  hideUnhighlighted: false,
  availableTags: [],
  loading: false,
  error: undefined,
  cameraTarget: undefined,
  desiredCameraTarget: undefined,
  menuOpen: false,
  get fixture() {
    return this.allFixtures[this.selectedTopLevelFixture] || null
  },
}

const { store } = await persist<FixtureStore>(defaultState, "store", {
  storageStrategy: IndexedDBStrategy,
  debounceTime: 100,
})
export const fixtureStore = store

export const fixtureActions: FixtureActions = {
  // Actions
  setSelectedTopLevelFixture: (fixture: string) => {
    fixtureStore.selectedTopLevelFixture = fixture
    // Clear selections when switching fixtures
    fixtureStore.selectedFixtures = []
    fixtureStore.selectedTags = []
  },

  setSelectedFixtures: (fixtures: string[]) => {
    fixtureStore.selectedFixtures = fixtures
  },

  toggleFixtureSelection: (fixture: ParsedFixture) => {
    const isSelected = fixtureStore.selectedFixtures.includes(fixture.id)
    if (isSelected) {
      fixtureStore.selectedFixtures = fixtureStore.selectedFixtures.filter(
        (id) => id !== fixture.id
      )
    } else {
      fixtureStore.selectedFixtures = [
        ...fixtureStore.selectedFixtures,
        fixture.id,
      ]
    }
  },

  selectAllFixtures: () => {
    const currentFixture =
      fixtureStore.allFixtures[fixtureStore.selectedTopLevelFixture]
    if (currentFixture) {
      const allFixtureIds: string[] = []
      const traverse = (fixture: ParsedFixture) => {
        allFixtureIds.push(fixture.id)
        fixture.children.forEach(traverse)
      }
      traverse(currentFixture)
      fixtureStore.selectedFixtures = allFixtureIds
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

  loadAllFixtures: async () => {
    console.log("Loading all fixtures...")
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
      console.log("Fixtures loaded successfully:", {
        TE: teFixture.id,
        Mothership: mothershipFixture.id,
      })
      console.log("fixtureStore", fixtureStore)
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
    fixtureActions.toggleFixtureSelection(fixture)
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

  focusOnFixture: (fixtureId: string) => {
    const currentFixture =
      fixtureStore.allFixtures[fixtureStore.selectedTopLevelFixture]
    if (!currentFixture) return

    // Find the fixture by ID recursively
    const findFixture = (
      fixture: ParsedFixture,
      id: string
    ): ParsedFixture | null => {
      if (fixture.id === id) return fixture
      for (const child of fixture.children) {
        const found = findFixture(child, id)
        if (found) return found
      }
      return null
    }

    const targetFixture = findFixture(currentFixture, fixtureId)
    if (!targetFixture) return

    // Calculate camera position and target based on fixture bounds
    const bounds = targetFixture.bounds
    const center = targetFixture.center
    
    // Create a new Box3 to ensure we have the getSize method available
    const box3 = new THREE.Box3()
    if (bounds.min && bounds.max) {
      box3.min.copy(bounds.min)
      box3.max.copy(bounds.max)
    } else {
      // Fallback: recreate bounds from points if the Box3 methods aren't available
      box3.setFromPoints(targetFixture.points)
    }
    
    const size = box3.getSize(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z)

    // Position camera at an angle to show the fixture well
    const distance = maxDim * 2
    const cameraPosition: [number, number, number] = [
      center.x + distance * 0.7,
      center.y + distance * 0.7,
      center.z + distance * 0.7,
    ]

    // Set the desired camera target to trigger camera movement
    fixtureStore.desiredCameraTarget = {
      position: cameraPosition,
      target: [center.x, center.y, center.z],
      zoom: Math.max(10, 100 / maxDim),
    }
  },

  setMenuOpen: (open: boolean) => {
    fixtureStore.menuOpen = open
  },

  setCameraTarget: (target) => {
    fixtureStore.cameraTarget = target
  },

  setDesiredCameraTarget: (target) => {
    fixtureStore.desiredCameraTarget = target
  },
}

// Auto-load fixture data when store is created
// fixtureActions.loadAllFixtures()
