import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import {
  CameraControls,
  GizmoHelper,
  GizmoViewcube,
  Html,
  Hud,
  OrbitControls,
  OrthographicCamera,
  TrackballControls,
} from "@react-three/drei"
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { OrthographicCamera as OrthographicCameraImpl } from "three"
import { Vector3 } from "three"
import CameraControlsImpl from "camera-controls"
import { useFrame, useThree } from "@react-three/fiber"

function Cameras() {
  const cameraControlsRef = useRef<OrbitControlsImpl>(null)

  return (
    <>
      <GizmoHelper
        alignment="bottom-right"
        margin={[50, 50]}
      >
        <GizmoViewcube />
      </GizmoHelper>
      <OrthographicCamera
        makeDefault
        position={[10, 5, 0]}
        rotation={[-Math.PI / 2, 20, 0]}
        near={-10000}
        far={10000}
        zoom={40}
      />
      <OrbitControls
        enableDamping={false}
        makeDefault
        screenSpacePanning
        // onChange={(e) => console.log(e)}
        up={new Vector3(10, 0, 11)}
        ref={cameraControlsRef}
        maxZoom={10000}
        minZoom={-10000}
        target={[0, 5, 0]}
        mouseButtons={{
          LEFT: THREE.MOUSE.PAN,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
      />
    </>
  )
}

export default Cameras
