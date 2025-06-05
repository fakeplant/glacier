import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  Checkbox,
  getTreeExpandedState,
  Group,
  RenderTreeNodePayload,
  Tree,
  useTree,
  Text,
  Stack,
  ScrollArea,
  Combobox,
  TooltipGroup,
  TextInput,
} from "@mantine/core"
import { IconChevronDown } from "@tabler/icons-react"
import { useSnapshot } from "valtio"
import { ParsedFixture } from "../../lib/fixtures"
import { fixtureStore } from "../../lib/fixtureStore"
import { useFixtureStore } from "@/hooks/useFixtureStore"

interface FixtureTreeProps {
  // No props needed - uses Valtio store directly
}

export function FixtureTree({}: FixtureTreeProps) {
  const { fixture, selectedFixtures, setSelectedFixtures } = useFixtureStore()

  if (!fixture) {
    return null
  }

  const handleClick = (value: string) => {
    const selected = selectedFixtures.some((fixture) => fixture.label === value)
    if (selected) {
      setSelectedFixtures(
        selectedFixtures.filter((fixture) => fixture.label !== value)
      )
    } else {
      const newFixture = fixture.children.find((item) => item.label === value)
      if (newFixture) {
        setSelectedFixtures([...selectedFixtures, newFixture])
      }
    }
  }

  const [filterValue, setFilterValue] = useState("")
  const filteredChildren = useMemo(() => {
    if (!filterValue) return fixture.children
    return fixture.children.filter((item) =>
      item.label.toLowerCase().includes(filterValue.toLowerCase())
    )
  }, [fixture.children, filterValue])

  return (
    <Stack
      gap={0}
      style={{ display: "flex", minHeight: "0", flex: 1 }}
      h="100%"
      mah="100%"
      mx="-xs"
    >
      <TextInput
        value={filterValue}
        onChange={(event) => setFilterValue(event.currentTarget.value)}
        placeholder="Search..."
        size="xs"
        allowClear
      />
      <ScrollArea
        w="100%"
        mt="xs"
        style={{ flex: 1, minHeight: "0px" }}
      >
        <Combobox>
          <Combobox.Options>
            {filteredChildren.map((item, index) => (
              <Combobox.Option
                key={item.label + index}
                value={item.label}
                onClick={() => handleClick(item.label)}
                selected={selectedFixtures.some(
                  (fixture) => fixture.label === item.label
                )}
              >
                <Stack gap={0}>
                  <Text
                    fw="600"
                    size="xs"
                  >
                    {item.label}
                  </Text>
                  <Group gap="xs">
                    {item.tags.map((tag) => (
                      <Text
                        size="xs"
                        c="dimmed"
                        key={tag}
                        style={{ marginRight: 4 }}
                      >
                        {tag}
                      </Text>
                    ))}
                  </Group>
                </Stack>
              </Combobox.Option>
            ))}{" "}
            {filteredChildren.length === 0 && (
              <Combobox.Empty>Nothing found</Combobox.Empty>
            )}
          </Combobox.Options>
        </Combobox>
      </ScrollArea>
    </Stack>
  )
}

export default FixtureTree
