import clsx from "clsx";

const variants = {
  default:      "bg-border text-text-muted",
  brand:        "bg-brand-light text-brand-dark",
  open:         "bg-blue-100 text-blue-600",
  assigned:     "bg-violet-100 text-violet-600",
  in_progress:  "bg-amber-100 text-amber-600",
  under_review: "bg-cyan-100 text-cyan-600",
  completed:    "bg-green-100 text-green-700",
  cancelled:    "bg-gray-100 text-gray-500",
  pending:      "bg-amber-100 text-amber-600",
  submitted:    "bg-cyan-100 text-cyan-600",
  rejected:     "bg-red-100 text-red-600",
  accepted:     "bg-green-100 text-green-700",
  low:          "bg-green-50 text-green-700",
  medium:       "bg-amber-50 text-amber-700",
  high:         "bg-orange-100 text-orange-700",
  critical:     "bg-red-100 text-red-600",
  admin:        "bg-violet-100 text-violet-700",
  buyer:        "bg-blue-100 text-blue-700",
  problem_solver: "bg-green-100 text-green-700",
};

export function Badge({ children, variant = "default" }) {
  return (
    <span className={clsx(
      "inline-block px-2.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap",
      variants[variant] ?? variants.default
    )}>
      {children}
    </span>
  );
}
