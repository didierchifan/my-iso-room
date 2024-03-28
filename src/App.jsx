import "./style.css";

import { Canvas } from "@react-three/fiber";
import Experience from "./Experience.jsx";
import { useEffect, useState } from "react";

import { Suspense } from "react";
import { LoadingScreen } from "./Components/CustomLoader.jsx";
import { OrthographicCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

export default function App() {
  const [start, setStart] = useState(false);

  return (
    <>
      <Canvas
        className="r3f"
        flat
        orthographic
        camera={{
          fov: 45,
          near: 0.1,
          far: 100,
          position: [-2.5, 1, 2.5],
          zoom: 160,
        }}
      >
        <Suspense fallback={null}>{start && <Experience />}</Suspense>
      </Canvas>
      <LoadingScreen started={start} onStarted={() => setStart(true)} />
    </>
  );
}
