export function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-2xl font-bold">
          Dashboard
        </h2>

        <p className="text-sm text-muted-foreground">
          Welcome back 👋
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition">
          New Booking
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 font-semibold">
          SR
        </div>
      </div>
    </header>
  );
}