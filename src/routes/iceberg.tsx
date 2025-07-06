import { createFileRoute } from '@tanstack/react-router'
import Iceberg from '../components/Canvas/Iceberg/Iceberg'

export const Route = createFileRoute('/iceberg')({
  component: IcebergPage,
})

function IcebergPage() {
  return <Iceberg />
}