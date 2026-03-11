import React from 'react';

export const CHARACTER_STYLES = [
  { id: 0, skinColor: "#e0ac69", boardColor: "#c8a96e", shirtColor: "#f8fafc", pantsColor: "#38bdf8", hatColor: "#ef4444", wheelColor: "#1f2937" }, // Player default
  { id: 1, skinColor: "#8d5524", boardColor: "#10b981", shirtColor: "#fcd34d", pantsColor: "#1e40af", hatColor: "#10b981", wheelColor: "#ef4444" },
  { id: 2, skinColor: "#ffdbac", boardColor: "#8b5cf6", shirtColor: "#111827", pantsColor: "#9ca3af", hatColor: "#8b5cf6", wheelColor: "#10b981" },
  { id: 3, skinColor: "#c68642", boardColor: "#ef4444", shirtColor: "#22c55e", pantsColor: "#f97316", hatColor: "#000000", wheelColor: "#facc15" },
  { id: 4, skinColor: "#f1c27d", boardColor: "#3b82f6", shirtColor: "#ec4899", pantsColor: "#fcd34d", hatColor: "#3b82f6", wheelColor: "#8b5cf6" },
  { id: 5, skinColor: "#3d2c20", boardColor: "#f97316", shirtColor: "#ffffff", pantsColor: "#111827", hatColor: "#f97316", wheelColor: "#3b82f6" },
];

export default function Character({ groupRef, styleIndex = 0, isBoosted = false }) {
  const style = CHARACTER_STYLES[styleIndex] || CHARACTER_STYLES[0];
  const { skinColor, boardColor, shirtColor, pantsColor, hatColor, wheelColor } = style;

  const activeBoardColor = isBoosted ? "#22c55e" : boardColor;
  const boardEmissive = isBoosted ? "#22c55e" : "#000000";
  const boardIntensity = isBoosted ? 2 : 0;

  return (
    <group ref={groupRef}>
      {/* Realistic Skateboard */}
      <group position={[0, -0.35, 0]}>
        {/* === DECK === */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.85, 0.07, 2.0]} />
          <meshStandardMaterial color={activeBoardColor} emissive={boardEmissive} emissiveIntensity={boardIntensity} roughness={0.6} metalness={0.0} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.83, 0.01, 1.98]} />
          <meshStandardMaterial color="#111827" roughness={1.0} metalness={0.0} />
        </mesh>
        <mesh castShadow position={[0, 0.07, -0.9]} rotation={[-0.22, 0, 0]}>
          <boxGeometry args={[0.82, 0.07, 0.3]} />
          <meshStandardMaterial color={activeBoardColor} emissive={boardEmissive} emissiveIntensity={boardIntensity} roughness={0.6} />
        </mesh>
        <mesh castShadow position={[0, 0.07, 0.9]} rotation={[0.22, 0, 0]}>
          <boxGeometry args={[0.82, 0.07, 0.3]} />
          <meshStandardMaterial color={activeBoardColor} emissive={boardEmissive} emissiveIntensity={boardIntensity} roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.15, 0.012, 1.6]} />
          <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1.5} roughness={0.1} />
        </mesh>

        {/* === TRUCK FRONT === */}
        <group position={[0, -0.09, -0.65]}>
          <mesh>
            <boxGeometry args={[0.78, 0.06, 0.22]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.1, 12]} />
            <meshStandardMaterial color="#6b7280" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.2, 0.1, 0.18]} />
            <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* === TRUCK REAR === */}
        <group position={[0, -0.09, 0.65]}>
          <mesh>
            <boxGeometry args={[0.78, 0.06, 0.22]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.04, 1.1, 12]} />
            <meshStandardMaterial color="#6b7280" metalness={0.95} roughness={0.1} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.2, 0.1, 0.18]} />
            <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
          </mesh>
        </group>

        {/* === WHEELS === */}
        {[
          [-0.52, -0.15, -0.65],
          [0.52, -0.15, -0.65],
          [-0.52, -0.15, 0.65],
          [0.52, -0.15, 0.65],
        ].map((pos, i) => (
          <group key={i} position={pos}>
            <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.17, 0.17, 0.18, 20]} />
              <meshStandardMaterial color={wheelColor} roughness={0.9} metalness={0.0} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.2, 12]} />
              <meshStandardMaterial color="#d1d5db" metalness={1.0} roughness={0.1} />
            </mesh>
            <mesh position={[i % 2 === 0 ? -0.1 : 0.1, 0, 0]}>
              <sphereGeometry args={[0.025, 8, 8]} />
              <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={2} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Human Character */}
      <mesh name="leftLeg" position={[-0.2, 0.2, 0]} castShadow>
        <boxGeometry args={[0.25, 0.8, 0.25]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>
      <mesh name="rightLeg" position={[0.2, 0.2, 0]} castShadow>
        <boxGeometry args={[0.25, 0.8, 0.25]} />
        <meshStandardMaterial color={pantsColor} />
      </mesh>

      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.75, 0.9, 0.4]} />
        <meshStandardMaterial color={shirtColor} />
      </mesh>

      <group name="leftArm" position={[-0.45, 1.2, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.18]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      <group name="rightArm" position={[0.45, 1.2, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.18, 0.6, 0.18]} />
          <meshStandardMaterial color={shirtColor} />
        </mesh>
        <mesh position={[0, -0.65, 0]} castShadow>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      <group position={[0, 1.9, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.48, 0.15, 0.48]} />
          <meshStandardMaterial color={hatColor} />
        </mesh>
        <mesh position={[0, -0.05, -0.3]} castShadow>
          <boxGeometry args={[0.45, 0.05, 0.35]} />
          <meshStandardMaterial color={hatColor} />
        </mesh>
      </group>
    </group>
  );
}
