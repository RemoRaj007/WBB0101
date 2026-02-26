import { Link } from 'react-router-dom';

const NotFound = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-md max-w-md">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
            <p className="text-gray-500 mb-6">The page you are looking for does not exist.</p>
            <Link
                to="/dashboard"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Go to Dashboard
            </Link>
        </div>
    </div>
);

export default NotFound;
