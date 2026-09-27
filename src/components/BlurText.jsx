import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap(s => Object.keys(s))]);
  const keyframes = {};
  keys.forEach(k => {
    keyframes[k] = [from[k], ...steps.map(s => s[k])];
  });
  return keyframes;
};

/**
 * BlurText — React Bits animated text component with blur-to-focus reveal.
 * Supports word or letter animation, custom directions, timing, and HTML semantic tags.
 */
export default function BlurText({
  text = '',
  delay = 180,
  startDelay = 0,
  className = '',
  animateBy = 'words',
  direction = 'top',
  threshold = 0.1,
  rootMargin = '0px',
  animationFrom,
  animationTo,
  easing = [0.25, 0.1, 0.25, 1],
  onAnimationComplete,
  stepDuration = 0.35,
  as: Component = 'p',
  highlightWords = {},
  style = {}
}) {
  const prefersReduced = useReducedMotion();
  const elements = useMemo(() => {
    return animateBy === 'words' ? text.split(' ') : text.split('');
  }, [text, animateBy]);

  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const defaultFrom = useMemo(
    () =>
      direction === 'top'
        ? { filter: 'blur(12px)', opacity: 0, y: -25 }
        : { filter: 'blur(12px)', opacity: 0, y: 25 },
    [direction]
  );

  const defaultTo = useMemo(
    () => [
      {
        filter: 'blur(5px)',
        opacity: 0.6,
        y: direction === 'top' ? 3 : -3
      },
      { filter: 'blur(0px)', opacity: 1, y: 0 }
    ],
    [direction]
  );

  const fromSnapshot = animationFrom ?? defaultFrom;
  const toSnapshots = animationTo ?? defaultTo;

  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  // If reduced motion is preferred, render statically without blur or animation
  if (prefersReduced) {
    return (
      <Component className={className} style={{ display: 'flex', flexWrap: 'wrap', ...style }}>
        {elements.map((segment, index) => {
          const customClass = highlightWords[segment] || '';
          return (
            <span key={index} className={`inline-block ${customClass}`}>
              {segment === ' ' ? '\u00A0' : segment}
              {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
            </span>
          );
        })}
      </Component>
    );
  }

  const animateKeyframes = buildKeyframes(fromSnapshot, toSnapshots);

  return (
    <Component
      ref={ref}
      className={className}
      style={{ display: 'flex', flexWrap: 'wrap', ...style }}
    >
      {elements.map((segment, index) => {
        const customClass = highlightWords[segment] || '';
        const spanTransition = {
          duration: totalDuration,
          times,
          delay: (startDelay + index * delay) / 1000,
          ease: easing
        };

        return (
          <motion.span
            key={index}
            className={`inline-block will-change-[transform,filter,opacity] ${customClass}`}
            initial={fromSnapshot}
            animate={inView ? animateKeyframes : fromSnapshot}
            transition={spanTransition}
            onAnimationComplete={
              index === elements.length - 1 ? onAnimationComplete : undefined
            }
          >
            {segment === ' ' ? '\u00A0' : segment}
            {animateBy === 'words' && index < elements.length - 1 && '\u00A0'}
          </motion.span>
        );
      })}
    </Component>
  );
}
