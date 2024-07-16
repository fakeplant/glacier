"use client"

import {
  Box,
  rem,
  SegmentedControl,
  Stack,
  useMantineTheme,
  VisuallyHidden,
} from "@mantine/core"
import classes from "./Menu.module.css"
import cx from "clsx"
import React, { useEffect, useState } from "react"
import { IconChartAreaLine, IconCircleHalfVertical } from "@tabler/icons-react"
import { Car } from "../../lib/types"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

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

  // Theme
  const theme = useMantineTheme()

  // Icons
  const iconProps = {
    style: { width: rem(20), height: rem(20), display: "block" },
    stroke: 1.5,
  }

  // Control
  const [car, setCar] = useState<Car>(Car.Iceberg)

  // Router
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/mothership") {
      setCar(Car.Mothership)
    } else {
      setCar(Car.Iceberg)
    }
  })

  const setCarRoute = (car: Car) => {
    router.push(`/${car.toLowerCase()}`)
  }

  return (
    <Box className={cx(classes.wrapper, { open: open })}>
      <Stack className={classes.select}>
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
      <Stack className={classes.stack}></Stack>
    </Box>
  )
}

// -------------------------------------------------- //
// Export
// -------------------------------------------------- //
export default Menu
