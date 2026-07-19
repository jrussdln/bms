import { useMemo, useState } from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Skeleton,
} from "@mui/material";
import Pagination from "./Pagination";

/**
 * Reusable table component built on MUI, with built-in pagination and sorting.
 *
 * Props:
 * - columns: [{
 *     key: string,
 *     label: string,
 *     align?: "left"|"right"|"center",
 *     render?: (row, rowIndex) => ReactNode,
 *     sortable?: boolean (default true, unless col.isAction is true),
 *     sortValue?: (row) => string|number  // optional, overrides row[col.key] for sorting
 *   }]
 * - rows: array of data objects
 * - getRowId: (row) => string|number, unique key per row (defaults to row.id)
 * - rowsPerPageOptions: array of selectable page sizes
 *   (default [10, 25, 50, 100, { label: "All", value: -1 }])
 * - defaultRowsPerPage: initial rows per page (default 10)
 * - emptyMessage: text shown when rows is empty
 * - loading: boolean, when true renders skeleton placeholder rows instead of data
 * - skeletonRowCount: number of skeleton rows to render while loading (defaults to rowsPerPage)
 * - maxHeight: optional max height (number in px, or any CSS size string like "60vh")
 *   for the table body. When set, the header becomes sticky and the body scrolls
 *   internally instead of growing the page. Omit for the table's natural height.
 *
 * Alignment defaults:
 * - Header cells default to "center" unless col.align is set.
 * - Body cells default to "left" unless col.align is set.
 * - Setting col.align on a column applies that alignment to BOTH the
 *   header and the body cell for that column (e.g. align: "center" centers
 *   both the label and the data).
 *
 * Sorting:
 * - Click a sortable column header to sort ascending; click again for
 *   descending; click a third time to sort a different column (state resets
 *   per-column — clicking a column always starts at ascending).
 * - By default every column is sortable except the auto-added "#" column
 *   and any column with isAction: true. Set sortable: false to opt a
 *   column out explicitly.
 * - Sorting uses col.sortValue(row) if provided, else row[col.key].
 *   Strings are compared case-insensitively; numbers/dates compare naturally.
 *
 * A "#" row-number column is automatically prepended to every table,
 * showing each row's position (accounting for sorting + pagination).
 *
 * Example:
 * <Table
 *   columns={[
 *     { key: "strSource", label: "Source" },
 *     { key: "cCategory", label: "Category" },
 *     { key: "dtOccur", label: "Date" },
 *     {
 *       key: "dAmount",
 *       label: "Amount",
 *       align: "right",
 *       render: (row) => `+ ₱${Number(row.dAmount).toLocaleString()}`,
 *     },
 *   ]}
 *   rows={incomeEntries}
 *   getRowId={(row) => row.nIncomeId}
 *   loading={isFetching}
 *   maxHeight={480}
 * />
 */
export default function Table({
  columns,
  rows = [],
  getRowId = (row) => row.id,
  rowsPerPageOptions = [ { label: "All", value: -1 }, 10, 25, 50, 100],
  defaultRowsPerPage = 10,
  emptyMessage = "No records found.",
  loading = false,
  skeletonRowCount,
maxHeight="35vh"
}) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [orderBy, setOrderBy] = useState(null);
  const [order, setOrder] = useState("asc");

  const handlePageChange = (_event, newPage) => {
    setPage(newPage);
  };
  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (col) => {
    if (orderBy === col.key) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setOrderBy(col.key);
      setOrder("asc");
    }
    setPage(0);
  };

  const allColumns = [
    {
      key: "__rowNumber",
      label: "#",
      align: "center",
      sortable: false,
      render: (_row, rowIndex) => page * rowsPerPage + rowIndex + 1,
    },
    ...columns,
  ];

  const activeSortCol = allColumns.find((col) => col.key === orderBy);

  const sortedRows = useMemo(() => {
    if (!activeSortCol) return rows;

    const getValue = activeSortCol.sortValue
      ? activeSortCol.sortValue
      : (row) => row[activeSortCol.key];

    const compare = (a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);

      if (valA == null && valB == null) return 0;
      if (valA == null) return -1;
      if (valB == null) return 1;

      if (typeof valA === "string" || typeof valB === "string") {
        return String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      }

      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    };

    const sorted = [...rows].sort(compare);
    return order === "asc" ? sorted : sorted.reverse();
  }, [rows, activeSortCol, order]);

  const isShowingAll = rowsPerPage === -1;
  const paginatedRows = isShowingAll
    ? sortedRows
    : sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const skeletonCount = skeletonRowCount ?? (isShowingAll ? rows.length : rowsPerPage);

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "0.75rem",
        overflow: "hidden",
        borderColor: "divider",
      }}
    >
      <TableContainer sx={maxHeight ? { maxHeight } : undefined}>
        <MuiTable size="small" stickyHeader={Boolean(maxHeight)}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "action.hover" }}>
              {allColumns.map((col) => {
                const isSortable = col.sortable ?? !col.isAction;
                const align = col.align ?? "center";

                return (
                  <TableCell
                    key={col.key}
                    align={align}
                    sortDirection={orderBy === col.key ? order : false}
                    sx={{
                      fontWeight: 500,
                      color: "text.secondary",
                      fontSize: "0.8rem",
                      borderColor: "divider",
                      ...(maxHeight && {
                        backgroundColor: "background.paper",
                      }),
                    }}
                  >
                    {isSortable ? (
                      <TableSortLabel
                        active={orderBy === col.key}
                        direction={orderBy === col.key ? order : "asc"}
                        onClick={() => handleSort(col)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: skeletonCount }).map((_, rowIndex) => (
                <TableRow
                  key={`skeleton-row-${rowIndex}`}
                  sx={{ "& td": { borderColor: "divider" } }}
                >
                  {allColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.align ?? "left"}
                      sx={{ fontSize: "0.85rem" }}
                    >
                      <Skeleton
                        variant="text"
                        sx={{
                          fontSize: "0.85rem",
                          mx: col.align === "center" ? "auto" : undefined,
                          ml: col.align === "right" ? "auto" : undefined,
                        }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
                  align="center"
                  sx={{ py: 4, color: "text.disabled", fontSize: "0.85rem" }}
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedRows.map((row, rowIndex) => (
                <TableRow
                  key={getRowId(row)}
                  hover
                  sx={{
                    "&:hover": { backgroundColor: "action.hover" },
                    "& td": { borderColor: "divider" },
                  }}
                >
                  {allColumns.map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.align ?? "left"}
                      sx={{
                        fontSize: "0.85rem",
                        color: "text.primary",
                        ...(col.isAction && {
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }),
                      }}
                    >
                      {col.render ? col.render(row, rowIndex) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
      {rows.length > 0 && (
        <Pagination
          count={rows.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      )}
    </Paper>
  );
}