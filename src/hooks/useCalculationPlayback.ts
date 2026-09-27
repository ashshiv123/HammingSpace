import { useEffect } from 'react';
import { useSimulationStore } from '../store/simulationStore';

export function useCalculationPlayback() {
  const {
    calculationSteps,
    currentStepIndex,
    isAnimationPlaying,
    animationSpeed,
    speedMultiplier,
    nextStep,
  } = useSimulationStore();

  useEffect(() => {
    if (!isAnimationPlaying || calculationSteps.length === 0) return;

    if (currentStepIndex >= calculationSteps.length - 1) {
      // Completed, next step will finalize
      const timer = setTimeout(() => {
        nextStep();
      }, 1000);
      return () => clearTimeout(timer);
    }

    const baseDelay =
      animationSpeed === 'fast'
        ? 400
        : animationSpeed === 'instant'
        ? 50
        : 850;

    const intervalMs = Math.round(baseDelay / (speedMultiplier || 1));

    const timer = setTimeout(() => {
      nextStep();
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [
    isAnimationPlaying,
    currentStepIndex,
    calculationSteps.length,
    animationSpeed,
    speedMultiplier,
    nextStep,
  ]);
}
