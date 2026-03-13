import clsx from "clsx";

export function Card({ children, className }) {
  return (
    <div className={clsx(
      "bg-surface border border-border rounded-lg p-5 shadow-sm hover:shadow transition-shadow duration-200",
      className
    )}>
      {children}
    </div>
  );
}
