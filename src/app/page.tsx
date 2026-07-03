import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-5">
          S
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-3">Subscription Spending Guard</h1>
        <p className="text-slate-500 mb-8">
          Track your subscriptions, understand your recurring spend, and get AI-powered insights on where you might be wasting money.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/signup"
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="bg-white text-slate-700 border border-slate-300 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}