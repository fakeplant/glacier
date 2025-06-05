import { createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import React from "react"
import { MantineProvider } from "@mantine/core"
import { theme } from "../lib/theme/theme"
import { resolver } from "../lib/theme/variables"
import { Notifications } from "@mantine/notifications"
import Layout from "../components/Layout/Layout"

// CSS
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"

export const Route = createRootRoute({
  component: () => (
    <MantineProvider
      theme={theme}
      cssVariablesResolver={resolver}
      forceColorScheme="light"
    >
      <Notifications />
      <Layout>
        <Outlet />
      </Layout>
      {/* <TanStackRouterDevtools /> */}
    </MantineProvider>
  ),
})
