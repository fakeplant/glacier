// CSS
import "@mantine/core/styles.css"
import "@mantine/notifications/styles.css"

import React from "react"
import { ColorSchemeScript, MantineProvider } from "@mantine/core"
import { theme } from "../assets/theme/theme"
import { resolver } from "../assets/theme/variables"
import { Notifications } from "@mantine/notifications"
import Layout from "../components/Layout/Layout"

// -------------------------------------------------- //
// Metadata
// -------------------------------------------------- //
export const metadata = {
  title: "Glacier",
  description: "This is a description", // TODO
}

// -------------------------------------------------- //
// Props
// -------------------------------------------------- //
interface RootLayoutProps {
  children: React.ReactNode
}

// -------------------------------------------------- //
// Component
// -------------------------------------------------- //
function RootLayout(props: RootLayoutProps) {
  // Props
  const { children } = props

  return (
    <html lang="en">
      <head>
        <ColorSchemeScript forceColorScheme="light" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider
          theme={theme}
          cssVariablesResolver={resolver}
          forceColorScheme="light"
        >
          <Notifications />
          <Layout>{children}</Layout>
        </MantineProvider>
      </body>
    </html>
  )
}

// -------------------------------------------------- //
// Export
// -------------------------------------------------- //
export default RootLayout
