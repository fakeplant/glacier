import { Suspense, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import { Grid } from "@react-three/drei"
import Loading from "../Loading"
import Scene from "./Scene"
import Cameras from "../Cameras"

function Iceberg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  return (
    <Canvas
      ref={canvasRef}
      shadows
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <Suspense fallback={<Loading />}>
        <Scene />
        <Grid
          infiniteGrid
          cellSize={10}
          sectionSize={100}
          fadeDistance={1000}
          fadeStrength={5}
          sectionColor={"#03a9f4"}
          cellColor={"#d1e4f3"}
        />
        <Cameras />
      </Suspense>
    </Canvas>
  )
}

export default Iceberg
