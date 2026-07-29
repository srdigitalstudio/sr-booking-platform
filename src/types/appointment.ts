export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "cancelled";

export interface Appointment {
  id: string;
  customer: string;
  service: string;
  date: string;
  time: string;
  status: AppointmentStatus;
}