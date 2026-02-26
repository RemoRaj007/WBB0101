const LoadingSpinner = ({ message = 'Loading...' }: { message?: string }) => (
    <div
        role="status"
        aria-label={message}
        className="flex items-center justify-center min-h-screen bg-gray-50"
    >
        <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500 font-medium">{message}</span>
        </div>
    </div>
);

export default LoadingSpinner;
