import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { BridgeScene } from './BridgeScene';

export const BridgeCanvas: React.FC = () => {
  return (
    <div className="w-full h-full relative bg-[#000000] overflow-hidden">
      <Canvas
        shadows
        camera={{
          position: [0, 8, 26],
          fov: 48,
          near: 0.1,
          far: 500,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full"
      >
        <color attach="background" args={['#000000']} />
        <fog attach="fog" args={['#000000', 35, 95]} />
        <Suspense fallback={null}>
          <BridgeScene />
        </Suspense>
      </Canvas>
    </div>
  );
};
