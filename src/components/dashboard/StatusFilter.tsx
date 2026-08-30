import { AppointmentStatus } from "@/types/appointment";

type StatusFilterProps = {
  value: AppointmentStatus | "all";
  onChange: (value: AppointmentStatus | "all") => void;
};

export function StatusFilter({
  value,
  onChange,
}: StatusFilterProps) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value as AppointmentStatus | "all"
        )
      }
      className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none transition focus:ring-2 focus:ring-blue-500 dark:bg-card dark:text-foreground"
    >
      <option value="all">All</option>
      <option value="confirmed">Confirmed</option>
      <option value="pending">Pending</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
