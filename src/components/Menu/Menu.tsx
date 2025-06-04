import {
  Box,
  rem,
  SegmentedControl,
  Stack,
  VisuallyHidden,
  Text,
  Button,
  MultiSelect,
  Divider,
  Switch,
} from "@mantine/core"
import classes from "./Menu.module.css"
import { useEffect, useState } from "react"
import { IconChartAreaLine, IconCircleHalfVertical, IconTag } from "@tabler/icons-react"
import { Car } from "../../lib/types"
import { useNavigate, useLocation } from "@tanstack/react-router"
import { useFixtureStore } from "../../hooks/useFixtureStore"

// -------------------------------------------------- //
// Props
// -------------------------------------------------- //
interface MenuProps {}

// -------------------------------------------------- //
// Provider
// -------------------------------------------------- //
export function Menu(props: MenuProps) {
  // Props
  const {} = props

  // Fixture store
  const {
    selectedTags,
    showLabels,
    availableTags,
    fixtureCategories,
    setSelectedTags,
    setShowLabels,
    clearFilters,
  } = useFixtureStore()


  // Icons
  const iconProps = {
    style: { width: rem(20), height: rem(20), display: "block" },
    stroke: 1.5,
  }

  // Control
  const [car, setCar] = useState<Car>(Car.Iceberg)

  // Router
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === "/mothership") {
      setCar(Car.Mothership)
    } else {
      setCar(Car.Iceberg)
    }
  })

  const setCarRoute = (car: Car) => {
    navigate({ to: `/${car.toLowerCase()}` })
  }

  return (
    <Box className={classes.wrapper}>
      <Stack className={classes.select} justify="center" align="end" w="100%">
        <SegmentedControl
          value={car}
          onChange={(value) => setCarRoute(value as Car)}
          data={[
            {
              value: Car.Iceberg,
              label: (
                <>
                  <IconChartAreaLine {...iconProps} />
                  <VisuallyHidden>{Car.Iceberg}</VisuallyHidden>
                </>
              ),
            },
            {
              value: Car.Mothership,
              label: (
                <>
                  <IconCircleHalfVertical {...iconProps} />
                  <VisuallyHidden>{Car.Mothership}</VisuallyHidden>
                </>
              ),
            },
          ]}
          size="md"
        />
      </Stack>

      {car === Car.Iceberg && (
        <Stack className={classes.stack} gap="md" p="md">
          <Divider />
          
          {/* View Controls */}
          <Box>
            <Text size="sm" fw={600} mb="xs">View Controls</Text>
            <Switch
              label="Show Labels"
              checked={showLabels}
              onChange={(event) => setShowLabels(event.currentTarget.checked)}
              size="sm"
            />
          </Box>

          <Divider />

          {/* Fixture Categories */}
          <Box>
            <Text size="sm" fw={600} mb="xs">Fixture Categories</Text>
            <Stack gap="xs">
              {fixtureCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedTags.includes(category) ? "filled" : "light"}
                  size="xs"
                  onClick={() => {
                    if (selectedTags.includes(category)) {
                      setSelectedTags(selectedTags.filter(tag => tag !== category))
                    } else {
                      setSelectedTags([...selectedTags, category])
                    }
                  }}
                >
                  {category.toUpperCase()}
                </Button>
              ))}
            </Stack>
          </Box>

          <Divider />

          {/* Tag Filters */}
          <Box>
            <Text size="sm" fw={600} mb="xs">
              <IconTag size={16} style={{ display: 'inline', marginRight: '4px' }} />
              Filter by Tags
            </Text>
            <MultiSelect
              placeholder="Select tags to filter"
              data={[...availableTags].map(tag => ({ value: tag, label: tag }))}
              value={[...selectedTags]}
              onChange={(tags) => setSelectedTags(tags)}
              size="xs"
              maxDropdownHeight={200}
              searchable
              clearable
            />
          </Box>

          {selectedTags.length > 0 && (
            <Box>
              <Text size="xs" c="dimmed">
                Filtering by: {selectedTags.join(', ')}
              </Text>
              <Button
                variant="subtle"
                size="xs"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            </Box>
          )}
        </Stack>
      )}
    </Box>
  )
}

// -------------------------------------------------- //
// Export
// -------------------------------------------------- //
export default Menu
