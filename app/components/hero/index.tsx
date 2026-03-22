'use client';

import { Text } from "@react-three/drei";

import { useProgress } from "@react-three/drei";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import WindowModel from "../models/WindowModel";
import { Space } from "../models/Space";
import TextWindow from "./TextWindow";
import { TypingText } from "./TypingText";

const Hero = () => {
  const titleRef = useRef<THREE.Group>(null);
  const { progress } = useProgress();

  useEffect(() => {
    if (progress === 100 && titleRef.current) {
      gsap.fromTo(titleRef.current.position, {
        y: -10,
        duration: 1,
      }, {
        y: 0,
        duration: 3
      });
    }
  }, [progress]);

  const fontProps = {
    font: "./soria-font.ttf",
    fontSize: 1.2,
  };

  return (
    <>
      <group position={[0, 2, -10]} ref={titleRef}>
        <Text position={[0, 1, 0]} {...fontProps} anchorX="center" anchorY="bottom" textAlign="center" lineHeight={1}>
          {"Hi, I am\nAnand Singh"}
        </Text>
        <TypingText position={[0, -0.2, 0]} fontProps={{ ...fontProps, fontSize: 0.5, anchorX: "center", anchorY: "top" }} />
      </group>
      <Space position={[-50, -200, -50]} scale={250} />
      <group position={[0, -25, 5.69]}>
        <pointLight castShadow position={[1, 1, -2.5]} intensity={60} distance={10}/>
        <WindowModel receiveShadow/>
        <TextWindow/>
      </group>
    </>
  );
};

export default Hero;
