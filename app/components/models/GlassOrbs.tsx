import { Float, Icosahedron } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const GlassOrbs = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Slowly rotate the entire group of orbs
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
    }
  });

  // Premium frosted glass material
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    transmission: 1, // fully transparent glass
    opacity: 1,
    metalness: 0,
    roughness: 0.1, // slightly frosted
    ior: 1.5, // index of refraction (glass)
    thickness: 2, // volume for refraction
    clearcoat: 1,
    clearcoatRoughness: 0.1,
  });

  return (
    <group ref={groupRef} position={[0, -5, -5]}>
      {/* Orb 1 - Large and slow */}
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Icosahedron args={[3, 4]} position={[-4, 2, -2]}>
          <primitive object={glassMaterial} attach="material" />
        </Icosahedron>
      </Float>

      {/* Orb 2 - Medium and slightly faster */}
      <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
        <Icosahedron args={[2, 4]} position={[5, -1, 1]}>
          <primitive object={glassMaterial} attach="material" />
        </Icosahedron>
      </Float>

      {/* Orb 3 - Small and distant */}
      <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
        <Icosahedron args={[1.5, 4]} position={[1, 4, -4]}>
          <primitive object={glassMaterial} attach="material" />
        </Icosahedron>
      </Float>

      {/* Hidden colored lights to create the 'Aurora' glow through the glass */}
      <pointLight position={[-5, 0, 5]} color="#0ea5e9" intensity={50} distance={20} /> {/* Cyan */}
      <pointLight position={[5, -2, 5]} color="#db2777" intensity={40} distance={20} /> {/* Magenta */}
    </group>
  );
};

export default GlassOrbs;
