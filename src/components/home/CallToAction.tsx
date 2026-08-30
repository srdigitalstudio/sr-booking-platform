import Link from "next/link";

import { FadeIn } from "@/components/common/FadeIn";
import { Section } from "@/components/common/Section";

export function CallToAction() {
  return (
    <Section>
      <FadeIn>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-16 text-center text-white shadow-2xl md:px-16">
          <h2 className="text-4xl font-bold md:text-5xl">
            Ready to Grow Your Business?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-blue-100">
            Join thousands of businesses using SR Booking Platform to manage
            appointments, increase revenue, and deliver a better customer
            experience.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex h-11 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-blue-600 shadow transition-transform duration-300 hover:scale-105"
            >
              Get Started Free
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-md border border-white bg-transparent px-8 text-sm font-medium text-white transition-transform duration-300 hover:scale-105 hover:bg-white hover:text-blue-600"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </FadeIn>
    </Section>
  );
}