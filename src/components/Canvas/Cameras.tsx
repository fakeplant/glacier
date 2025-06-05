import { useEffect, useRef } from "react"
import * as THREE from "three"
import {
  GizmoHelper,
  GizmoViewcube,
  OrbitControls,
  OrthographicCamera,
} from "@react-three/drei"
import { OrbitControls as OrbitControlsImpl } from "three-stdlib"
import { Vector3 } from "three"
import { useThree } from "@react-three/fiber"
import { useFixtureStore } from "../../hooks/useFixtureStore"
import { fixtureStore } from "../../lib/fixtureStore"
import { subscribe } from "valtio"

function Cameras() {
  const cameraControlsRef = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()
  const { setCameraTarget } = useFixtureStore()

  // Subscribe to desiredCameraTarget changes (avoids re-renders)
  useEffect(() => {
    const unsubscribe = subscribe(fixtureStore, () => {
      if (fixtureStore.desiredCameraTarget && cameraControlsRef.current && camera) {
        const { position, target, zoom } = fixtureStore.desiredCameraTarget

        // Animate to new position and target
        camera.position.set(position[0], position[1], position[2])
        cameraControlsRef.current.target.set(target[0], target[1], target[2])
        
        if (zoom && 'zoom' in camera) {
          ;(camera as any).zoom = zoom
          camera.updateProjectionMatrix()
        }

        cameraControlsRef.current.update()
        
        // Clear the desired target after applying it
        fixtureStore.desiredCameraTarget = undefined
      }
    })

    return unsubscribe
  }, [camera])

  // Throttle camera persistence to avoid excessive localStorage writes
  const throttleTimer = useRef<NodeJS.Timeout | null>(null)
  
  const handleCameraChange = () => {
    if (throttleTimer.current) {
      clearTimeout(throttleTimer.current)
    }
    
    throttleTimer.current = setTimeout(() => {
      if (cameraControlsRef.current && camera) {
        const controls = cameraControlsRef.current
        const cameraState = {
          position: [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
          target: [controls.target.x, controls.target.y, controls.target.z] as [number, number, number],
          zoom: 'zoom' in camera ? (camera as any).zoom : undefined
        }
        setCameraTarget(cameraState)
      }
    }, 100) // Only save after 100ms of no camera movement
  }

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
        onChange={handleCameraChange}
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
