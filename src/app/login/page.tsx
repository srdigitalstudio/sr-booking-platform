import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { AuthCard } from "@/components/auth/AuthCard";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthHeader
        title="Welcome Back"
        description="Sign in to your account"
        
      />

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
          <a
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <Button
          className="w-full"
          size="lg"
        >
          Login
        </Button>
      </form>

      <AuthFooter
        text="Don&apos;t have an account?"
        linkText="Sign Up"
        href="/register"
      />
    </AuthCard>
  );
}