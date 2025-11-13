import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full">
            {/* Error Card */}
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-glass)]/80 to-[var(--surface-glass)]/40 backdrop-blur-xl border border-[var(--border-glass)]" />
              <div className="relative p-8 text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                {/* Message */}
                <h1 className="mb-3">Oops! Something went wrong</h1>
                <p className="text-[var(--text-secondary)] mb-6">
                  We encountered an unexpected error. Don&rsquo;t worry, we&rsquo;re on it!
                </p>

                {/* Error Details (Development only) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left">
                    <p className="text-sm text-red-400 mb-2" style={{ fontWeight: 'var(--font-weight-medium)' }}>
                      Error Details:
                    </p>
                    <pre className="text-xs text-[var(--text-secondary)] overflow-auto max-h-32">
                      {this.state.error.message}
                    </pre>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={this.handleReset}
                    className="flex-1 h-12 bg-gradient-to-r from-[var(--primary-500)] to-[var(--primary-600)] hover:from-[var(--primary-600)] hover:to-[var(--primary-700)] text-white"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Try Again
                  </Button>
                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    className="flex-1 h-12 border-[var(--border-default)] hover:bg-[var(--surface-glass)]/50"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Go Home
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
