import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import { Float } from "@react-three/drei";

export default function DescriptionOpenerOrange({ position }) {
  const handlerRef = useRef();

  useFrame(() => (handlerRef.current.rotation.y += 0.01));

  return (
    <mesh ref={handlerRef} scale={[0.05, 0.05, 0.05]} position={position}>
      <boxGeometry />
      <meshMatcapMaterial color="#00acff" />
    </mesh>
  );
}
