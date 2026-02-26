import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}
interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: { componentStack: string }) {
        // Log to console in development; in production connect to an error tracking service
        if (process.env.NODE_ENV !== 'production') {
            console.error('ErrorBoundary caught:', error, info);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-gray-50">
                    <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-4">An unexpected error occurred. Please refresh the page.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
