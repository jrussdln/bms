import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined";
/**
 * Reusable search input with a leading search icon and a clear (x) button.
 *
 * Props:
 * - value: string - current search text
 * - onChange: (value: string) => void - called with the new text on every keystroke
 * - onClear: () => void - optional, called when the clear button is pressed
 *            (defaults to onChange(""))
 * - placeholder: string - input placeholder text
 * - className: string - optional extra classes for the wrapper
 */
export default function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  
  className = "",
}) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange("");
    }
  };
  return (
    <div
      className={`flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-2 shadow-sm transition focus-within:ring-2 focus-within:ring-blue-500 ${className}`}
    >
      <SearchOutlinedIcon
        fontSize="small"
        className="text-slate-400 dark:text-slate-500"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-0 bg-transparent text-sm text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="rounded-full p-1 text-slate-400 dark:text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-slate-600 dark:hover:text-slate-300"
        >
          <ClearOutlinedIcon fontSize="small" />
        </button>
      )}
    </div>
  );
}
