import { Plus } from "lucide-react";

import { AppointmentTable } from "@/components/dashboard/AppointmentTable";
import { Button } from "@/components/ui/button";

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

        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Appointment
        </Button>
      </div>

      

      <AppointmentTable />
    </div>
  );
}