import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Inline math component using KaTeX.
 * Usage: <M>n</M> or <M>2^r \geq m + r + 1</M>
 */
export function M({ children, display = false }) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(String(children), {
        throwOnError: false,
        displayMode: display,
      });
    } catch {
      return String(children);
    }
  }, [children, display]);

  if (display) {
    return (
      <div
        className="my-4 overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className="katex-inline"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
