import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="border-b px-6 py-6">
        <h1 className="text-2xl font-bold text-blue-600">
          SR Booking
        </h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        <Link
          href="/dashboard"
          className="block rounded-xl px-4 py-3 transition hover:bg-blue-50 hover:text-blue-600"
        >
          Dashboard
        </Link>

        <Link
          href="/dashboard/appointments"
          className="block rounded-xl px-4 py-3 transition hover:bg-blue-50 hover:text-blue-600"
        >
          Appointments
        </Link>

        <Link
          href="/dashboard/customers"
          className="block rounded-xl px-4 py-3 transition hover:bg-blue-50 hover:text-blue-600"
        >
          Customers
        </Link>

        <Link
          href="/dashboard/services"
          className="block rounded-xl px-4 py-3 transition hover:bg-blue-50 hover:text-blue-600"
        >
          Services
        </Link>

        <Link
          href="/dashboard/settings"
          className="block rounded-xl px-4 py-3 transition hover:bg-blue-50 hover:text-blue-600"
        >
          Settings
        </Link>
      </nav>
    </aside>
  );
}