/**
 * MathText.jsx — Renders text with inline KaTeX math expressions.
 *
 * Usage: <MathText text="For $k=4$, $r=2$ gives $4 \ge 7$ (False)." />
 *
 * Text between $...$ is rendered as inline KaTeX math.
 * Everything else is rendered as plain text.
 */

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Split a string on $...$ delimiters and render math segments with KaTeX.
 */
export default function MathText({ text, className = '' }) {
  const rendered = useMemo(() => {
    if (!text || typeof text !== 'string') return text;

    // Split on $...$ but keep the delimiters as capture group
    const parts = text.split(/\$([^$]+)\$/g);
    if (parts.length === 1) return text; // no math found

    return parts.map((part, i) => {
      // Odd indices are the captured math content
      if (i % 2 === 1) {
        try {
          const html = katex.renderToString(part, {
            throwOnError: false,
            displayMode: false,
          });
          return (
            <span
              key={i}
              className="math-inline"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <code key={i}>{part}</code>;
        }
      }
      return part ? <span key={i}>{part}</span> : null;
    });
  }, [text]);

  if (typeof rendered === 'string') {
    return <span className={className}>{rendered}</span>;
  }

  return <span className={className}>{rendered}</span>;
}
