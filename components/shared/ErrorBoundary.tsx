import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside Floussi application:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
          <div className="bg-white border border-slate-150 rounded-3xl p-8 max-w-md shadow-xs space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">Oups ! Une erreur est survenue</h3>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                L'application a rencontré un dysfonctionnement inattendu. Vos données enregistrées localement restent protégées.
              </p>
            </div>

            {this.state.error && (
              <pre className="text-[10px] text-left p-3 bg-slate-50 border border-slate-200 rounded-xl text-rose-850 font-mono overflow-auto max-h-32">
                {this.state.error.toString()}
              </pre>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Recharger Floussi</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
