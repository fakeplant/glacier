"use client"

import { ActionIcon, Box, Burger, Text, useMantineTheme } from "@mantine/core"
import classes from "./Layout.module.css"
import Menu from "../Menu/Menu"
import { useState } from "react"
import cx from "clsx"

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

  // State
  const [open, setOpen] = useState(false)

  return (
    <>
      <Box className={classes.menu}>
        <ActionIcon
          onClick={() => setOpen(!open)}
          radius="xl"
          size="xl"
          variant="default"
        >
          <Burger
            opened={open}
            onClick={() => {}}
            aria-label="Toggle navigation"
            size="sm"
          />
        </ActionIcon>
      </Box>
      <Box className={cx(classes.wrapper, open && classes.open)}>
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
