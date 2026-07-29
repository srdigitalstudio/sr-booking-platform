import { AppointmentsManager } from "@/components/dashboard/AppointmentsManager";

export default function AppointmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Appointments
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage all customer appointments.
        </p>
      </div>

      <AppointmentsManager />
    </div>
  );
}