import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import "./style.css";

import { LoadingScreen } from "./Components/CustomLoader.jsx";
import Experience from "./Experience.jsx";

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
          zoom: 200,
        }}
      >
        <Suspense fallback={null}>{start && <Experience />}</Suspense>
      </Canvas>
      <LoadingScreen started={start} onStarted={() => setStart(true)} />
    </>
  );
}
