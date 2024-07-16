"use client"

import { Center, Container, Loader } from "@mantine/core"

// -------------------------------------------------- //
// Loading
// -------------------------------------------------- //
export default function Loading() {
  return (
    <Center
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
      }}
    >
      <Loader
        color="black"
        type="dots"
      />
    </Center>
  )
}
