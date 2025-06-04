import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mothership')({
  component: MothershipPage,
})

function MothershipPage() {
  return null
}