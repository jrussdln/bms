import { TablePagination } from "@mui/material";

/**
 * Reusable pagination component for tables.
 *
 * Props:
 * - count: total number of rows (across all pages)
 * - page: current page index (0-based, per MUI convention)
 * - rowsPerPage: number of rows shown per page (default 10)
 * - onPageChange: (event, newPage) => void
 * - onRowsPerPageChange: (event) => void
 * - rowsPerPageOptions: array of selectable page sizes
 *   (default [10, 25, 50, 100, { label: "All", value: -1 }])
 *
 * Note: when "All" is selected, rowsPerPage will be -1. Consuming
 * components must handle that value when slicing rows, e.g.:
 *   const rows = rowsPerPage === -1
 *     ? filteredRows
 *     : filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
 */
export default function Pagination({
  count,
  page,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [ { label: "All", value: -1 }, 10, 25, 50, 100],
}) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={rowsPerPageOptions}
      labelDisplayedRows={({ from, to, count }) =>
        rowsPerPage === -1
          ? `1–${count} of ${count}`
          : `${from}–${to} of ${count}`
      }
      sx={{
        borderTop: "1px solid",
        borderColor: "divider",
        ".MuiTablePagination-toolbar": {
          paddingLeft: 2,
          paddingRight: 1,
        },
        ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
          fontSize: "0.85rem",
          color: "text.secondary",
        },
      }}
    />
  );
}