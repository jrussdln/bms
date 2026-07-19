import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { MONTH_NAMES } from "../../constants/month-names";
import { ALL } from "../../constants/finance-type";

const SELECT_CLASS =
  "h-full appearance-none bg-transparent pl-3 pr-7 text-sm font-medium " +
  "text-slate-700 dark:text-slate-200 cursor-pointer outline-none " +
  "transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/60";
const daysInMonth = (month, year) => {
  if (month === ALL || year === ALL || month === "" || year === "") {
    return 31;
  }
  return new Date(Number(year), Number(month) + 1, 0).getDate();
};

const buildYearRange = (yearsBack = 5, yearsForward = 1) => {
  const current = new Date().getFullYear();
  return Array.from(
    { length: yearsBack + yearsForward + 1 },
    (_, i) => current + yearsForward - i,
  );
};

/** A select with its own chevron, since appearance-none strips the native one. */
function FilterSelect({ value, onChange, options, ariaLabel }) {
  return (
    <div className="relative flex h-8 items-center">
      <select
        aria-label={ariaLabel}
        className={SELECT_CLASS}
        value={value}
        onChange={onChange}
      >
        {options}
      </select>
      <KeyboardArrowDownRoundedIcon
        fontSize="small"
        className="pointer-events-none absolute right-0.5 text-slate-400 dark:text-slate-500"
        sx={{ fontSize: 20 }}
      />
    </div>
  );
}

/**
 * Compact Day / Month / Year filter pill. Renders any combination via the
 * show* props, fully controlled by the parent — no internal date state.
 *
 * Usage:
 *   <DateFilter
 *     showMonth showYear allowAll
 *     month={selectedMonth} onMonthChange={setSelectedMonth}
 *     year={selectedYear} onYearChange={setSelectedYear}
 *   />
 *
 * Props:
 * - showDay / showMonth / showYear: which dropdowns to render
 * - day / month / year + onDayChange / onMonthChange / onYearChange:
 *   controlled values (month is 0-indexed) and their setters
 * - allowAll: adds an "All" option to every visible dropdown
 * - years / yearsBack / yearsForward: control the year option list
 * - className: extra classes for the wrapper pill
 */
export default function DateFilter({
  showDay = false,
  showMonth = true,
  showYear = true,

  day,
  onDayChange,
  month,
  onMonthChange,
  year,
  onYearChange,

  allowAll = false,
  years,
  yearsBack = 5,
  yearsForward = 1,

  className = "",
}) {
  const yearOptions = years ?? buildYearRange(yearsBack, yearsForward);
  const dayOptions = Array.from(
    { length: daysInMonth(month, year) },
    (_, i) => i + 1,
  );

  if (!showDay && !showMonth && !showYear) return null;

  const change = (onChange) => (e) =>
    onChange?.(
      e.target.value === String(ALL) ? ALL : Number(e.target.value),
    );

  return (
<div
  className={
    "inline-flex h-10 items-center gap-1 rounded-full border border-slate-300 " +
    "dark:border-slate-700 bg-white dark:bg-slate-800 pl-3 pr-2 shadow-sm " +
    "focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 " +
    `transition-colors ${className}`
  }
>
      <CalendarTodayOutlinedIcon
        className="text-slate-400 dark:text-slate-500"
        sx={{ fontSize: 18 }}
      />

      {showDay && (
        <FilterSelect
          ariaLabel="Day"
          value={day}
          onChange={change(onDayChange)}
          options={
            <>
              {allowAll && <option value={ALL}>All</option>}
              {dayOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </>
          }
        />
      )}

      {showMonth && (
        <FilterSelect
          ariaLabel="Month"
          value={month}
          onChange={change(onMonthChange)}
          options={
            <>
              {allowAll && <option value={ALL}>All</option>}
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index}>
                  {name.slice(0, 3)}
                </option>
              ))}
            </>
          }
        />
      )}

      {showYear && (
        <FilterSelect
          ariaLabel="Year"
          value={year}
          onChange={change(onYearChange)}
          options={
            <>
              {allowAll && <option value={ALL}>All</option>}
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </>
          }
        />
      )}
    </div>
  );
}