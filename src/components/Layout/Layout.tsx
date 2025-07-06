import {
  ActionIcon,
  Box,
  Burger,
  Paper,
  Text,
  useMantineTheme,
} from "@mantine/core"
import classes from "./Layout.module.css"
import Menu from "../Menu/Menu"
import cx from "clsx"
import { useFixtureStore } from "../../hooks/useFixtureStore"

// -------------------------------------------------- //
// Props
// -------------------------------------------------- //
interface LayoutProps {
  children: React.ReactNode
}

// -------------------------------------------------- //
// Provider
// -------------------------------------------------- //
export function Layout(props: LayoutProps) {
  // Props
  const { children } = props

  // Theme
  const theme = useMantineTheme()

  // Store
  const { menuOpen, setMenuOpen } = useFixtureStore()

  return (
    <>
      <Box className={classes.menu}>
        <Paper
          radius="xl"
          p="xs"
          withBorder
          w="44px"
          h="44px"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Burger
            onClick={() => setMenuOpen(!menuOpen)}
            opened={menuOpen}
            aria-label="Toggle navigation"
            size="sm"
          />
        </Paper>
      </Box>
      <Box className={cx(classes.wrapper, menuOpen && classes.open)}>
        <Menu />
        {children}
      </Box>
      <Box className={classes.icon}>
        <Text
          fw="bold"
          tt="uppercase"
          style={{
            letterSpacing: "0.5em",
          }}
        >
          Glacier
        </Text>
      </Box>
    </>
  )
}

// -------------------------------------------------- //
// Export
// -------------------------------------------------- //
export default Layout
