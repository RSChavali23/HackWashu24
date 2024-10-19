import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import './LidarModel.css'; // Import CSS for styling

function Model() {
  const { scene } = useGLTF('/bitch.glb');
  return <primitive object={scene} />;
}

export default function LidarModel() {
  return (
    <Canvas className="full-screen-canvas">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={null}>
        <Model />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}