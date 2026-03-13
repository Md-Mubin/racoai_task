import clsx from "clsx";

export function Input({ label, name, type = "text", value, onChange, placeholder, required, disabled, className }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-semibold text-text-muted">{label}</label>
      )}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={clsx(
          "w-full px-3 py-2 rounded-sm border border-border text-sm text-text bg-surface",
          "placeholder:text-text-light transition-all duration-150",
          "focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light",
          disabled && "bg-bg text-text-muted cursor-not-allowed",
          className
        )}
      />
    </div>
  );
}
