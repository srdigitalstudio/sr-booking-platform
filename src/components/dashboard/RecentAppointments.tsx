import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { mockAppointments } from "@/lib/mockAppointments";

export function RecentAppointments() {
  return (
    <Card className="rounded-2xl border-0 shadow-md">
      <CardHeader>
        <CardTitle>Recent Appointments</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b text-left text-sm text-muted-foreground">
              <tr>
                <th className="pb-4">Customer</th>
                <th className="pb-4">Service</th>
                <th className="pb-4">Date</th>
                <th className="pb-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {mockAppointments.map((appointment) => (
                <tr
                  key={appointment.id}
                  className="border-b last:border-0"
                >
                  <td className="py-4 font-medium">
                    {appointment.customer}
                  </td>

                  <td>{appointment.service}</td>

                  <td>
                    {appointment.date} • {appointment.time}
                  </td>

                  <td>
                    <StatusBadge
                      status={appointment.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}