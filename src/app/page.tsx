import { Header } from "@/components/layout/Header";

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-7xl flex-col items-center justify-center px-6">
        <span className="rounded-full border px-4 py-1 text-sm font-medium text-blue-600">
          SR Booking Platform
        </span>

        <h1 className="mt-6 text-center text-5xl font-bold tracking-tight">
          Modern Booking Platform
          <br />
          for Every Business
        </h1>

        <p className="mt-6 max-w-2xl text-center text-lg text-muted-foreground">
          A modern appointment booking platform designed for clinics, salons,
          consultants, gyms, and service businesses.
        </p>
      </main>
    </>
  );
}