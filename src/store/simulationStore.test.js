import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSimulationStore } from './simulationStore';

describe('Hamming Lab Flow Contract (S0..S7)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSimulationStore.getState().reset();
    useSimulationStore.getState().setNK(15, 11);
  });

  it('walks S0..S7 and asserts the state order and codeword visibility', () => {
    const store = useSimulationStore.getState;
    
    // S0 Compose
    expect(store().stage).toBe('idle');
    expect(store().lessonOpen).toBe(false);
    expect(store().codeword.every(b => b === 0)).toBe(true); // not exposed
    
    // S1 Transmit
    store().setAutoOpenLesson(true);
    store().encode();
    expect(store().stage).toBe('encoding');
    expect(store().lessonOpen).toBe(true);
    expect(store().lessonPhase).toBe('encoding');
    
    // S2 Lesson A
    store().setLessonStep(2);
    expect(store().lessonStep).toBe(2);
    store().setLessonStep(5); // end of phase
    
    // S3 Codeword Build
    store().finishLessonPhase('encoding');
    expect(store().stage).toBe('inChannel');
    expect(store().lessonOpen).toBe(false);
    
    // S4 To Channel
    // S5 Noise
    store().toggleChannelBit(0);
    expect(store().stage).toBe('inChannel');
    
    // Proceed to receiver
    store().decode();
    expect(store().stage).toBe('decoding');
    expect(store().lessonOpen).toBe(true);
    expect(store().lessonPhase).toBe('decoding');
    
    // S6 Lesson B
    store().setLessonStep(9);
    
    // S7 Result
    store().finishLessonPhase('decoding');
    expect(store().stage).toBe('corrected');
    expect(store().errorPositions.length).toBeGreaterThan(0);
    expect(store().syndrome.every(b => b === 0)).toBe(true);
  });
});
