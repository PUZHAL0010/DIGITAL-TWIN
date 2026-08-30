import React from 'react';
import { useSimulationStore } from '../../state/useSimulationStore';

export const MovingVehicles3D: React.FC = () => {
  const vehicles = useSimulationStore(state => state.vehicles);

  return (
    <group name="moving-traffic">
      {vehicles.map((veh) => {
        // Base elevation above deck surface + dynamic vertical drop offset during structural failure
        const basePosY = 4.5;
        const currentY = basePosY + (veh.verticalOffset || 0);
        const posZ = veh.lane * 1.8; // Lane offset (-1.8 for westbound, +1.8 for eastbound)
        const rotY = veh.lane === 1 ? 0 : Math.PI; // Heading angle
        const rotZ = veh.pitchAngle || 0; // Dynamic tilt when span collapses
        const rotX = veh.rollAngle || 0;

        return (
          <group
            key={veh.id}
            position={[veh.positionX, currentY, posZ]}
            rotation={[rotX, rotY, rotZ]}
          >
            {/* 1. AERODYNAMIC SEDAN CAR */}
            {veh.vehicleClass === 'CAR' && (
              <group position={[0, 0.38, 0]}>
                {/* Lower Chassis / Body */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[4.2, 0.55, 1.8]} />
                  <meshStandardMaterial color={veh.colorHex} metalness={0.75} roughness={0.25} />
                </mesh>
                {/* Upper Greenhouse Cabin & Tinted Glass */}
                <mesh position={[-0.2, 0.48, 0]} castShadow>
                  <boxGeometry args={[2.2, 0.46, 1.45]} />
                  <meshStandardMaterial color="#0b1120" roughness={0.1} metalness={0.8} />
                </mesh>
                {/* Windshield Slope */}
                <mesh position={[0.95, 0.38, 0]} rotation={[0, 0, -Math.PI / 4]}>
                  <boxGeometry args={[0.35, 0.05, 1.4]} />
                  <meshStandardMaterial color="#0b1120" roughness={0.1} metalness={0.8} />
                </mesh>
                {/* Xenon LED Headlights */}
                <mesh position={[2.1, 0.08, 0.65]}>
                  <boxGeometry args={[0.05, 0.12, 0.28]} />
                  <meshBasicMaterial color="#e0f2fe" />
                </mesh>
                <mesh position={[2.1, 0.08, -0.65]}>
                  <boxGeometry args={[0.05, 0.12, 0.28]} />
                  <meshBasicMaterial color="#e0f2fe" />
                </mesh>
                {/* Red LED Taillights */}
                <mesh position={[-2.1, 0.12, 0.65]}>
                  <boxGeometry args={[0.05, 0.1, 0.28]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
                <mesh position={[-2.1, 0.12, -0.65]}>
                  <boxGeometry args={[0.05, 0.1, 0.28]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
                {/* Wheels (2 Axles) */}
                {[-1.3, 1.3].map((wx, idx) =>
                  [-0.88, 0.88].map((wz, jdx) => (
                    <group key={`car-w-${idx}-${jdx}`} position={[wx, -0.12, wz]}>
                      {/* Rubber Tire */}
                      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                        <cylinderGeometry args={[0.3, 0.3, 0.18, 16]} />
                        <meshStandardMaterial color="#090d16" roughness={0.92} />
                      </mesh>
                      {/* Silver Alloy Hubcap */}
                      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, wz > 0 ? 0.08 : -0.08]}>
                        <cylinderGeometry args={[0.18, 0.18, 0.05, 12]} />
                        <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.2} />
                      </mesh>
                    </group>
                  ))
                )}
              </group>
            )}

            {/* 2. TRANSIT EXPRESS BUS */}
            {veh.vehicleClass === 'BUS' && (
              <group position={[0, 1.4, 0]}>
                {/* Main Monocoque Bus Body */}
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[11.2, 2.6, 2.5]} />
                  <meshStandardMaterial color={veh.colorHex} metalness={0.6} roughness={0.35} />
                </mesh>
                {/* Tinted Passenger Windows Belt */}
                <mesh position={[0, 0.35, 0]}>
                  <boxGeometry args={[10.8, 1.05, 2.54]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
                </mesh>
                {/* Front Destination LED Board */}
                <mesh position={[5.55, 0.9, 0]}>
                  <planeGeometry args={[0.05, 0.3]} />
                  <meshBasicMaterial color="#f59e0b" />
                </mesh>
                {/* Roof HVAC Units */}
                <mesh position={[-1.5, 1.45, 0]} castShadow>
                  <boxGeometry args={[2.8, 0.35, 1.6]} />
                  <meshStandardMaterial color="#f8fafc" roughness={0.5} />
                </mesh>
                {/* Wheels (3 Axles: Front + Dual Rear) */}
                {[-3.8, -2.4, 3.8].map((wx, idx) =>
                  [-1.25, 1.25].map((wz, jdx) => (
                    <mesh key={`bus-w-${idx}-${jdx}`} position={[wx, -1.05, wz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                      <cylinderGeometry args={[0.45, 0.45, 0.28, 16]} />
                      <meshStandardMaterial color="#090d16" roughness={0.92} />
                    </mesh>
                  ))
                )}
              </group>
            )}

            {/* 3. LOGISTICS FREIGHT SEMI-TRUCK */}
            {(veh.vehicleClass === 'TRUCK' || veh.vehicleClass === 'HEAVY_TRUCK') && (
              <group position={[0, 1.5, 0]}>
                {/* Tractor Cab */}
                <group position={[3.6, 0.1, 0]}>
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[2.6, 2.8, 2.45]} />
                    <meshStandardMaterial color={veh.colorHex} metalness={0.7} roughness={0.3} />
                  </mesh>
                  {/* Chrome Grille */}
                  <mesh position={[1.32, -0.3, 0]}>
                    <boxGeometry args={[0.06, 1.4, 1.8]} />
                    <meshStandardMaterial color="#e2e8f0" metalness={0.98} roughness={0.1} />
                  </mesh>
                  {/* Windshield */}
                  <mesh position={[0.8, 0.65, 0]}>
                    <boxGeometry args={[1.1, 0.9, 2.3]} />
                    <meshStandardMaterial color="#0b1120" roughness={0.1} metalness={0.9} />
                  </mesh>
                  {/* Vertical Exhaust Stacks */}
                  {[-1.15, 1.15].map((ez, idx) => (
                    <mesh key={`exhaust-${idx}`} position={[-1.2, 0.8, ez]} castShadow>
                      <cylinderGeometry args={[0.06, 0.06, 1.8, 8]} />
                      <meshStandardMaterial color="#94a3b8" metalness={0.95} />
                    </mesh>
                  ))}
                </group>

                {/* Corrugated Logistics Trailer Container */}
                <group position={[-1.8, 0.45, 0]}>
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[8.4, 2.9, 2.45]} />
                    <meshStandardMaterial color="#334155" metalness={0.35} roughness={0.65} />
                  </mesh>
                  {/* Rear Door Frame */}
                  <mesh position={[-4.22, 0, 0]}>
                    <boxGeometry args={[0.05, 2.7, 2.3]} />
                    <meshStandardMaterial color="#1e293b" metalness={0.8} />
                  </mesh>
                </group>

                {/* Truck Wheels (5 Axles: 1 Steer + 2 Drive + 2 Trailer Tandem) */}
                {[4.2, 2.8, 1.6, -4.6, -3.2].map((wx, idx) =>
                  [-1.15, 1.15].map((wz, jdx) => (
                    <mesh key={`truck-w-${idx}-${jdx}`} position={[wx, -1.05, wz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                      <cylinderGeometry args={[0.48, 0.48, 0.28, 16]} />
                      <meshStandardMaterial color="#090d16" roughness={0.92} />
                    </mesh>
                  ))
                )}
              </group>
            )}

            {/* 4. HEAVY 8-AXLE OVERLOAD TRANSPORTER */}
            {veh.vehicleClass === 'OVERLOAD_FREIGHT' && (
              <group position={[0, 1.6, 0]}>
                {/* Front Heavy Haul Tractor Cab */}
                <mesh position={[8.5, 0.3, 0]} castShadow receiveShadow>
                  <boxGeometry args={[3.2, 3.0, 2.8]} />
                  <meshStandardMaterial color="#dc2626" metalness={0.8} roughness={0.25} />
                </mesh>

                {/* Multi-Axle Hydraulic Lowboy Platform Deck */}
                <mesh position={[-1.5, -0.4, 0]} castShadow receiveShadow>
                  <boxGeometry args={[17.0, 0.6, 3.2]} />
                  <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
                </mesh>

                {/* Heavy Industrial Cylindrical Transformer Cargo */}
                <group position={[-1.5, 1.1, 0]}>
                  <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[1.35, 1.35, 10.0, 32]} />
                    <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.2} />
                  </mesh>
                  {/* Steel Tie-Down Tension Bands */}
                  {[-3.5, -1.5, 0.5, 2.5].map((tx, idx) => (
                    <mesh key={`strap-${idx}`} position={[tx, 0, 0]}>
                      <cylinderGeometry args={[1.38, 1.38, 0.2, 32]} />
                      <meshStandardMaterial color="#f59e0b" metalness={0.9} />
                    </mesh>
                  ))}
                </group>

                {/* Flashing Amber Hazard Beacons */}
                <mesh position={[8.5, 1.9, 1.1]}>
                  <cylinderGeometry args={[0.1, 0.1, 0.18, 12]} />
                  <meshBasicMaterial color="#f59e0b" />
                </mesh>
                <mesh position={[8.5, 1.9, -1.1]}>
                  <cylinderGeometry args={[0.1, 0.1, 0.18, 12]} />
                  <meshBasicMaterial color="#f59e0b" />
                </mesh>

                {/* Multi-Axle Bogies (8 Axles total) */}
                {[-8.5, -7.0, -5.5, -4.0, 1.0, 2.5, 7.5, 9.0].map((wx, idx) =>
                  [-1.45, 1.45].map((wz, jdx) => (
                    <mesh key={`heavy-w-${idx}-${jdx}`} position={[wx, -1.05, wz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                      <cylinderGeometry args={[0.42, 0.42, 0.32, 16]} />
                      <meshStandardMaterial color="#090d16" roughness={0.92} />
                    </mesh>
                  ))
                )}
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};
