import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    // Attribution
    console.log("Like what you see? Hit me up https://plant.dev")
    
    // Redirect to iceberg
    throw redirect({
      to: '/iceberg'
    })
  },
})