import Link from "next/link";

import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold">
              SR Booking
            </h3>

            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Modern online booking platform for salons, clinics,
              fitness studios and service businesses.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold">Product</h4>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#features">Features</Link>
              </li>

              <li>
                <Link href="#pricing">Pricing</Link>
              </li>

              <li>
                <Link href="#">Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold">Company</h4>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#">About</Link>
              </li>

              <li>
                <Link href="#">Contact</Link>
              </li>

              <li>
                <Link href="#">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold">Legal</h4>

            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="#">Privacy Policy</Link>
              </li>

              <li>
                <Link href="#">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SR Booking Platform.
          All rights reserved.
        </div>
      </Container>
    </footer>
  );
}