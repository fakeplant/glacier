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
import FixtureTree from "./FixtureTree"

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
    selectedTopLevelFixture,
    selectedTags,
    showLabels,
    hideUnhighlighted,
    availableTags,
    setSelectedTopLevelFixture,
    setSelectedTags,
    setShowLabels,
    setHideUnhighlighted,
    clearFilters,
  } = useFixtureStore()


  // Icons
  const iconProps = {
    style: { width: rem(20), height: rem(20), display: "block" },
    stroke: 1.5,
  }

  // Router
  const navigate = useNavigate()
  const location = useLocation()

  // Sync URL with store
  useEffect(() => {
    if (location.pathname === "/mothership") {
      setSelectedTopLevelFixture('Mothership')
    } else {
      setSelectedTopLevelFixture('TE')
    }
  }, [location.pathname, setSelectedTopLevelFixture])

  const setCarRoute = (value: string) => {
    const route = value === 'Mothership' ? '/mothership' : '/iceberg'
    navigate({ to: route })
  }

  return (
    <Box className={classes.wrapper}>
      <Stack className={classes.select} justify="center" align="end" w="100%">
        <SegmentedControl
          value={selectedTopLevelFixture === 'TE' ? 'Iceberg' : 'Mothership'}
          onChange={(value) => setCarRoute(value)}
          data={[
            {
              value: 'Iceberg',
              label: (
                <>
                  <IconChartAreaLine {...iconProps} />
                  <VisuallyHidden>Iceberg</VisuallyHidden>
                </>
              ),
            },
            {
              value: 'Mothership',
              label: (
                <>
                  <IconCircleHalfVertical {...iconProps} />
                  <VisuallyHidden>Mothership</VisuallyHidden>
                </>
              ),
            },
          ]}
          size="md"
        />
      </Stack>

      <Stack className={classes.stack} gap="md" p="md">          
          {/* View Controls */}
          <Box>
            <Text size="sm" fw={600} mb="xs">View Controls</Text>
            <Stack gap="xs">
              <Switch
                label="Show Labels"
                checked={showLabels}
                onChange={(event) => setShowLabels(event.currentTarget.checked)}
                size="sm"
              />
              <Switch
                label="Hide Unhighlighted"
                checked={hideUnhighlighted}
                onChange={(event) => setHideUnhighlighted(event.currentTarget.checked)}
                size="sm"
              />
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
          
          <Divider />

          {/* Fixture Tree */}
          <Box>
            <Text size="sm" fw={600} mb="xs">Fixture Selection</Text>
            {/* <FixtureTree /> */}
          </Box>

          <Divider />

          
        </Stack>
    </Box>
  )
}

// -------------------------------------------------- //
// Export
// -------------------------------------------------- //
export default Menu
