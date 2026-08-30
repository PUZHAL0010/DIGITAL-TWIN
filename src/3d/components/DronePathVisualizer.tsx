import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

// Default waypoints for a drone inspection flight path (bridge perimeter loop).
// These are used when no custom waypoints are provided via props.
const DEFAULT_WAYPOINTS: { id: string; position: [number, number, number] }[] = [
  { id: 'wp-0', position: [-18,  6,  0] },
  { id: 'wp-1', position: [ -9,  8,  4] },
  { id: 'wp-2', position: [  0,  7, -4] },
  { id: 'wp-3', position: [  9,  9,  4] },
  { id: 'wp-4', position: [ 18,  6,  0] },
  { id: 'wp-5', position: [  9,  5, -4] },
  { id: 'wp-6', position: [  0,  6,  4] },
  { id: 'wp-7', position: [ -9,  5, -4] },
];

interface DronePathVisualizerProps {
  /** Whether the drone scan overlay is visible. Defaults to true. */
  showDroneScan?: boolean;
  /** Whether the drone is in active (faster) flight mode. Defaults to true. */
  isDroneFlightActive?: boolean;
  /** Called each frame with the current flight progress value [0, 1). */
  onProgressUpdate?: (progress: number) => void;
  /** Custom waypoints; falls back to DEFAULT_WAYPOINTS when not provided or fewer than 2 points. */
  waypoints?: { id: string; position: [number, number, number] }[];
}

export const DronePathVisualizer: React.FC<DronePathVisualizerProps> = ({
  showDroneScan = true,
  isDroneFlightActive = true,
  onProgressUpdate,
  waypoints = DEFAULT_WAYPOINTS,
}) => {
  const droneRef = useRef<THREE.Group>(null);
  const rotorsRef = useRef<THREE.Group[]>([]);
  const laserConeRef = useRef<THREE.Mesh>(null);

  // Generate smooth 3D CatmullRom spline path through waypoints.
  // CatmullRomCurve3 requires at least 2 points — guard against empty waypoints.
  const curve = useMemo(() => {
    if (waypoints.length < 2) return null;
    const pts = waypoints.map(wp => new THREE.Vector3(...wp.position));
    return new THREE.CatmullRomCurve3(pts, true); // closed loop
  }, [waypoints]);

  // Trajectory line — use primitive to avoid R3F's lowercase <line> quirks
  const pathLine = useMemo(() => {
    if (!curve) return null;
    const points = curve.getPoints(100);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: '#00f2fe', transparent: true, opacity: 0.6 });
    return new THREE.Line(geometry, material);
  }, [curve]);

  useFrame(({ clock }) => {
    if (!showDroneScan || !droneRef.current || !curve) return;

    const t = clock.getElapsedTime();
    // Continuous orbital flight progress (or slow drift if inactive)
    const speed = isDroneFlightActive ? 0.04 : 0.008;
    const progress = (t * speed) % 1;
    onProgressUpdate?.(progress);

    // Get current position and tangent along curve
    const position = curve.getPointAt(progress);
    const tangent = curve.getTangentAt(progress);

    droneRef.current.position.copy(position);
    droneRef.current.lookAt(position.clone().add(tangent));

    // Spin 4 quadcopter rotors
    rotorsRef.current.forEach((rotor, i) => {
      if (rotor) {
        rotor.rotation.y += i % 2 === 0 ? 0.45 : -0.45;
      }
    });

    // Scanner beam pulsing
    if (laserConeRef.current) {
      const laserMat = laserConeRef.current.material as THREE.MeshBasicMaterial;
      if (laserMat) {
        laserMat.opacity = 0.15 + Math.sin(t * 8) * 0.08;
      }
    }
  });

  if (!showDroneScan || !curve) return null;

  return (
    <group>
      {/* Flight trajectory path line — primitive avoids R3F <line> type issues */}
      {pathLine && <primitive object={pathLine} />}

      {/* Waypoint spheres */}
      {waypoints.map((wp) => (
        <mesh key={wp.id} position={wp.position}>
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshBasicMaterial color="#00f2fe" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* 3D Quadcopter Drone Model */}
      <group ref={droneRef}>
        {/* Drone Main Airframe Body */}
        <mesh castShadow>
          <boxGeometry args={[0.5, 0.12, 0.5]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Top GPS Antenna puck */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.08, 16]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.8} />
        </mesh>

        {/* 4 Carbon Fiber Rotor Arms */}
        {[
          { pos: [0.28, 0, 0.28] as [number, number, number],  rotIdx: 0 },
          { pos: [-0.28, 0, 0.28] as [number, number, number], rotIdx: 1 },
          { pos: [-0.28, 0, -0.28] as [number, number, number],rotIdx: 2 },
          { pos: [0.28, 0, -0.28] as [number, number, number], rotIdx: 3 },
        ].map((arm) => (
          <group key={arm.rotIdx} position={arm.pos}>
            {/* Motor Pod */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.08, 12]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* Spinning Rotor Blades */}
            <group
              ref={(el) => {
                if (el) rotorsRef.current[arm.rotIdx] = el;
              }}
              position={[0, 0.1, 0]}
            >
              <mesh>
                <boxGeometry args={[0.42, 0.01, 0.04]} />
                <meshStandardMaterial color="#38bdf8" transparent opacity={0.8} />
              </mesh>
            </group>
          </group>
        ))}

        {/* 3-Axis Gimbal Camera System */}
        <group position={[0, -0.12, 0.15]}>
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshStandardMaterial color="#1e293b" metalness={0.9} />
          </mesh>
          {/* Camera Lens */}
          <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.04, 16]} />
            <meshBasicMaterial color="#00f2fe" />
          </mesh>
        </group>

        {/* LiDAR Scanning Light Frustum / Cone */}
        <mesh
          ref={laserConeRef}
          position={[0, -2.5, 1.2]}
          rotation={[Math.PI / 4, 0, 0]}
        >
          <coneGeometry args={[2.2, 5.0, 16, 1, true]} />
          <meshBasicMaterial
            color="#00f2fe"
            transparent
            opacity={0.18}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
};
