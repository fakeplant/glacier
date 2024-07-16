import React, { useEffect, useRef } from "react"
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
        near={-100}
        far={100}
        zoom={40}
      />
      <OrbitControls
        enableDamping={false}
        makeDefault
        screenSpacePanning
        // onChange={(e) => console.log(e)}
        up={new Vector3(10, 0, 11)}
        ref={cameraControlsRef}
        maxZoom={100}
        minZoom={40}
        target={[0, 5, 0]}
      />
      <Hud renderPriority={2}>
        <OrthographicCamera
          makeDefault
          position={[0, 0, 10]}
        />
        <Html fullscreen>
          {/*<button onClick={() => cameraControlsRef.current?.setPolarAngle(0)}>*/}
          {/*  set*/}
          {/*</button>*/}
          {/*<button onClick={() => controlsRef.current?.saveState()}>save</button>*/}
        </Html>
      </Hud>
    </>
  )
}

export default Cameras
