import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";

export default function RegisterPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Create Account"
        description="Start managing your bookings today."
        emoji="🚀"
      />

      <form className="space-y-5">
        <div>
          <Label htmlFor="name">
            Full Name
          </Label>

          <Input
            id="name"
            type="text"
            placeholder="John Doe"
          />
        </div>

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

        <div>
          <Label htmlFor="confirmPassword">
            Confirm Password
          </Label>

          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
          />
        </div>

        <Button
          className="w-full"
          size="lg"
        >
          Create Account
        </Button>
      </form>

      <AuthFooter
        text="Already have an account?"
        linkText="Login"
        href="/login"
      />
    </AuthCard>
  );
}