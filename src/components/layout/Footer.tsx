import Link from "next/link";

import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                SR
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  SR Booking
                </h3>

                <p className="text-sm text-muted-foreground">
                  Booking Platform
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Modern online booking platform for salons,
              clinics, fitness studios and service businesses.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold">
              Product
            </h4>

            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#features"
                  className="transition-colors hover:text-blue-600"
                >
                  Features
                </Link>
              </li>

              <li>
                <Link
                  href="#pricing"
                  className="transition-colors hover:text-blue-600"
                >
                  Pricing
                </Link>
              </li>

              <li>
                <Link
                  href="#faq"
                  className="transition-colors hover:text-blue-600"
                >
                  FAQ
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-blue-600"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold">
              Company
            </h4>

            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-blue-600"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-blue-600"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-blue-600"
                >
                  Blog
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-blue-600"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow */}
          <div>
            <h4 className="font-semibold">
              Follow Us
            </h4>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              Follow us on social media to get product updates,
              new features and company news.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="#"
                className="rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white"
              >
                GitHub
              </Link>

              <Link
                href="#"
                className="rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white"
              >
                LinkedIn
              </Link>

              <Link
                href="#"
                className="rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:border-blue-600 hover:bg-blue-600 hover:text-white"
              >
                Instagram
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t py-6 text-sm text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} SR Booking Platform.
            All rights reserved.
          </p>

          <p>
            Built with Next.js, Tailwind CSS & shadcn/ui
          </p>
        </div>
      </Container>
    </footer>
  );
}