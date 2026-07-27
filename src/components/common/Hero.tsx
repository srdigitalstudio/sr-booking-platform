import { Button } from "@/components/ui/button";
import { Section } from "./Section";

export function Hero() {
  return (
    <Section className="pt-24">
      <div className="mx-auto max-w-4xl text-center">
        <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-600">
          🚀 Modern Booking Platform
        </span>

        <h1 className="mt-8 text-5xl font-extrabold tracking-tight md:text-7xl">
          Appointment Booking
          <span className="block text-blue-600">
            Made Simple
          </span>
        </h1>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
          Build a professional booking experience for clinics, beauty salons,
          consultants, gyms and any service-based business with SR Booking
          Platform.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg">Get Started</Button>

          <Button size="lg" variant="outline">
            Live Demo
          </Button>
        </div>
      </div>
    </Section>
  );
}