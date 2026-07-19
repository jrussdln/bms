import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ContentPage from "../../layouts/page/content-page/ContentPage";
import Table from "../../components/table/Table";
import Button from "../../components/form/Buttons";
import SearchBar from "../../components/form/SearchBar";
import Filter from "../../components/form/Filter";
import UserAEModal from "./modal/UserAEModal";
import ParentCard from "../../components/card/ParentCard";
import ChildCard from "../../components/card/ChildCard";
import { USER_ROLE, ROLE_LABELS } from "../../constants/user-roles";
import {
  ACCOUNT_STATUS_LABELS,
  STATUS_LABELS,
} from "../../constants/user-status";
import {
  formatDateTime,
  formatRelativeTime,
} from "../../utils/formatters/datetime";

// Fallback badge colors keyed by cUserRole/cAccountStatus values.
const roleBadgeStyles = {
  [USER_ROLE.ADMIN]:
    "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
  [USER_ROLE.USER]:
    "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
};

const accountStatusBadgeStyles = {
  A: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
  S: "bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400",
};

export default function UserManagementView({
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
}) {
  const columns = [
    { key: "strName", label: "Name" },
    { key: "strEmail", label: "Email" },
    {
      key: "cUserRole",
      label: "Role",
      align: "center",
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            roleBadgeStyles[row.cUserRole] ?? roleBadgeStyles[USER_ROLE.USER]
          }`}
        >
          {ROLE_LABELS[row.cUserRole] ?? row.cUserRole}
        </span>
      ),
    },
    {
      key: "cCurrentStatus",
      label: "Status",
      align: "center",
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            accountStatusBadgeStyles[row.cCurrentStatus] ??
            accountStatusBadgeStyles.A
          }`}
        >
          {row.cCurrentStatus === "X"
            ? formatRelativeTime(row.dtLoggedIn)
            : (STATUS_LABELS[row.cCurrentStatus] ?? row.cCurrentStatus)}
        </span>
      ),
    },  
    {
      key: "cAccountStatus",
      label: "Account Status",
      align: "center",
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            accountStatusBadgeStyles[row.cAccountStatus] ??
            accountStatusBadgeStyles.A
          }`}
        >
          {ACCOUNT_STATUS_LABELS[row.cAccountStatus] ?? row.cAccountStatus}
        </span>
      ),
    },
    {
      key: "dtCreated",
      label: "Joined",
      align: "center",
      render: (row) => formatDateTime(row.dtCreated),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      isAction: true,
      render: (row) => (
        <>
          <Button
            icon={<EditOutlinedIcon fontSize="small" />}
            tooltip="Edit"
            actionColor="edit"
            onClick={() => handleEditClick(row)}
          />
          <Button
            icon={
              row.cAccountStatus === "A" ? (
                <BlockOutlinedIcon fontSize="small" />
              ) : (
                <CheckCircleOutlinedIcon fontSize="small" />
              )
            }
            tooltip={row.cAccountStatus === "A" ? "Suspend" : "Activate"}
            actionColor={row.cAccountStatus === "A" ? "delete" : "edit"}
            onClick={() => handleToggleStatus(row)}
            disabled={updatingStatusId === row.nUserId}
          />
          <Button
            icon={<DeleteOutlineIcon fontSize="small" />}
            tooltip="Delete"
            actionColor="delete"
            onClick={() => handleDelete(row)}
            disabled={deletingId === row.nUserId}
          />
        </>
      ),
    },
  ];

  return (
    <ContentPage title="Users">
      <div className="space-y-4">
        <ParentCard title="User Overview" columns="grid-cols-2 sm:grid-cols-3">
          <ChildCard
            label="Total Users"
            value={userSummary.total}
            tone="indigo"
            currency={false}
            loading={loading}
          />
          <ChildCard
            label="Active"
            value={userSummary.active}
            tone="positive"
            currency={false}
            loading={loading}
          />
          <ChildCard
            label="Suspended"
            value={userSummary.suspended}
            tone="negative"
            currency={false}
            loading={loading}
          />
        </ParentCard>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name or email..."
            className="w-full sm:flex-1 sm:min-w-50 sm:max-w-md"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Filter
              filters={[
                {
                  key: "status",
                  value: selectedStatus,
                  onChange: setSelectedStatus,
                  options: ACCOUNT_STATUS_LABELS,
                },
              ]}
            />
            <Button
              label="Add User"
              actionColor="add"
              onClick={handleAddClick}
            />
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            Failed to load users: {error}
          </div>
        )}

        <Table
          columns={columns}
          rows={filteredUsers}
          getRowId={(row) => row.nUserId}
          loading={loading}
          emptyMessage="No users found."
        />
      </div>

    <UserAEModal
        open={modalOpen}
        onClose={handleModalClose}
        user={selectedUser}
      />
    </ContentPage>
  );
}
