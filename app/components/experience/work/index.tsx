import { ScrollControls } from "@react-three/drei";
import { usePortalStore, useScrollStore } from "@stores";
import { useEffect } from "react";
import Timeline from "./Timeline";

const Work = () => {
  const isActive = usePortalStore((state) => state.activePortalId === 'work');
  const { scrollProgress, setScrollProgress } = useScrollStore();

  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
    setScrollProgress(progress);
  };

  useEffect(() => {
    if (isActive) {
      const scrollWrapper = document.querySelector('div[style*="z-index: -1"]') as HTMLElement;
      const originalScrollWrapper = document.querySelector('div[style*="z-index: 1"]') as HTMLElement;
      setScrollProgress(0);
      scrollWrapper.addEventListener('scroll', handleScroll);
      scrollWrapper.style.zIndex = '1';
      originalScrollWrapper.style.zIndex = '-1';
    } else {
      const scrollWrapper = document.querySelector('div[style*="z-index: 1"]') as HTMLElement;
      const originalScrollWrapper = document.querySelector('div[style*="z-index: -1"]') as HTMLElement;

      if (scrollWrapper) {
        scrollWrapper.scrollTo({ top: 0, behavior: 'smooth' });
        setScrollProgress(0);
        scrollWrapper.removeEventListener('scroll', handleScroll);
        scrollWrapper.style.zIndex = '-1';
        originalScrollWrapper.style.zIndex = '1';
      }
    }
  }, [isActive]);

  return (
    <group>
      <ambientLight intensity={1.5} />
      <directionalLight position={[2, 5, 3]} intensity={1.5} />
      <ScrollControls style={{ zIndex: -1 }} pages={3} maxSpeed={0.3}>
        <Timeline progress={isActive ? scrollProgress : 0} />
      </ScrollControls>
    </group>
  );
};

export default Work;
