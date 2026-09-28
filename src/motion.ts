/**
 * HammingSpace Motion System — Tokens, Helpers, and Reduced Motion Support
 */

import { theme } from './theme';

// Motion duration tokens (ms)
export const motionTokens = {
  fast: 150,
  base: 300,
  slow: 600,
  camera: 1600,
  flip: 450,
} as const;

// Easing curves
export const easings = {
  standard: [0.16, 1, 0.3, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  camera: [0.25, 0.1, 0.25, 1] as const,
  linear: [0, 0, 1, 1] as const,
} as const;

// Reduced motion detection
let reducedMotionCache: boolean | null = null;

export function useReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  if (reducedMotionCache !== null) return reducedMotionCache;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  reducedMotionCache = mediaQuery.matches;

  mediaQuery.addEventListener('change', (e) => {
    reducedMotionCache = e.matches;
  });

  return reducedMotionCache;
}

export function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Resolve duration respecting reduced motion
export function resolveDuration(token: keyof typeof motionTokens, customMs?: number): number {
  if (getReducedMotion()) return 0;
  return customMs ?? motionTokens[token];
}

// Resolve easing respecting reduced motion
export function resolveEasing(token: keyof typeof easings): number[] {
  if (getReducedMotion()) return [...easings.linear];
  return [...easings[token]];
}

// Spring config for react-spring
export function springConfig(token: keyof typeof motionTokens = 'base', customMs?: number) {
  const duration = resolveDuration(token, customMs);
  // react-spring uses tension/friction; approximate from duration
  // tension ~ 1000/duration, friction ~ 20-30
  const tension = Math.max(100, 1000 / (duration / 100));
  const friction = 22;
  return { tension, friction, precision: 0.01 };
}

// Spring config for camera (slower, more damped)
export function cameraSpringConfig(customMs?: number) {
  const duration = customMs ?? motionTokens.camera;
  if (getReducedMotion()) return { tension: 500, friction: 500, precision: 0.01 }; // instant
  return { tension: 120, friction: 18, precision: 0.001 };
}

/**
 * Cancelable timeline helper for sequenced animations.
 * Usage:
 *   const tl = sequence([
 *     { duration: 300, callback: () => setStep(1) },
 *     { duration: 600, callback: () => setStep(2) },
 *   ]);
 *   tl.cancel(); // cancels remaining steps
 *   await tl.promise; // waits for completion
 */
export interface TimelineStep {
  duration: number;
  callback: () => void;
}

export interface TimelineController {
  cancel: () => void;
  promise: Promise<void>;
}

export function sequence(steps: TimelineStep[]): TimelineController {
  let cancelled = false;
  let currentIndex = 0;

  const run = async () => {
    for (const step of steps) {
      if (cancelled) break;
      if (step.duration > 0) {
        await new Promise<void>((resolve) => {
          const id = setTimeout(() => resolve(), step.duration);
          // Store timer ID for potential cancellation (not exposed, but could be)
          // For now, we just check cancelled flag after each await
        });
      }
      if (!cancelled) {
        step.callback();
        currentIndex++;
      }
    }
  };

  const promise = run();

  return {
    cancel: () => {
      cancelled = true;
    },
    promise,
  };
}

/**
 * Spring-based animation helper for react-spring/three
 * Returns spring config with reduced motion handling
 */
export function createSpringProps<T extends Record<string, any>>(
  targetValues: T,
  token: keyof typeof motionTokens = 'base',
  customMs?: number
): T & { config: ReturnType<typeof springConfig>; immediate?: boolean } {
  const isReduced = getReducedMotion();
  return {
    ...targetValues,
    config: isReduced ? { tension: 500, friction: 500, precision: 0.01 } : springConfig(token, customMs),
    immediate: isReduced,
  };
}

/**
 * Camera transition helper - computes lerp factor for smooth camera movement
 */
export function cameraLerpFactor(delta: number, durationMs: number = motionTokens.camera): number {
  if (getReducedMotion()) return 1;
  // Smoothstep-like easing for camera
  const t = Math.min(1, delta * (1000 / durationMs) * 3.2);
  return t * t * (3 - 2 * t); // smoothstep
}

/**
 * FLIP animation helper for overlay transitions
 * Measures start/end rects and animates transform/opacity
 */
export interface FLIPConfig {
  fromRect: DOMRect;
  toRect: DOMRect;
  duration?: number;
  onStart?: () => void;
  onComplete?: () => void;
}

export function animateFLIP(
  element: HTMLElement,
  config: FLIPConfig
): { cancel: () => void; promise: Promise<void> } {
  const { fromRect, toRect, duration = motionTokens.flip, onStart, onComplete } = config;
  const isReduced = getReducedMotion();

  if (isReduced) {
    element.style.transform = '';
    element.style.opacity = '1';
    onStart?.();
    onComplete?.();
    return { cancel: () => {}, promise: Promise.resolve() };
  }

  const dx = fromRect.left - toRect.left;
  const dy = fromRect.top - toRect.top;
  const sx = fromRect.width / toRect.width;
  const sy = fromRect.height / toRect.height;

  // Apply initial transform
  element.style.transformOrigin = 'top left';
  element.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
  element.style.opacity = '0';
  element.style.transition = `transform ${duration}ms ${theme.easing.standard}, opacity ${duration}ms ${theme.easing.standard}`;

  onStart?.();

  // Force reflow
  element.getBoundingClientRect();

  // Animate to identity
  element.style.transform = 'translate(0, 0) scale(1, 1)';
  element.style.opacity = '1';

  let cancelled = false;
  const promise = new Promise<void>((resolve) => {
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== element) return;
      if (e.propertyName !== 'transform') return;
      element.removeEventListener('transitionend', handleTransitionEnd);
      element.style.transition = '';
      element.style.transform = '';
      element.style.transformOrigin = '';
      if (!cancelled) onComplete?.();
      resolve();
    };
    element.addEventListener('transitionend', handleTransitionEnd);

    // Fallback timeout
    setTimeout(() => {
      element.removeEventListener('transitionend', handleTransitionEnd);
      if (!cancelled) {
        element.style.transition = '';
        element.style.transform = '';
        element.style.transformOrigin = '';
        onComplete?.();
        resolve();
      }
    }, duration + 100);
  });

  return {
    cancel: () => {
      cancelled = true;
      element.style.transition = '';
      element.style.transform = '';
      element.style.transformOrigin = '';
      element.style.opacity = '1';
    },
    promise,
  };
}

/**
 * Simple fade animation for reduced motion fallback
 */
export function animateFade(
  element: HTMLElement,
  show: boolean,
  duration: number = motionTokens.fast
): { cancel: () => void; promise: Promise<void> } {
  const isReduced = getReducedMotion();
  const actualDuration = isReduced ? 0 : duration;

  element.style.transition = `opacity ${actualDuration}ms ${theme.easing.standard}`;
  element.style.opacity = show ? '1' : '0';

  let cancelled = false;
  const promise = new Promise<void>((resolve) => {
    if (actualDuration === 0) {
      resolve();
      return;
    }
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== element) return;
      element.removeEventListener('transitionend', handleTransitionEnd);
      element.style.transition = '';
      if (!cancelled) resolve();
    };
    element.addEventListener('transitionend', handleTransitionEnd);
    setTimeout(() => {
      element.removeEventListener('transitionend', handleTransitionEnd);
      element.style.transition = '';
      if (!cancelled) resolve();
    }, actualDuration + 50);
  });

  return {
    cancel: () => {
      cancelled = true;
      element.style.transition = '';
      element.style.opacity = show ? '1' : '0';
    },
    promise,
  };
}