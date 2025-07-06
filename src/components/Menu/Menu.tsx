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
  Group,
} from "@mantine/core"
import classes from "./Menu.module.css"
import { useEffect, useState } from "react"
import {
  IconChartAreaLine,
  IconCircleHalfVertical,
  IconCube,
  IconSettings,
  IconTag,
} from "@tabler/icons-react"
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
    fixture,
    setSelectedFixtures,
    setShowLabels,
    selectedFixtures,
    clearSelectedFixtures,
    clearSelectedTags,
    handleFixtureSelect,
    clearFilters,
    focusOnFixture,
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
      setSelectedTopLevelFixture("Mothership")
    } else {
      setSelectedTopLevelFixture("TE")
    }
  }, [location.pathname, setSelectedTopLevelFixture])

  const setCarRoute = (value: string) => {
    const route = value === "Mothership" ? "/mothership" : "/iceberg"
    navigate({ to: route })
  }

  return (
    <Box className={classes.wrapper}>
      <Stack
        className={classes.select}
        justify="center"
        align="end"
        w="100%"
      >
        <SegmentedControl
          value={selectedTopLevelFixture === "TE" ? "Iceberg" : "Mothership"}
          onChange={(value) => setCarRoute(value)}
          data={[
            {
              value: "Iceberg",
              label: (
                <>
                  <IconChartAreaLine {...iconProps} />
                  <VisuallyHidden>Iceberg</VisuallyHidden>
                </>
              ),
            },
            {
              value: "Mothership",
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

      <Stack
        className={classes.stack}
        gap="md"
        p="md"
        style={{ flex: 1, overflow: "hidden", minHeight: "0" }}
      >
        {/* View Controls */}
        <Box>
          <Group
            gap="xxs"
            align="center"
            mb="xs"
          >
            <IconSettings
              size={16}
              style={{ display: "inline", marginRight: "4px" }}
            />
            <Text
              size="sm"
              fw={600}
            >
              Controls
            </Text>
          </Group>
          <Stack gap="xs">
            <Switch
              label="Show Labels"
              checked={showLabels}
              onChange={(event) => setShowLabels(event.currentTarget.checked)}
              size="sm"
            />
          </Stack>
        </Box>

        <Divider />

        {/* Tag Filters */}
        <Box>
          <Group
            gap="xxs"
            align="center"
            mb="xs"
          >
            <IconTag
              size={16}
              style={{ display: "inline", marginRight: "4px" }}
            />
            <Text
              size="sm"
              fw={600}
            >
              Tags
            </Text>
          </Group>

          <MultiSelect
            placeholder="Select tags to filter"
            data={[...availableTags].map((tag) => ({ value: tag, label: tag }))}
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
            <Text
              size="xs"
              c="dimmed"
            >
              Filtering by: {selectedTags.join(", ")}
            </Text>
            <Button
              variant="light"
              size="compact-xs"
              onClick={clearSelectedTags}
            >
              Clear Filters
            </Button>
          </Box>
        )}

        <Divider />

        <Box>
          <Group
            gap="xxs"
            align="center"
            mb="xs"
          >
            <IconCube
              size={16}
              style={{ display: "inline", marginRight: "4px" }}
            />
            <Text
              size="sm"
              fw={600}
            >
              Fixtures
            </Text>
          </Group>

          <MultiSelect
            placeholder="Select fixtures to filter"
            data={(fixture ? [...fixture.children] : []).map((child) => ({
              value: child.id,
              label: child.label,
            }))}
            value={[...selectedFixtures]}
            onChange={(fixtues) => setSelectedFixtures(fixtues)}
            size="xs"
            maxDropdownHeight={200}
            searchable
            clearable
          />
        </Box>

        {selectedFixtures.length > 0 && (
          <Box>
            <Text
              size="xs"
              c="dimmed"
              mb="xs"
            >
              Selected fixtures:
            </Text>
            <Stack gap="xs">
              {selectedFixtures.map((fixtureId: string) => {
                // Find the fixture with this ID to get its label
                const findFixture = (fixture: any, id: string): any => {
                  if (fixture.id === id) return fixture
                  for (const child of fixture.children) {
                    const found = findFixture(child, id)
                    if (found) return found
                  }
                  return null
                }
                const foundFixture = fixture
                  ? findFixture(fixture, fixtureId)
                  : null
                const label = foundFixture ? foundFixture.label : fixtureId

                return (
                  <Button
                    key={fixtureId}
                    variant="light"
                    size="compact-xs"
                    onClick={() => focusOnFixture(fixtureId)}
                    style={{ justifyContent: "flex-start" }}
                  >
                    📷 {label}
                  </Button>
                )
              })}
              <Button
                variant="outline"
                size="compact-xs"
                onClick={clearSelectedFixtures}
                c="dimmed"
              >
                Clear All
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  )
}

// -------------------------------------------------- //
// Export
// -------------------------------------------------- //
export default Menu
