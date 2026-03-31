'use client';

import { useGSAP } from "@gsap/react";
import { AdaptiveDpr, Preload, ScrollControls, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";

import { useThemeStore, usePortalStore } from "@stores";

import Preloader from "./Preloader";
import ProgressLoader from "./ProgressLoader";
import { ScrollHint } from "./ScrollHint";
import { SplinePreview } from "../experience/projects/SplinePreview";

const CanvasLoader = (props: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const backgroundColor = useThemeStore((state) => state.theme.color);
  const isProjectsActive = usePortalStore((state) => state.activePortalId === 'projects');
  const { progress } = useProgress();

  const [canvasStyle, setCanvasStyle] = useState<React.CSSProperties>({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0,
    overflow: "hidden",
    backgroundColor: "#111",
  });

  useEffect(() => {
    setCanvasStyle((prev) => ({
      ...prev,
      backgroundColor: isProjectsActive ? 'transparent' : backgroundColor,
    }));
  }, [backgroundColor, isProjectsActive]);

  useEffect(() => {
    if (!isMobile) {
      setCanvasStyle((prev) => ({
        ...prev,
        inset: '1rem',
        width: 'calc(100% - 2rem)',
        height: 'calc(100% - 2rem)',
      }));
    }
  }, [isMobile]);

  useGSAP(() => {
    if (progress >= 100) {
      gsap.to('.base-canvas', { opacity: 1, duration: 1.5, delay: 0.5 });
    }
  }, [progress]);

  // Fallback: force fade-in after 5s in case progress never hits 100
  useEffect(() => {
    const t = setTimeout(() => {
      gsap.to('.base-canvas', { opacity: 1, duration: 1.5 });
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-[100dvh] wrapper relative">
      {/* SplinePreview is a plain DOM overlay — must be OUTSIDE the Canvas */}
      <SplinePreview visible={isProjectsActive} />
      <div
        className="h-[100dvh] relative"
        ref={ref}
        style={{ backgroundColor: isProjectsActive ? 'transparent' : backgroundColor, transition: 'background-color 1s ease' }}
      >
        <Canvas
          className="base-canvas"
          style={canvasStyle}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
          performance={{ min: 0.5 }}
        >
          <Suspense fallback={null}>
            {!isProjectsActive && <color attach="background" args={[backgroundColor]} />}
            <ambientLight intensity={0.5} />
            <ScrollControls pages={4} damping={0.1} maxSpeed={2} distance={1} style={{ zIndex: 1 }}>
              {props.children}
              <Preloader />
            </ScrollControls>
            <Preload all />
          </Suspense>
          <AdaptiveDpr pixelated />
        </Canvas>
        <ProgressLoader progress={progress} />
      </div>
      <ScrollHint />
    </div>
  );
};

export default CanvasLoader;
