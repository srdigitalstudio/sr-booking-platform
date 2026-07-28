import { Button } from "@/components/ui/button";
import { FadeIn } from "./FadeIn";
import { Section } from "./Section";

export function Hero() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pt-24">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-blue-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <FadeIn>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-600">
            🚀 Modern Booking Platform
          </span>
        </FadeIn>

        <FadeIn delay={0.15}>
          <h1 className="mt-8 text-5xl font-extrabold tracking-tight md:text-7xl">
            Appointment Booking
            <span className="block bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Made Simple
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-muted-foreground">
            Build a professional booking experience for clinics, beauty salons,
            consultants, gyms and any service-based business with SR Booking
            Platform.
          </p>
        </FadeIn>

        <FadeIn delay={0.45}>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="transition-transform duration-300 hover:scale-105"
            >
              Get Started
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="transition-transform duration-300 hover:scale-105"
            >
              Live Demo
            </Button>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}