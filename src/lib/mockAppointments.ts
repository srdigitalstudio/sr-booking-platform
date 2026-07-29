import { Appointment } from "@/types/appointment";

export const mockAppointments: Appointment[] = [
  {
    id: "1",
    customer: "Sarah Johnson",
    service: "Haircut",
    date: "Today",
    time: "10:30 AM",
    status: "confirmed",
  },
  {
    id: "2",
    customer: "Michael Brown",
    service: "Massage",
    date: "Today",
    time: "01:00 PM",
    status: "pending",
  },
  {
    id: "3",
    customer: "Emily Davis",
    service: "Dental Checkup",
    date: "Tomorrow",
    time: "09:00 AM",
    status: "confirmed",
  },
  {
    id: "4",
    customer: "John Smith",
    service: "Consultation",
    date: "Tomorrow",
    time: "03:30 PM",
    status: "cancelled",
  },
];