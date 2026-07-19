import { Link } from "react-router-dom";

export default function Index() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fffaf3] px-6">
      <div className="max-w-lg text-center">
        <h1 className="text-7xl font-extrabold text-indigo-600 mb-2">404</h1>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Access Not Available
        </h2>

        <p className="text-gray-600 leading-relaxed mb-8">
          The page you're looking for doesn't exist, is currently unavailable,
          or you don't have permission to access it.
        </p>

        <Link
          to="/"
          className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium shadow hover:bg-indigo-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}