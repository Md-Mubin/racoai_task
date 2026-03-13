import clsx from "clsx";

const variants = {
  primary:   "bg-brand text-white hover:bg-brand-dark",
  secondary: "bg-brand-light text-brand-dark hover:opacity-80",
  ghost:     "bg-transparent text-text border border-border hover:bg-bg",
  danger:    "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-6 py-2.5",
};

export function Button({ children, onClick, type = "button", variant = "primary", size = "md", disabled, className }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-sm font-semibold transition-all duration-150 whitespace-nowrap active:scale-95",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
}
