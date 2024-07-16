"use client"

import { redirect } from "next/navigation"

// -------------------------------------------------- //
// Component
// -------------------------------------------------- //
function HomePage() {
  // Attribution
  console.log("Like what you see? Hit me up https://plant.dev")

  // Redirect
  redirect("/iceberg")
}

// -------------------------------------------------- //
// Export
// -------------------------------------------------- //
export default HomePage
