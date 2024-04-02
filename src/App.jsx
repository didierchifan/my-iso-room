import { useState, Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import "./style.css";

import { LoadingScreen } from "./Components/CustomLoader.jsx";
import Experience from "./Experience.jsx";

export default function App() {
  const [start, setStart] = useState(false);
  const [caca, setCaca] = useState(false);

  const ambientLightRef = useRef(null);

  const handleCheckboxClick = (e) => {
    const event = new CustomEvent("customCheckboxClick", {
      detail: { isChecked: e.target.checked },
    });
    window.dispatchEvent(event);
  };

  const handleCaca = (e) => {
    const event = new CustomEvent("customCacaClick", {
      detail: { text: e.target.innerHTML },
    });
    window.dispatchEvent(event);
  };

  const handleChangeInput = (e) => {
    const event = new CustomEvent("handleInput", {
      detail: { inputText: e.target.value },
    });
    window.dispatchEvent(event);
  };

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
        <Suspense fallback={null}>
          {start && (
            <Experience ambientLightRef={ambientLightRef} caca={caca} />
          )}
        </Suspense>
      </Canvas>

      <div style={{ position: "absolute", top: 0 }} className="text-container">
        <input onChange={handleChangeInput} type="text" />
        <p onClick={handleCaca}> CACACACACACACAACA</p>
        <label className="switch-toggle-container">
          <input
            onClick={handleCheckboxClick}
            ref={ambientLightRef}
            className="switch-toggle-input"
            type="checkbox"
          />
          <span className="switch-toggle"></span>
        </label>
      </div>

      <LoadingScreen started={start} onStarted={() => setStart(true)} />
    </>
  );
}
