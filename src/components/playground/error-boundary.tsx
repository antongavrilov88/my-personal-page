'use client';

import { Component, type ReactNode } from 'react';

type Props = { fallback: string; children: ReactNode };
type State = { hasError: boolean };

export class DemoErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <p className="rounded-lg border border-line bg-panel p-4 font-mono text-sm text-muted">
          {this.props.fallback}
        </p>
      );
    }
    return this.props.children;
  }
}
