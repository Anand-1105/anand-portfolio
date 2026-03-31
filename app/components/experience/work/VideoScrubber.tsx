'use client';

import { WORK_TIMELINE } from '@constants';
import { usePortalStore, useScrollStore } from '@stores';
import { useEffect, useRef } from 'react';

const VIDEO_DURATION = 8;
const N = WORK_TIMELINE.length;

export default function VideoScrubber() {
  const isActive = usePortalStore((state) => state.activePortalId === 'work');
  const scrollProgress = useScrollStore((state) => state.scrollProgress);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const targetTimeRef = useRef(0);

  const updateCards = (p: number) => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const trigger = i / Math.max(N - 1, 1);
      const dist = p - trigger;
      let opacity: number;
      if (i === N - 1) {
        opacity = dist >= -0.1 ? Math.min(1, (dist + 0.1) / 0.1) : 0;
      } else {
        if (dist < -0.1) opacity = 0;
        else if (dist < 0) opacity = (dist + 0.1) / 0.1;
        else if (dist < 0.15) opacity = 1;
        else if (dist < 0.25) opacity = 1 - (dist - 0.15) / 0.1;
        else opacity = 0;
      }
      const isRight = WORK_TIMELINE[i].position === 'right';
      const slide = (1 - Math.min(opacity * 2, 1)) * (isRight ? 18 : -18);
      card.style.opacity = opacity.toFixed(3);
      card.style.transform = `translateX(${slide.toFixed(1)}px)`;
    });
  };

  const updateDots = (p: number) => {
    dotRefs.current.forEach((dot, i) => {
      if (!dot) return;
      const trigger = i / Math.max(N - 1, 1);
      const active = Math.abs(p - trigger) < 0.1;
      dot.style.width = active ? '20px' : '6px';
      dot.style.background = active ? '#4a8fff' : 'rgba(74,143,255,0.3)';
    });
  };

  const animate = () => {
    const video = videoRef.current;
    if (video) {
      const current = video.currentTime;
      const target = targetTimeRef.current;
      const diff = target - current;
      if (Math.abs(diff) < 0.02) {
        if (!video.paused) video.pause();
      } else if (diff > 0) {
        const rate = Math.min(Math.abs(diff) * 8, 16);
        if (video.playbackRate !== rate) video.playbackRate = rate;
        if (video.paused) video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = Math.max(0, current + diff * 0.3);
      }
      updateCards(video.currentTime / VIDEO_DURATION);
      updateDots(video.currentTime / VIDEO_DURATION);
    }
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    targetTimeRef.current = Math.min(Math.max(scrollProgress, 0), 1) * VIDEO_DURATION;
  }, [scrollProgress]);

  useEffect(() => {
    if (isActive) {
      targetTimeRef.current = 0;
      const video = videoRef.current;
      if (video) { video.currentTime = 0; video.pause(); }
      rafRef.current = requestAnimationFrame(animate);
    } else {
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      videoRef.current?.pause();
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
      <video
        ref={videoRef}
        src="/staircase.mp4"
        muted
        playsInline
        preload="auto"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.6) 100%)',
      }} />
      {WORK_TIMELINE.map((item, i) => {
        const isRight = item.position === 'right';
        const topPercent = 12 + (i / Math.max(N - 1, 1)) * 62;
        return (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            style={{
              position: 'absolute',
              top: `${topPercent}%`,
              left: isRight ? 'auto' : '3%',
              right: isRight ? '3%' : 'auto',
              opacity: 0,
              maxWidth: '300px',
              willChange: 'opacity, transform',
            }}
          >
            <div style={{
              background: 'rgba(6,10,18,0.88)',
              border: '1px solid rgba(42,74,122,0.5)',
              borderLeft: isRight ? '1px solid rgba(42,74,122,0.5)' : '3px solid #4a8fff',
              borderRight: isRight ? '3px solid #4a8fff' : '1px solid rgba(42,74,122,0.5)',
              borderRadius: '4px',
              padding: '0.8rem 1.2rem',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ color: '#7ab0ff', fontSize: '0.68rem', letterSpacing: '0.12em', marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                {item.year}
              </div>
              <div style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                {item.title}
              </div>
              {item.subtitle && (
                <div style={{ color: '#8ab4d4', fontSize: '0.78rem' }}>{item.subtitle}</div>
              )}
            </div>
          </div>
        );
      })}
      <div style={{
        position: 'absolute', bottom: '2rem', left: '50%',
        transform: 'translateX(-50%)', display: 'flex', gap: '6px', alignItems: 'center',
      }}>
        {WORK_TIMELINE.map((_, i) => (
          <div
            key={i}
            ref={(el) => { dotRefs.current[i] = el; }}
            style={{ width: '6px', height: '6px', borderRadius: '3px', background: 'rgba(74,143,255,0.3)', transition: 'width 0.15s ease, background 0.15s ease' }}
          />
        ))}
      </div>
    </div>
  );
}
