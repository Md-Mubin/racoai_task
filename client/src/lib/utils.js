export const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return "—";
  return `$${Number(amount).toLocaleString()}`;
};

export const statusVariant = (status) => {
  const map = {
    OPEN: "open", ASSIGNED: "assigned", IN_PROGRESS: "in_progress",
    UNDER_REVIEW: "under_review", COMPLETED: "completed", CANCELLED: "cancelled",
    PENDING: "pending", SUBMITTED: "submitted", REJECTED: "rejected", ACCEPTED: "accepted",
    LOW: "low", MEDIUM: "medium", HIGH: "high", CRITICAL: "critical",
    ADMIN: "admin", BUYER: "buyer", PROBLEM_SOLVER: "problem_solver",
  };
  return map[status] ?? "default";
};

export const statusLabel = (status) =>
  status?.replace(/_/g, " ") ?? "";
