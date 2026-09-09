import { AppointmentStatus } from "@/types/appointment";

type StatusBadgeProps = {
  status: AppointmentStatus;
};

const styles: Record<AppointmentStatus, string> = {
  confirmed:
    "border-green-200 bg-green-100 text-green-700 dark:border-green-900/60 dark:bg-green-950/50 dark:text-green-400",

  pending:
    "border-yellow-200 bg-yellow-100 text-yellow-700 dark:border-yellow-900/60 dark:bg-yellow-950/50 dark:text-yellow-400",

  cancelled:
    "border-red-200 bg-red-100 text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-400",

  completed:
    "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-400",
};

const labels: Record<AppointmentStatus, string> = {
  confirmed: "Confirmed",
  pending: "Pending",
  cancelled: "Cancelled",
  completed: "Completed",
};

export function StatusBadge({
  status,
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}