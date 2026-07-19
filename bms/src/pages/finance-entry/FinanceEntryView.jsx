import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import ContentPage from "../../layouts/page/content-page/ContentPage";
import Table from "../../components/table/Table";
import Button from "../../components/form/Buttons";
import SearchBar from "../../components/form/SearchBar";
import FinanceAEModal from "./modal/FinanceAEModal";
import ParentCard from "../../components/card/ParentCard";
import ChildCard from "../../components/card/ChildCard";
import { CATEGORY_LABELS } from "../../constants/finance-category";
import { TYPE_LABELS } from "../../constants/finance-type";
import { formatCurrency } from "../../utils/formatters/currency";
import DateFilter from "../../components/form/DateFilter";

export default function FinanceEntryView({
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
}) {
  const columns = [
    { key: "strTitle", label: "Description" },
    {
      key: "cCategory",
      label: "Category",
      align: "center",
      render: (row) => CATEGORY_LABELS[row.cCategory] ?? row.cCategory,
    },
    {
      key: "cType",
      label: "Type",
      align: "center",
      render: (row) => TYPE_LABELS[row.cType] ?? row.cType ?? "—",
    },
    {
      key: "dtOccur",
      label: "Date",
      align: "center",
      render: (row) =>
        row.dtOccur
          ? new Date(row.dtOccur).toLocaleString("en-PH", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "—",
    },
    { key: "strNote", label: "Note" },
    {
      key: "dAmount",
      label: "Amount",
      align: "right",
      render: (row) => {
        const isIncome = row.cType === "I";
        return (
          <span className={isIncome ? "text-green-600" : "text-red-600"}>
            {isIncome ? "+" : "-"} ₱{formatCurrency(row.dAmount)}
          </span>
        );
      },
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
            icon={<DeleteOutlineIcon fontSize="small" />}
            tooltip="Delete"
            actionColor="delete"
            onClick={() => handleDelete(row)}
            disabled={deletingId === row.nRecordsId}
          />
        </>
      ),
    },
  ];

  return (
    <ContentPage title="Finance Entry">
      <div className="space-y-4">
        <ParentCard title={`${periodLabel} Summary`}>
          <ChildCard
            label="Income"
            value={periodSummary.income}
            tone="positive"
            loading={loading}
          />
          <ChildCard
            label="Expenses"
            value={periodSummary.expense}
            tone="negative"
            loading={loading}
          />
          <ChildCard
            label="Savings"
            value={periodSummary.savings}
            tone="neutral"
            loading={loading}
          />
          <ChildCard label="Net" value={periodNet} loading={loading} />
        </ParentCard>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by description, note, category, or type..."
            className="w-full sm:flex-1 sm:min-w-50 sm:max-w-md"
          />
          <div className="flex flex-wrap items-center gap-3">
            <DateFilter
              showMonth
              showYear
              allowAll
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              year={selectedYear}
              onYearChange={setSelectedYear}
            />
            <Button
              label="Add Record"
              actionColor="add"
              onClick={handleAddClick}
            />
          </div>
        </div>
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            Failed to load records: {error}
          </div>
        )}

        <Table
          columns={columns}
          rows={filteredRecords}
          getRowId={(row) => row.nRecordsId}
          loading={loading}
          emptyMessage="No records found."
        />
      </div>

      <FinanceAEModal
        open={modalOpen}
        onClose={handleModalClose}
        record={selectedRecord}
      />
    </ContentPage>
  );
}
