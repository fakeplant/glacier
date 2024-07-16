import React, { Suspense, useEffect, useState } from "react"
import { LineCurve3, TubeGeometry, Vector3 } from "three"

import { extend, useFrame, useThree } from "@react-three/fiber"
import {
  Bounds,
  GizmoHelper,
  GizmoViewcube,
  Grid,
  OrbitControls,
  useBounds,
} from "@react-three/drei"
import Papa from "papaparse"
import edges from "../../../assets/car/edges.csv"
import vertices from "../../../assets/car/vertices.csv"

extend({ TubeGeometry })

const Edge = ({ path }: { path: any }) => {
  // This reference will give us direct access to the THREE.Mesh object
  // const ref = useRef<THREE.Mesh>(null!)
  // Hold state for hovered and clicked events
  const [hovered, hover] = useState(false)
  const [clicked, click] = useState(false)
  // Rotate mesh every frame, this is outside of React without overhead
  // useFrame((state, delta) => (ref.current.rotation.x += 0.01))

  const diameter = 0.05

  return (
    <mesh
      castShadow
      // ref={ref}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => hover(true)}
      onPointerOut={(event) => hover(false)}
    >
      <meshStandardMaterial color={hovered || clicked ? "blue" : "white"} />
      <tubeGeometry args={[path, 64, diameter, 8, false]} />
    </mesh>
  )
}
function Scene() {
  const [edgeData, setEdgeData] = useState<any[]>([])
  const [verticesData, setVerticesData] = useState<any[]>([])
  const [edgeMap, setEdgeMap] = useState<Map<string, object>>(new Map())
  const [verticesMap, setVerticesMap] = useState<Map<string, object>>(new Map())

  const state = useThree()
  console.log(state.camera)

  console.log("edges", edges)

  useEffect(() => {
    Papa.parse(edges, {
      download: true,
      header: true,
      complete: (result) => {
        setEdgeData(result.data)
        // @ts-ignore
        const map = new Map(result.data.map((edge) => [edge.ID, edge]))
        console.log("map")
        console.log(map)
        // @ts-ignore
        setEdgeMap(map)

        Papa.parse(vertices, {
          download: true,
          header: true,
          complete: (result) => {
            setVerticesData(result.data)
            // @ts-ignore
            const map = new Map(
              // @ts-ignore
              result.data.map((vertex) => [vertex.ID, vertex])
            )
            // @ts-ignore
            setVerticesMap(map)
          },
        })
      },
    })
  }, [])

  return (
    <>
      <ambientLight intensity={1.5} />
      {/*<fog*/}
      {/*  attach="fog"*/}
      {/*  args={["white", 0, 40]}*/}
      {/*/>*/}
      <directionalLight
        castShadow
        position={[2.5, 8, 5]}
        intensity={1.5}
        shadow-mapSize={1024}
      />

      {/*<SelectToZoom>*/}
      {edgeData.map((edge) => {
        // return null
        console.log("edge")
        console.log(edge)
        console.log("verticesMap")
        console.log(verticesMap)

        if (!verticesMap) {
          return null
        }

        // @ts-ignore
        const startVertex = verticesMap.get(edge["Low"])
        // @ts-ignore
        const endVertex = verticesMap.get(edge["High"])

        console.log("startVertex")
        console.log(startVertex)

        if (!startVertex || !endVertex) {
          return null
        }

        // @ts-ignore
        const startVector3 = new Vector3(
          // @ts-ignore
          startVertex["X"] / 1000000, // meters
          // @ts-ignore
          startVertex["Y"] / 1000000, // meters
          // @ts-ignore
          startVertex["Z"] / 1000000 // meters
        )

        // @ts-ignore
        const endVector3 = new Vector3(
          // @ts-ignore
          endVertex["X"] / 1000000, // meters
          // @ts-ignore
          endVertex["Y"] / 1000000, // meters
          // @ts-ignore
          endVertex["Z"] / 1000000 // meters
        )

        console.log("startVector3")
        console.log(startVector3)
        console.log("endVector3")
        console.log(endVector3)

        const diameter = 0.05
        const path = new LineCurve3(startVector3, endVector3)
        return (
          <Edge
            key={edge["ID"]}
            path={path}
          />
        )
      })}

      <Grid
        infiniteGrid
        cellSize={1}
        sectionSize={10}
        fadeDistance={100}
        fadeStrength={5}
        sectionColor={"#03a9f4"}
        cellColor={"#d1e4f3"}
      />
    </>
  )
}

export default Scene
