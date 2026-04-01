import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-8xl font-extrabold text-blue-600">404</h1>
        <h2 className="text-3xl font-bold text-gray-900">Oops! Page Not Found</h2>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. 
          Don't worry, let's get you back on track.
        </p>
        
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium w-full sm:w-auto"
          >
            Go Back Home
          </Link>
          <Link 
            href="/jobs"
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium w-full sm:w-auto"
          >
            Browse Jobs
          </Link>
          <Link 
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium w-full sm:w-auto"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
