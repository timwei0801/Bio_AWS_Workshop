import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Optional fallback renderer; receives the error and a retry fn. */
  fallback?: (err: Error, retry: () => void) => React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Deliberately log once — consumers can hook telemetry here later.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private retry = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.state.error, this.retry);
    return (
      <div role="alert" className="m-4 p-6 rounded-xl bg-red-950/40 ring-1 ring-red-700/50 text-red-200 max-w-xl">
        <h2 className="text-sm font-bold mb-2">Something went wrong</h2>
        <p className="text-xs text-red-300 font-mono whitespace-pre-wrap mb-3">{this.state.error.message}</p>
        <button
          onClick={this.retry}
          className="px-3 py-1 text-xs font-semibold rounded-md bg-red-800/60 hover:bg-red-800 ring-1 ring-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
        >
          Retry
        </button>
      </div>
    );
  }
}
