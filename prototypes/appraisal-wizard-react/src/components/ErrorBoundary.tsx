import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string; // Component name for clearer logs
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Standard React Error Boundary to catch render errors and prevent white screens.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`[ErrorBoundary] Caught error in ${this.props.name || 'component'}:`, error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-800">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                                Something went wrong
                            </h3>
                            <div className="mt-1 text-xs text-red-700 dark:text-red-400 font-mono break-all bg-white/50 dark:bg-black/20 p-2 rounded">
                                {this.state.error?.message || 'Unknown error'}
                            </div>
                            <div className="mt-2">
                                <button
                                    onClick={this.handleRetry}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
