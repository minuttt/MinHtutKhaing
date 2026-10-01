import { Component, type ReactNode } from 'react';

export function WebGLFallback({ className, message }: { className?: string; message: string }) {
  return <div className={className} role="status"><p>{message}</p></div>;
}

export class WebGLErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
