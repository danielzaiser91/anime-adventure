import React, { Component, type ReactNode, type ErrorInfo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function ErrorFallback({ error, onReset }: { error: Error | null; onReset: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-void flex flex-col items-center justify-center p-6">
      <div className="font-cinzel text-red-400 text-2xl mb-4">{t('error.title')}</div>
      <div className="text-gray-400 font-noto text-sm mb-6 max-w-sm text-center">
        {error?.message ?? 'Unknown error'}
      </div>
      <button
        onClick={onReset}
        className="px-6 py-2 bg-spirit-blue text-white font-rajdhani rounded hover:bg-blue-700 transition-colors"
      >
        {t('error.tryAgain')}
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <ErrorFallback
          error={this.state.error}
          onReset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}
