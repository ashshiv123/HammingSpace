import React from 'react';

interface SceneErrorBoundaryProps {
  children: React.ReactNode;
  resetKey: number;
  onRestart: () => void;
}

interface SceneErrorBoundaryState {
  hasError: boolean;
}

/** Keeps DOM controls available when a WebGL scene render fails. */
export class SceneErrorBoundary extends React.Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: SceneErrorBoundaryProps) {
    if (previousProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 grid place-items-center bg-slate-950 text-slate-200">
          <div className="rounded-md border border-slate-700 bg-slate-900 px-4 py-3 text-center text-sm shadow-lg">
            <p>Scene error</p>
            <button
              className="mt-2 rounded border border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-800"
              onClick={this.props.onRestart}
              type="button"
            >
              Restart
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
