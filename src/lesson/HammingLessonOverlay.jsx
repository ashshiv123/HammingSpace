import React, { useState } from 'react';
import { getRecap, renderLessonStep } from './hammingLessonEngine.js';
import './hammingLesson.css';

function BitMatrix({ matrix, role }) {
  if (!matrix?.length) return null;
  return (
    <div className={`hamming-lesson__matrix hamming-lesson__matrix--${role}`}>
      {matrix.map((row, rowIndex) => (
        <div className="hamming-lesson__matrix-row" key={`${role}-${rowIndex}`}>
          {row.map((value, columnIndex) => (
            <span className={`hamming-lesson__cell ${role === 'P' || (role === 'G' && columnIndex >= matrix.length) || (role === 'H' && columnIndex >= matrix[0].length - matrix.length) ? 'is-parity' : 'is-data'}`} key={`${role}-${rowIndex}-${columnIndex}`}>
              {Array.isArray(value) ? value.join('') : value}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

import MathText from './MathText.jsx';

function StepContent({ content }) {
  return (
    <div className="hamming-lesson__content">
      {content.paragraphs?.map((paragraph) => (
        <p key={paragraph}><MathText text={paragraph} /></p>
      ))}
      {content.blocks?.map((block) => (
        <pre className="hamming-lesson__math" key={block}><MathText text={block} /></pre>
      ))}
      {content.matrices?.map((matrix) => <BitMatrix key={matrix.role} {...matrix} />)}
      {content.result && (
        <div className="hamming-lesson__result"><MathText text={content.result} /></div>
      )}
      {content.hint && (
        <p className="hamming-lesson__hint"><MathText text={content.hint} /></p>
      )}
    </div>
  );
}

export default function HammingLessonOverlay({
  open,
  lessonState,
  phase,
  stepNumber,
  onClose,
  onFinishPhase,
  onReset,
}) {
  const [understood, setUnderstood] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  if (!open || !lessonState) return null;

  const step = renderLessonStep(lessonState, stepNumber);
  const isPhaseStart = phase === 'encoding' ? stepNumber === 1 : stepNumber === 6;
  const isPhaseEnd = phase === 'encoding' ? stepNumber === 5 : stepNumber === 9;
  const nextStep = stepNumber + 1;

  const continueStep = () => {
    if (!understood) return;
    setUnderstood(false);
    setShowRecap(false);
    onFinishPhase(isPhaseEnd ? stepNumber : nextStep, isPhaseEnd);
  };

  return (
    <div className="hamming-lesson" role="dialog" aria-modal="true" aria-label="Guided Hamming code lesson">
      <div className="hamming-lesson__scrim" />
      <section className="hamming-lesson__panel">
        <header className="hamming-lesson__header">
          <div>
            <span className={`hamming-lesson__badge ${phase === 'encoding' ? 'is-encoding' : 'is-decoding'}`}>
              {phase === 'encoding' ? 'Encoding' : 'Decoding'}
            </span>
            <h2>Step {step.number} / 9 - {step.title}</h2>
          </div>
          <button className="hamming-lesson__skip" onClick={onClose} type="button">Skip lesson</button>
        </header>
        <div className="hamming-lesson__progress" aria-label={`Step ${step.number} of 9`}>
          <span style={{ width: `${(step.number / 9) * 100}%` }} />
        </div>
        <StepContent content={step.content} />
        <div className="hamming-lesson__checkpoint">
          <p>Did you understand this step?</p>
          <div className="hamming-lesson__checkpoint-actions">
            <button className={understood ? 'is-selected' : ''} onClick={() => setUnderstood(true)} type="button">Yes, continue</button>
            <button className="is-secondary" onClick={() => setShowRecap(!showRecap)} type="button">No, explain again</button>
          </div>
          {showRecap && <div className="hamming-lesson__recap"><MathText text={getRecap(lessonState, step.number)} /></div>}
        </div>
        <footer className="hamming-lesson__footer">
          <button className="is-secondary" disabled={isPhaseStart} onClick={() => onFinishPhase(stepNumber - 1, false)} type="button">Previous</button>
          <button className="is-secondary" onClick={onReset} type="button">Start over</button>
          <button disabled={!understood} onClick={continueStep} type="button">
            {isPhaseEnd ? (phase === 'encoding' ? 'Finish & send to channel ->' : 'Finish & go to receiver ->') : 'Continue ->'}
          </button>
        </footer>
      </section>
    </div>
  );
}