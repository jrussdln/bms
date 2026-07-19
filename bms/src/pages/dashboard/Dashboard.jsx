import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContentPage from "../../layouts/page/content-page/ContentPage";
import api from "../../api/axios";
import echo from "../../lib/echo";
import { useAuth } from "../../hooks/useAuth";
import ParentCard from "../../components/card/ParentCard";
import ChildCard from "../../components/card/ChildCard";
import { getItem, setItem } from "../../utils/storage/localStorage";

const RECORDS_CACHE_KEY = "finance_records";

const CATEGORY_LABELS = {
  I: "Food",
  E: "Employment",
  H: "Housing",
  T: "Transportation",
  U: "Utilities",
  M: "Medical / Healthcare",
  N: "Entertainment",
  C: "Education",
  S: "Shopping",
  D: "Debt Payment",
  G: "Gift / Donation",
  V: "Investment",
  B: "Business",
  P: "Personal Care",
  O: "Other",
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const summarize = (rows) =>
  rows.reduce(
    (acc, row) => {
      const amount = Number(row.dAmount) || 0;
      if (row.cType === "I") {
        acc.income += amount;
      } else if (row.cType === "S") {
        acc.savings += amount;
      } else {
        acc.expense += amount;
      }
      return acc;
    },
    { income: 0, expense: 0, savings: 0 },
  );

export default function Dashboard() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const cached = getItem(RECORDS_CACHE_KEY);

  const [records, setRecords] = useState(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  // Shared fetch logic — `showLoading` lets callers decide whether this
  // should show the loading state (initial mount, no cache) or update
  // silently in the background (cached mount, live sync broadcasts).
  const loadRecords = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const res = await api.get("/records");
      const rows = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
      setRecords(rows);
      setItem(RECORDS_CACHE_KEY, rows);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load dashboard data.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Public fetchRecords (used by initial mount when there's no cache).
  const fetchRecords = useCallback(() => loadRecords(true), [loadRecords]);

  // Silent refetch — used when we already have cached data to show,
  // and by the broadcast listener. No loading flicker.
  const refetchRecordsSilently = useCallback(
    () => loadRecords(false),
    [loadRecords],
  );

  useEffect(() => {
    // If we already showed cached data, refresh silently in the background.
    // Otherwise do a normal loading fetch.
    if (cached) {
      refetchRecordsSilently();
    } else {
      fetchRecords();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Live sync: refresh dashboard whenever this user's finance records change ---
  // (e.g. added/edited/deleted from the Records page, or from another tab)
  useEffect(() => {
    if (!currentUser?.nUserId) return;

    const channel = echo.channel(`finance.${currentUser.nUserId}`);

    channel.listen(".finance.updated", (e) => {
      console.log("finance.updated event (dashboard):", e);
      refetchRecordsSilently(); // created, updated, or deleted — just refresh, dashboard has no per-row state to patch
    });

    return () => {
      channel.stopListening(".finance.updated");
      echo.leave(`finance.${currentUser.nUserId}`);
    };
  }, [currentUser?.nUserId, refetchRecordsSilently]);

  const summary = useMemo(() => summarize(records), [records]);
  const net = summary.income - summary.expense - summary.savings;

  const stats = [
    { label: "Total Income", value: summary.income, tone: "positive" },
    { label: "Total Expenses", value: summary.expense, tone: "negative" },
    { label: "Total Savings", value: summary.savings, tone: "neutral" },
    { label: "Net Balance", value: net, tone: net >= 0 ? "positive" : "negative" },
  ];

  const recentTransactions = useMemo(() => {
    return [...records]
      .sort((a, b) => new Date(b.dtOccur) - new Date(a.dtOccur))
      .slice(0, 5)
      .map((row) => {
        const isIncome = row.cType === "I";
        const isSavings = row.cType === "S";
        return {
          id: row.nRecordsId,
          title: row.strTitle,
          category: CATEGORY_LABELS[row.cCategory] ?? row.cCategory ?? "—",
          amount: `${isIncome ? "+" : "-"} ₱${formatCurrency(row.dAmount)}`,
          color: isIncome
            ? "text-green-500 dark:text-green-400"
            : isSavings
            ? "text-blue-500 dark:text-blue-400"
            : "text-red-500 dark:text-red-400",
        };
      });
  }, [records]);

  const goToRecords = () => navigate("/records");

  return (
    <ContentPage title="Dashboard">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <ParentCard title="Overall Summary · All Time">
          {stats.map((item) => (
            <ChildCard
              key={item.label}
              label={item.label}
              value={item.value}
              tone={item.tone}
              loading={loading}
            />
          ))}
        </ParentCard>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Recent Transactions
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  Loading...
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                  No transactions yet.
                </div>
              ) : (
                recentTransactions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <h3 className="font-medium text-slate-700 dark:text-slate-200">{item.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
                    </div>
                    <span className={`font-semibold ${item.color}`}>
                      {item.amount}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-5">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={goToRecords}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-white hover:bg-green-700 transition"
              >
                + Record Income
              </button>
              <button
                onClick={goToRecords}
                className="w-full rounded-lg bg-red-600 px-4 py-3 text-white hover:bg-red-700 transition"
              >
                + Add Expense
              </button>
              <button
                onClick={goToRecords}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 transition"
              >
                + Add Savings
              </button>
            </div>
          </div>
        </div>
      </div>
    </ContentPage>
  );
}