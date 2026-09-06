import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center mb-4">
        B
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Page Not Found</h2>
      <p className="text-xs text-slate-600 mb-4 max-w-sm">
        The requested wholesale portal page could not be found. Return to the main B2B marketplace.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
      >
        Back to Marketplace
      </Link>
    </div>
  );
}
