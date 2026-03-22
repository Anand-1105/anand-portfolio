'use client';

import { useGSAP } from "@gsap/react";
import { AdaptiveDpr, Preload, ScrollControls, useProgress } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { Suspense, useEffect, useRef, useState } from "react";
import { isMobile } from "react-device-detect";

import { useThemeStore } from "@stores";

import Preloader from "./Preloader";
import ProgressLoader from "./ProgressLoader";
import { ScrollHint } from "./ScrollHint";
import { ProjectsBackground } from "../experience/projects/ProjectsBackground";
import { ClearAlphaController } from "./ClearAlphaController";

const CanvasLoader = (props: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundColor = useThemeStore((state) => state.theme.color);
  const { progress } = useProgress();
  const [canvasStyle, setCanvasStyle] = useState<React.CSSProperties>({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0,
    overflow: "hidden",
  });

  useEffect(() => {
    if (!isMobile) {
      setCanvasStyle((prev) => ({
        ...prev,
        inset: '1rem',
        width: 'calc(100% - 2rem)',
        height: 'calc(100% - 2rem)',
      }));
    } else {
      setCanvasStyle((prev) => ({
        ...prev,
      }));
    }
  }, [isMobile]);

  useGSAP(() => {
    if (progress >= 100) {
      gsap.to('.base-canvas', { opacity: 1, duration: 1.5, delay: 0.5 });
    }
  }, [progress]);

  const noiseOverlayStyle = {
    backgroundBlendMode: "soft-light",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23a)'/%3E%3C/svg%3E\")",
    backgroundRepeat: "repeat",
    backgroundSize: "100px",
  };

  useGSAP(() => {
    gsap.to(ref.current, {
      backgroundColor,
      duration: 1,
      zIndex: 0,
      ...noiseOverlayStyle,
    });
    // Ensure the canvas itself is transparent
    gsap.to(canvasRef.current, {
      backgroundColor: 'transparent',
      duration: 0.5,
    });
  }, [backgroundColor]);

  const handlePointerMove = (e: React.PointerEvent) => {
    // Only forward events when the projects portal is active (Spline is visible)
    const container = document.getElementById('projects-background');
    if (container && container.style.opacity === '1') {
      const splineCanvas = container.querySelector('canvas');
      if (splineCanvas) {
        splineCanvas.dispatchEvent(new PointerEvent('pointermove', e.nativeEvent));
      }
    }
  };

  return (
    <div className="h-[100dvh] wrapper relative" onPointerMove={handlePointerMove}>
      <div className="h-[100dvh] relative" ref={ref}>
        {/* Spline background: sits in the DOM between bg div and Canvas */}
        <ProjectsBackground />
        <Canvas
          className="base-canvas"
          shadows
          style={canvasStyle}
          ref={canvasRef}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, stencil: false, depth: true, powerPreference: "high-performance" }}
        >
          <Suspense fallback={null}>
            <ClearAlphaController />
            <ambientLight intensity={0.5} />
            <ScrollControls pages={4} damping={0.4} maxSpeed={1} distance={1} style={{ zIndex: 1 }}>
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
