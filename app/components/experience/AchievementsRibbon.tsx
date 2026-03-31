import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { ACHIEVEMENTS } from "@constants";
import * as THREE from "three";

const SEP = "  ◆  ";
const BASE_TEXT = ACHIEVEMENTS.map(a => a.label.toUpperCase()).join(SEP) + SEP;
// Duplicate content — group contains [A B C D][A B C D]
// Moving group by -halfWidth is invisible because tile2 == tile1
const TICKER_TEXT = BASE_TEXT + BASE_TEXT;

const FONT = "./Vercetti-Regular.woff";
const FONT_SIZE = 0.12;
const COLOR = "rgba(255,255,255,0.65)";
const SPEED = 0.5;

// Estimated half-width (pre-scale) — onSync corrects to exact value
const EST_CHAR_W = 0.095;
const EST_HALF_W = BASE_TEXT.length * EST_CHAR_W;

export function AchievementsRibbon() {
  const groupRef = useRef<THREE.Group>(null);
  const pausedRef = useRef(false);
  const halfWidthRef = useRef(EST_HALF_W);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSync = (troika: any) => {
    const info = troika.textRenderInfo;
    if (info?.blockBounds) {
      // Full text is doubled — half is one loop cycle
      const fullWidth = info.blockBounds[2] - info.blockBounds[0];
      halfWidthRef.current = fullWidth / 2;
    }
  };

  useFrame((_, delta) => {
    if (!groupRef.current || pausedRef.current) return;
    const hw = halfWidthRef.current;

    // Cap delta to avoid huge jumps on tab switch
    const d = Math.min(delta, 0.03);
    groupRef.current.position.x -= SPEED * d;

    // Reset by exactly halfWidth — tile2 slides into tile1's old position seamlessly
    if (groupRef.current.position.x <= -hw) {
      groupRef.current.position.x += hw;
    }
  });

  const textProps = useMemo(() => ({
    font: FONT,
    fontSize: FONT_SIZE,
    color: COLOR,
    anchorX: "left" as const,
    anchorY: "middle" as const,
    letterSpacing: 0.12,
    maxWidth: 9999,
    sdfGlyphSize: 32,
  }), []);

  return (
    <group scale={[1.4, 1, 1]}>
      {/* Hit plane for hover-to-pause */}
      <mesh
        position={[EST_HALF_W, 0, -0.01]}
        onPointerOver={() => { pausedRef.current = true; }}
        onPointerOut={() => { pausedRef.current = false; }}
      >
        <planeGeometry args={[EST_HALF_W * 2 + 10, 0.3]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Single group with doubled content — move group, reset by halfWidth */}
      <group ref={groupRef}>
        <Text position={[0, 0, 0]} onSync={onSync} {...textProps}>
          {TICKER_TEXT}
        </Text>
      </group>
    </group>
  );
}
