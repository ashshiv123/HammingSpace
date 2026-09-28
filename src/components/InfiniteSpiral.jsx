import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * InfiniteSpiral — 3D spiral carousel that continuously rotates items
 * in a helix pattern. Supports custom renderers for items.
 */
export default function InfiniteSpiral({
  items = [],
  animationMode = 'auto',
  speed = 0.5,
  radius = 170,
  cardWidth = 100,
  cardHeight = 100,
  verticalSpacing = 60,
  perspective = 1000,
  cardRadius = 10,
  centerScale = 1.2,
  edgeBlur = 4,
  cardsPerTurn = 7,
  pauseOnHover = true,
  direction = 'up',
  rotation = 0,
  cardTilt = 0,
  edgeFade = 0.3,
  grayscale = 0,
  onItemClick,
  renderItem,
}) {
  const containerRef = useRef(null);
  const animRef = useRef(null);
  const offsetRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const totalItems = items.length;
  const angleStep = (2 * Math.PI) / cardsPerTurn;

  const animate = useCallback(() => {
    if (prefersReduced || (isPaused && pauseOnHover)) {
      animRef.current = requestAnimationFrame(animate);
      return;
    }

    const dir = direction === 'up' ? 1 : -1;
    offsetRef.current += speed * 0.008 * dir;
    
    const container = containerRef.current;
    if (!container) {
      animRef.current = requestAnimationFrame(animate);
      return;
    }

    const cards = container.querySelectorAll('[data-spiral-card]');
    const containerHeight = container.offsetHeight;
    const centerY = containerHeight / 2;

    cards.forEach((card, i) => {
      const progress = (i / totalItems) + offsetRef.current;
      const angle = progress * angleStep * totalItems;
      
      const x = Math.sin(angle + rotation) * radius;
      const z = Math.cos(angle + rotation) * radius;
      const y = ((progress % 1) - 0.5) * totalItems * verticalSpacing;
      
      // Normalize z to 0-1 range (front=1, back=0)
      const zNorm = (z + radius) / (2 * radius);
      const scale = 0.7 + zNorm * (centerScale - 0.7);
      const blur = (1 - zNorm) * edgeBlur;
      const opacity = edgeFade + zNorm * (1 - edgeFade);
      const yCenter = Math.abs(y) / (containerHeight * 0.5);
      const vFade = Math.max(0, 1 - yCenter * 0.8);

      card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) scale(${scale}) rotateY(${cardTilt}deg)`;
      card.style.opacity = String(opacity * vFade);
      card.style.filter = `blur(${blur}px) grayscale(${grayscale})`;
      card.style.zIndex = String(Math.round(zNorm * 100));
    });

    animRef.current = requestAnimationFrame(animate);
  }, [isPaused, pauseOnHover, speed, direction, radius, totalItems, angleStep, verticalSpacing, centerScale, edgeBlur, edgeFade, cardTilt, grayscale, rotation, prefersReduced]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  return (
    <div
      ref={containerRef}
      style={{ perspective: `${perspective}px`, transformStyle: 'preserve-3d' }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <div style={{ transformStyle: 'preserve-3d', position: 'relative' }}>
        {items.map((item, i) => (
          <div
            key={i}
            data-spiral-card
            onClick={() => onItemClick?.(item, i)}
            style={{
              position: 'absolute',
              width: cardWidth,
              height: cardHeight,
              left: -cardWidth / 2,
              top: -cardHeight / 2,
              borderRadius: cardRadius,
              cursor: onItemClick ? 'pointer' : 'default',
              transition: prefersReduced ? 'none' : 'filter 0.3s ease',
              willChange: 'transform, opacity, filter',
            }}
            className="overflow-hidden"
          >
            {renderItem ? renderItem(item, i) : (
              <img
                src={item.src}
                alt={item.alt}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                draggable={false}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
