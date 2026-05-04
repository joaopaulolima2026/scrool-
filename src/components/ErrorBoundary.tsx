import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background text-foreground p-8">
          <div className="max-w-md text-center space-y-4">
            <h1 className="text-2xl font-bold text-destructive">Algo deu errado</h1>
            <p className="text-muted-foreground text-sm">{this.state.error.message}</p>
            <button
              className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm"
              onClick={() => this.setState({ error: null })}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
