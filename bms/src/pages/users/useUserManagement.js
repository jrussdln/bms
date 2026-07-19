import { useCallback, useEffect, useMemo, useState } from "react";
import { usersApi } from "../../api/endpoints/users.api";
import echo from "../../lib/echo";
import { getItem, setItem } from "../../utils/storage/localStorage";

const USERS_CACHE_KEY = "users";

export default function useUserManagement() {
  const cached = getItem(USERS_CACHE_KEY);

  const [users, setUsers] = useState(cached ?? []);
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Shared fetch logic — `showLoading` lets callers decide whether this
  // should show the loading spinner (initial mount, no cache) or update
  // silently in the background (cached mount, live sync broadcasts).
  const loadUsers = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const res = await usersApi.getAll({ per_page: 1000 });
      const rows = Array.isArray(res.data) ? res.data : (res.data.data ?? []);
      setUsers(rows);
      setItem(USERS_CACHE_KEY, rows);
    } catch (err) {
      setError(err.response?.data?.message ?? "Failed to load users.");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Public fetchUsers (used by initial mount when there's no cache).
  const fetchUsers = useCallback(() => loadUsers(true), [loadUsers]);

  // Silent refetch — used when we already have cached data to show,
  // and by the broadcast listener. No loading flicker.
  const refetchUsersSilently = useCallback(() => loadUsers(false), [loadUsers]);

  useEffect(() => {
    // If we already showed cached data, refresh silently in the background.
    // Otherwise do a normal loading fetch.
    if (cached) {
      refetchUsersSilently();
    } else {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const channel = echo.channel("users");

    channel.listen(".user.updated", (e) => {
      console.log("user.updated event:", e);

      if (e.action === "deleted") {
        setUsers((prev) => {
          const next = prev.filter((u) => u.nUserId !== e.userId);
          setItem(USERS_CACHE_KEY, next);
          return next;
        });
      } else {
        refetchUsersSilently();
      }
    });

    return () => {
      channel.stopListening(".user.updated");
      echo.leave("users");
    };
  }, [refetchUsersSilently]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return users.filter((user) => {
      if (selectedRole && user.cUserRole !== selectedRole) return false;
      if (selectedStatus && user.cAccountStatus !== selectedStatus)
        return false;

      if (!query) return true;

      const haystack = [user.strName, user.strEmail]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const userSummary = useMemo(
    () => ({
      total: users.length,
      active: users.filter((u) => u.cAccountStatus === "A").length,
      suspended: users.filter((u) => u.cAccountStatus === "S").length,
    }),
    [users],
  );

  const handleAddClick = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleEditClick = (row) => {
    setSelectedUser(row);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete user "${row.strName}"?`)) return;
    setDeletingId(row.nUserId);
    try {
      await usersApi.delete(row.nUserId);
      // No fetch here — the "user.deleted" broadcast updates state (and cache) for everyone, including this tab.
    } catch (err) {
      alert(err.response?.data?.message ?? "Failed to delete user.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (row) => {
    const nextStatus = row.cAccountStatus === "A" ? "S" : "A";
    setUpdatingStatusId(row.nUserId);
    try {
      await usersApi.updateAccountStatus(row.nUserId, nextStatus);
      // No fetch here — the "user.updated" broadcast refreshes the list (and cache) for everyone.
    } catch (err) {
      alert(err.response?.data?.message ?? "Failed to update status.");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  return {
    users,
    filteredUsers,
    loading,
    error,
    modalOpen,
    selectedUser,
    deletingId,
    updatingStatusId,
    handleAddClick,
    handleEditClick,
    handleModalClose,
    handleDelete,
    handleToggleStatus,
    fetchUsers,
    searchQuery,
    setSearchQuery,
    selectedRole,
    setSelectedRole,
    selectedStatus,
    setSelectedStatus,
    userSummary,
  };
}