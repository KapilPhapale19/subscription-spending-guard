"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type Subscription = {
  id: string;
  name: string;
  cost: number;
  billingCycle: string;
  renewalDate: string;
  category: string;
};

const categoryColors: Record<string, string> = {
  Entertainment: "bg-pink-100 text-pink-700",
  Productivity: "bg-blue-100 text-blue-700",
  Utilities: "bg-amber-100 text-amber-700",
  "Health & Fitness": "bg-green-100 text-green-700",
  Education: "bg-purple-100 text-purple-700",
  Other: "bg-gray-100 text-gray-700",
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [renewalDate, setRenewalDate] = useState("");
  const [category, setCategory] = useState("Entertainment");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchSubscriptions();
    }
  }, [status]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const res = await fetch("/api/subscriptions");
    if (!res.ok) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setSubscriptions(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        cost: parseFloat(cost),
        billingCycle,
        renewalDate,
        category,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to add subscription");
      return;
    }

    setName("");
    setCost("");
    setRenewalDate("");
    setCategory("Entertainment");
    setBillingCycle("monthly");
    setShowForm(false);
    fetchSubscriptions();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    fetchSubscriptions();
  };

  const handleGetInsights = async () => {
    setInsightLoading(true);
    setInsight("");
    const res = await fetch("/api/insights", { method: "POST" });
    const data = await res.json();
    setInsightLoading(false);

    if (!res.ok) {
      setInsight(data.error || "Failed to generate insights");
      return;
    }
    setInsight(data.insight);
  };

  const monthlyTotal = subscriptions.reduce((sum, s) => {
    return sum + (s.billingCycle === "monthly" ? s.cost : s.cost / 12);
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const upcomingRenewal = [...subscriptions].sort(
    (a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
  )[0];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              S
            </div>
            <h1 className="text-lg font-semibold text-slate-900">Subscription Spending Guard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden sm:block">
              Hi, <span className="text-slate-900 font-medium">{session?.user?.name}</span>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-md hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Monthly Spend</p>
            <p className="text-3xl font-bold text-slate-900">₹{monthlyTotal.toFixed(0)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Yearly Spend</p>
            <p className="text-3xl font-bold text-slate-900">₹{yearlyTotal.toFixed(0)}</p>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Active Subscriptions</p>
            <p className="text-3xl font-bold text-slate-900">{subscriptions.length}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-xl mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                ✨ AI Spending Insights
              </h2>
              <p className="text-indigo-100 text-sm mt-0.5">Let AI review your subscriptions and flag waste</p>
            </div>
            <button
              onClick={handleGetInsights}
              disabled={insightLoading || subscriptions.length === 0}
              className="bg-white text-indigo-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {insightLoading ? "Analyzing..." : "Analyze My Spending"}
            </button>
          </div>
          {insight && (
            <div className="bg-white/95 backdrop-blur rounded-lg p-4 text-sm text-slate-800 whitespace-pre-line leading-relaxed">
              {insight}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center p-6 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">Your Subscriptions</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              {showForm ? "Cancel" : "+ Add Subscription"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAdd} className="p-6 bg-slate-50 border-b border-slate-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Netflix"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Cost (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="299"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Renewal Date</label>
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option>Entertainment</option>
                    <option>Productivity</option>
                    <option>Utilities</option>
                    <option>Health & Fitness</option>
                    <option>Education</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button
                type="submit"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Add Subscription
              </button>
            </form>
          )}

          <div className="p-6">
            {subscriptions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-slate-500 text-sm">No subscriptions yet. Add your first one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex justify-between items-center p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-semibold text-sm">
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{sub.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              categoryColors[sub.category] || categoryColors.Other
                            }`}
                          >
                            {sub.category}
                          </span>
                          <span className="text-xs text-slate-400">
                            Renews {new Date(sub.renewalDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-semibold text-slate-900">
                        ₹{sub.cost}
                        <span className="text-slate-400 font-normal">/{sub.billingCycle === "monthly" ? "mo" : "yr"}</span>
                      </p>
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="text-slate-400 hover:text-red-600 text-xs font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center py-8 text-sm text-slate-400 border-t border-slate-200 mt-8">
        Built by Kapil Phapale ·{" "}
        <a href="https://github.com/KapilPhapale19" className="text-indigo-600 hover:underline" target="_blank">
          GitHub
        </a>{" "}
        ·{" "}
        <a href="https://www.linkedin.com/in/kapil-phapale-33449b31a"
         className="text-indigo-600 hover:underline" target="_blank">
          LinkedIn
        </a>
      </footer>
    </div>
  );
}