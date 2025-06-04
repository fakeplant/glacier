import React, { useMemo } from 'react'
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
  Stack
} from '@mantine/core'
import { IconChevronDown } from '@tabler/icons-react'
import { useSnapshot } from 'valtio'
import { ParsedFixture } from '../../lib/fixtures'
import { fixtureStore } from '../../lib/fixtureStore'

interface FixtureTreeProps {
  // No props needed - uses Valtio store directly
}

interface TreeNode {
  value: string
  label: string
  fixture: ParsedFixture
  children?: TreeNode[]
}

function convertFixtureToTreeData(fixture: ParsedFixture, path = '', index = 0, depth = 0, maxDepth = 10): TreeNode {
  // Prevent infinite recursion with depth limiting
  if (depth > maxDepth) {
    console.warn('Max depth reached for fixture:', fixture.label, 'at depth:', depth)
    return {
      value: path ? `${path}/${fixture.label}-${index}` : fixture.label,
      label: fixture.label + ' (depth limit)',
      fixture,
      children: undefined
    }
  }
  
  const value = path ? `${path}/${fixture.label}-${index}` : fixture.label
  
  return {
    value,
    label: fixture.label,
    fixture,
    children: fixture.children.length > 0 
      ? fixture.children.map((child, childIndex) => convertFixtureToTreeData(child, value, childIndex, depth + 1, maxDepth))
      : undefined
  }
}

export function FixtureTree({}: FixtureTreeProps) {
  const snap = useSnapshot(fixtureStore)
  
  const treeData = useMemo(() => {
    const currentFixture = snap.allFixtures[snap.selectedTopLevelFixture]
    if (!currentFixture) return []
    
    console.log('Converting fixture to tree data:', currentFixture.label)
    try {
      const result = [convertFixtureToTreeData(currentFixture as any)]
      console.log('Tree conversion successful, nodes:', result.length)
      return result
    } catch (error) {
      console.error('Error converting fixture to tree data:', error)
      return []
    }
  }, [snap.allFixtures, snap.selectedTopLevelFixture])

  const tree = useTree({
    initialExpandedState: getTreeExpandedState(treeData, '*'),
    initialCheckedState: [], // Let tree manage its own state
  })
  
  const renderTreeNode = ({
    node,
    expanded,
    hasChildren,
    elementProps,
    tree,
  }: RenderTreeNodePayload) => {
    const checked = tree.isNodeChecked(node.value)
    const indeterminate = tree.isNodeIndeterminate(node.value)
    const treeNode = node as TreeNode
    
    const handleCheckboxClick = () => {
      if (!checked) {
        tree.checkNode(node.value)
        fixtureStore.toggleFixtureSelection(treeNode.fixture)
      } else {
        tree.uncheckNode(node.value)
        fixtureStore.toggleFixtureSelection(treeNode.fixture)
      }
    }

    return (
      <Group gap="xs" {...elementProps}>
        <Checkbox.Indicator
          checked={checked}
          indeterminate={indeterminate}
          onClick={() => !checked ? tree.checkNode(node.value) : tree.uncheckNode(node.value)}
        />

        <Group gap={5} onClick={() => tree.toggleExpanded(node.value)}>
          <Stack gap={0}>
            <Text size="xs">{node.label}</Text>
            {treeNode.fixture?.tags && treeNode.fixture.tags.length > 0 && (
              <Text size="xs" c="dimmed">
                {treeNode.fixture.tags.join(', ')}
              </Text>
            )}
          </Stack>

          {hasChildren && (
            <IconChevronDown
              size={14}
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          )}
        </Group>
      </Group>
    )
  }

  return (
    <Box style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <Group mb="xs">
        <Button 
          size="xs" 
          variant="light"
          onClick={() => {
            tree.checkAllNodes()
            fixtureStore.selectAllFixtures()
          }}
        >
          Check all
        </Button>
        <Button 
          size="xs" 
          variant="light"
          onClick={() => {
            tree.uncheckAllNodes()
            fixtureStore.clearAllFixtures()
          }}
        >
          Uncheck all
        </Button>
      </Group>

      <Tree
        tree={tree}
        data={treeData}
        levelOffset={23}
        expandOnClick={false}
        renderNode={renderTreeNode}
      />
      
      {snap.selectedFixtures.length > 0 && (
        <Text size="xs" c="dimmed" mt="xs">
          Selected: {snap.selectedFixtures.length} fixtures
        </Text>
      )}
    </Box>
  )
}

export default FixtureTree