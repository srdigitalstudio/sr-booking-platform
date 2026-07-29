import { AppointmentDialog } from "@/components/dashboard/AppointmentDialog";
import { AppointmentTable } from "@/components/dashboard/AppointmentTable";

export default function AppointmentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Appointments
          </h1>

          <p className="mt-2 text-muted-foreground">
            Manage all customer appointments.
          </p>
        </div>

        <AppointmentDialog />
      </div>

      

      <AppointmentTable />
    </div>
  );
}