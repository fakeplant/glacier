import React, { Suspense, useRef } from "react"
import { Canvas } from "@react-three/fiber"
import Loading from "../Loading"
import Cameras from "../Cameras"
import Scene from "./Scene"
import { Grid } from "@react-three/drei"

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
      <Cameras />
      <Suspense fallback={<Loading />}>
        {/*<Scene />*/}
        <Grid
          infiniteGrid
          cellSize={1}
          sectionSize={10}
          fadeDistance={100}
          fadeStrength={5}
          sectionColor={"#03a9f4"}
          cellColor={"#d1e4f3"}
        />
      </Suspense>
    </Canvas>
  )
}

export default Iceberg
