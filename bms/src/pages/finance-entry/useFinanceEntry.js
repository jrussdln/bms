import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../../api/axios";
import echo from "../../lib/echo";
import { useAuth } from "../../hooks/useAuth";
import { CATEGORY_LABELS } from "../../constants/finance-category";
import { TYPE_LABELS, ALL } from "../../constants/finance-type";
import { MONTH_NAMES } from "../../constants/month-names";
import { summarize } from "./summarize";
import { getItem, setItem } from "../../utils/storage/localStorage";

const RECORDS_CACHE_KEY = "finance_records";

export default function useFinanceEntryView() {
  const { user: currentUser } = useAuth();

  const cached = getItem(RECORDS_CACHE_KEY);

  const [records, setRecords] = useState(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const today = new Date();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());

  // Shared fetch logic — `showLoading` lets callers decide whether this
  // should show the loading spinner (initial mount, no cache) or update
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
      setError(err.response?.data?.message ?? "Failed to load records.");
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

  // --- Live sync via per-user public channel ---
  useEffect(() => {
    if (!currentUser?.nUserId) return;

    const channel = echo.channel(`finance.${currentUser.nUserId}`);

    channel.listen(".finance.updated", (e) => {
      console.log("finance.updated event:", e);

      if (e.action === "deleted") {
        setRecords((prev) => {
          const next = prev.filter((r) => r.nRecordsId !== e.recordId);
          setItem(RECORDS_CACHE_KEY, next);
          return next;
        });
      } else {
        refetchRecordsSilently();
      }
    });

    return () => {
      channel.stopListening(".finance.updated");
      echo.leave(`finance.${currentUser.nUserId}`);
    };
  }, [currentUser?.nUserId, refetchRecordsSilently]);

  const filteredRecords = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return records.filter((row) => {
      if (row.dtOccur) {
        const occurDate = new Date(row.dtOccur);

        if (
          selectedYear !== ALL &&
          occurDate.getFullYear() !== Number(selectedYear)
        ) {
          return false;
        }
        if (
          selectedMonth !== ALL &&
          occurDate.getMonth() !== Number(selectedMonth)
        ) {
          return false;
        }
      } else if (selectedYear !== ALL || selectedMonth !== ALL) {
        return false;
      }

      if (!query) return true;

      const categoryLabel = (
        CATEGORY_LABELS[row.cCategory] ??
        row.cCategory ??
        ""
      ).toLowerCase();
      const typeLabel = (
        TYPE_LABELS[row.cType] ??
        row.cType ??
        ""
      ).toLowerCase();

      const haystack = [row.strTitle, row.strNote, categoryLabel, typeLabel]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [records, searchQuery, selectedMonth, selectedYear]);

  const periodSummary = useMemo(
    () => summarize(filteredRecords),
    [filteredRecords],
  );

  const periodNet =
    periodSummary.income - periodSummary.expense - periodSummary.savings;

  const periodLabel = useMemo(() => {
    if (searchQuery.trim()) return "Filtered Results";
    if (selectedMonth === ALL && selectedYear === ALL) return "All Time";
    if (selectedMonth === ALL) return String(selectedYear);
    if (selectedYear === ALL) return MONTH_NAMES[Number(selectedMonth)];
    return `${MONTH_NAMES[Number(selectedMonth)]} ${selectedYear}`;
  }, [searchQuery, selectedMonth, selectedYear]);

  const handleAddClick = () => {
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const handleEditClick = (row) => {
    setSelectedRecord(row);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedRecord(null);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete record "${row.strTitle}"?`)) return;
    setDeletingId(row.nRecordsId);
    try {
      await api.delete(`/records/${row.nRecordsId}`);
      // No fetchRecords() here — the "finance.updated" broadcast (action: "deleted") updates state + cache.
    } catch (err) {
      alert(err.response?.data?.message ?? "Failed to delete record.");
    } finally {
      setDeletingId(null);
    }
  };

  return {
    records,
    filteredRecords,
    loading,
    error,
    modalOpen,
    selectedRecord,
    deletingId,
    handleAddClick,
    handleEditClick,
    handleModalClose,
    handleDelete,
    fetchRecords,
    searchQuery,
    setSearchQuery,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    periodSummary,
    periodNet,
    periodLabel,
  };
}