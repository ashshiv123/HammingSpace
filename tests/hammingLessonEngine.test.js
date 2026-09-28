import { describe, expect, it } from 'vitest';
import {
  buildG,
  buildH,
  buildPStructural,
  createLessonState,
  renderLessonStep,
} from '../src/lesson/hammingLessonEngine.js';

const P74 = [[1, 1, 0], [1, 0, 1], [0, 1, 1], [1, 1, 1]];
const G74 = buildG(P74);
const H74 = buildH(P74);

describe('hamming lesson engine', () => {
  it('derives the required (7,4) structural matrices and codeword', () => {
    expect(buildPStructural(7, 3).P).toEqual(P74);
    expect(createLessonState({ messageBits: [1, 0, 1, 1], G: G74, H: H74 }).c).toEqual([1, 0, 1, 1, 0, 1, 0]);
    expect(H74).toEqual([[1, 1, 0, 1, 1, 0, 0], [1, 0, 1, 1, 0, 1, 0], [0, 1, 1, 1, 0, 0, 1]]);
  });

  it('uses real injected errors for syndrome and correction', () => {
    const state = createLessonState({ messageBits: [1, 0, 0, 1], G: G74, H: H74, errorVector: [0, 0, 0, 1, 0, 0, 0] });
    expect(state.c).toEqual([1, 0, 0, 1, 0, 0, 1]);
    expect(state.S).toEqual([1, 1, 1]);
    expect(state.errorPosition).toBe(3);
    expect(state.corrected).toEqual(state.c);
  });

  it('renders clean and beyond-capacity channel outcomes without fabricated positions', () => {
    const clean = createLessonState({ messageBits: [1, 0, 0, 1], G: G74, H: H74 });
    expect(clean.S).toEqual([0, 0, 0]);
    expect(renderLessonStep(clean, 9).content.result).toContain('no error detected');

    const multiple = createLessonState({ messageBits: [1, 0, 0, 1], G: G74, H: H74, errorVector: [1, 1, 0, 1, 0, 0, 0] });
    expect(multiple.e.reduce((sum, bit) => sum + bit, 0)).toBe(3);
    expect(renderLessonStep(multiple, 9).content.result).toContain('may be a miscorrection');
  });

  it('(15,11) requires four parity bits and nine steps render', () => {
    const structural = buildPStructural(15, 4);
    const state = createLessonState({ messageBits: new Array(11).fill(0), G: buildG(structural.P), H: buildH(structural.P) });
    expect(state.r).toBe(4);
    expect(state.n).toBe(15);
    expect(renderLessonStep(state, 9).number).toBe(9);
  });
});