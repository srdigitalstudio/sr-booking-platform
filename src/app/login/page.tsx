import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/common/FadeIn";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 px-6">
      <FadeIn>
        <Card className="w-full max-w-md rounded-3xl border-0 shadow-2xl">
          <CardContent className="p-10">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-blue-600">
                SR Booking
              </h1>

              <h2 className="mt-6 text-2xl font-bold">
                Welcome Back 👋
              </h2>

              <p className="mt-2 text-muted-foreground">
                Sign in to your account
              </p>
            </div>

            <form className="space-y-6">
              <div>
                <Label htmlFor="email">
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <Label htmlFor="password">
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                className="w-full"
                size="lg"
              >
                Login
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
             Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </CardContent>
        </Card>
      </FadeIn>
    </main>
  );
}