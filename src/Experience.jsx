import { Sparkles, Center, CameraControls } from "@react-three/drei";
import { useControls, button, buttonGroup, folder } from "leva";
import { Perf } from "r3f-perf";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import { Model } from "./3dModel";

export default function Experience() {
  //performance monitor
  const { perfMonitor } = useControls({
    perfMonitor: false,
  });

  //leva tweaks

  const { bgcolor, goToSleep, spotLampOn } = useControls({
    goToSleep: false,
    bgcolor: {
      value: "#fcc5c5",
    },
  });

  const lamps = useControls("LampLights", {
    donutLight: {
      value: 10,
      step: 0.2,
      min: 0,
      max: 25,
    },
    ackjaLampOn: true,
    spotLampOn: true,
  });

  const tvControls = useControls("tvLightControls", {
    color: "#7ac9ff",
    strength: {
      value: 25,
      step: 0.2,
      min: 0,
      max: 50,
    },
  });

  const spotlight = useMemo(() => new THREE.SpotLight("#fff"), []);

  const cameraControlsRef = useRef();

  ///////CAMERA CONTROLS LEVA///////
  const { DEG2RAD } = THREE.MathUtils;
  const {
    minDistance,
    enabled,
    verticalDragToForward,
    dollyToCursor,
    infinityDolly,
  } = useControls({
    phiGrp: buttonGroup({
      label: "rotate vertical",
      opts: {
        "+20º": () => cameraControlsRef.current?.rotate(0, 20 * DEG2RAD, true),
        "-20º": () => cameraControlsRef.current?.rotate(0, -20 * DEG2RAD, true),
      },
    }),
    thetaGrp: buttonGroup({
      label: "rotate horizontal",
      opts: {
        "+45º": () => cameraControlsRef.current?.rotate(45 * DEG2RAD, 0, true),
        "-45º": () => cameraControlsRef.current?.rotate(-45 * DEG2RAD, 0, true),
      },
    }),
    resetCamera: button(() => cameraControlsRef.current?.reset(true)),
  });
  ///////CAMERA CONTROLS LEVA///////

  // const { positionX, positionY, positionZ, rotationX, rotationY, rotationZ } =
  //   useControls({
  //     positionX: { value: 1, step: 0.01, min: -5, max: 5 },
  //     positionY: { value: 1, step: 0.01, min: -5, max: 5 },
  //     positionZ: { value: 1, step: 0.01, min: -5, max: 5 },
  //     rotationX: { value: 1, step: 0.01, min: -5, max: 5 },
  //     rotationY: { value: 1, step: 0.01, min: -5, max: 5 },
  //     rotationZ: { value: 1, step: 0.01, min: -5, max: 5 },
  //   });

  return (
    <>
      {/* performance monitor */}
      {perfMonitor ? <Perf position="top-left" /> : null}

      {/* background color */}
      <color args={[bgcolor]} attach="background" />

      <CameraControls
        ref={cameraControlsRef}
        makeDefault={true}
        //up-down limits
        minPolarAngle={-0.5}
        maxPolarAngle={Math.PI / 2}
        //left-right limits
        azimuthAngle={5.5}
        minAzimuthAngle={Math.PI * 2 - 1.57}
        maxAzimuthAngle={Math.PI * 2}
      />

      <ambientLight intensity={goToSleep ? 0.1 : 2.3} />

      <Sparkles
        size={3}
        scale={[0.4, 0.4, 0.4]}
        position-y={-1}
        position-x={-0.3}
        position-z={-0.6}
        speed={0.3}
        count={50}
      />

      {/* tv ambient light */}
      <rectAreaLight
        width={1.0}
        height={0.5}
        intensity={tvControls.strength}
        color={tvControls.color}
        position-x={-0.08}
        position-y={-0.11}
        position-z={-1.92}
        rotation-x={3.12}
        rotation-y={3.15}
        rotation-z={0}
      />

      {/* ikea donut light */}
      <rectAreaLight
        width={0.3}
        height={0.3}
        position={[-1.14, 0.53, -1.75]}
        intensity={lamps.donutLight}
        color={"#ff8f00"}
      />

      {/* <mesh
        position-x={positionX}
        position-y={positionY}
        position-z={positionZ}
        rotation-x={rotationX}
        rotation-y={rotationY}
        rotation-z={rotationZ}
        visible={true}
      >
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={"red"} />
      </mesh> */}

      {/* ikea lamp light */}

      {/* laptop light */}
      {/* <rectAreaLight
        width={0.1}
        height={0.1}
        intensity={500}
        color={"#2004fc"}
        position={[1.551, 1, -0.502]}
        rotation={[Math.PI / 2, -0.254, Math.PI / 2]}
      /> */}

      <pointLight
        position-x={-1.88}
        position-y={0.9}
        position-z={-0.43}
        intensity={lamps.ackjaLampOn ? 5 : 0}
        color={"#fff59f"}
        distance={1.5}
        decay={0.5}
      />

      {/* painting spotlight */}
      <group position-z={-0.55}>
        <primitive
          object={spotlight}
          position-x={2.03}
          position-y={1.7}
          position-z={0}
          intensity={lamps.spotLampOn ? 80 : 0}
          decay={0.5}
          distance={1.68}
          angle={1.2}
          penumbra={0.5}
        />
        <primitive
          object={spotlight.target}
          position={[0.1, 0.2, 0]}
          rotation={[Math.PI / 2, Math.PI / 2, Math.PI / 2]}
        />
      </group>

      {/* room 3dModel */}
      <Center>
        <Model position-y={[1]} cameraControlsRef={cameraControlsRef} />
      </Center>
    </>
  );
}
