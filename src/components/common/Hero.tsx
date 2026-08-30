import Link from "next/link";

import { FadeIn } from "./FadeIn";
import { Section } from "./Section";

export function Hero() {
  return (
    <Section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pt-24 dark:from-blue-950/30 dark:via-background dark:to-background">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-600/10" />

      <div className="relative mx-auto max-w-4xl text-center">
        <FadeIn>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1 text-sm font-semibold text-blue-600 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-400">
            Modern Booking Platform
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
            Build a professional booking experience for clinics, beauty
            salons, consultants, gyms and any service-based business with SR
            Booking Platform.
          </p>
        </FadeIn>

        <FadeIn delay={0.45}>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-transform duration-300 hover:scale-105"
            >
              Get Started
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-transform duration-300 hover:scale-105 hover:bg-accent hover:text-accent-foreground"
            >
              Live Demo
            </Link>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}