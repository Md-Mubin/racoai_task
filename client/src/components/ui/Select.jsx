import clsx from "clsx";

export function Select({ label, name, value, onChange, options, className }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-text-muted">{label}</label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={clsx(
          "w-full px-3 py-2 rounded-sm border border-border text-sm text-text bg-surface",
          "cursor-pointer transition-all duration-150 appearance-none",
          "focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light",
          className
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
