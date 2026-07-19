import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined";

export default function Filter({ filters = [] }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2">
      <FilterListOutlinedIcon
        fontSize="small"
        className="text-slate-400 dark:text-slate-500"
      />

      {filters.map(({ key, value, onChange, options }) => (
        <select
          key={key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-sm text-slate-700 dark:text-slate-100 focus:outline-none"
        >
          <option value="">All</option>
          {Object.entries(options).map(([optValue, label]) => (
            <option key={optValue} value={optValue}>
              {label}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}