import clsx from "clsx";

export function Textarea({ label, name, value, onChange, placeholder, rows = 4, required, className }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-text-muted">{label}</label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={clsx(
          "w-full px-3 py-2 rounded-sm border border-border text-sm text-text bg-surface",
          "placeholder:text-text-light resize-vertical leading-relaxed transition-all duration-150",
          "focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light",
          className
        )}
      />
    </div>
  );
}
