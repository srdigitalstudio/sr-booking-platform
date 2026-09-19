
import Link from "next/link";

import { Logo } from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import { navigation } from "@/constants/navigation";
import { Container } from "./Container";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

       <div className="flex items-center gap-2">
  <ThemeToggle />

  <Link href="/login">
    <Button>
      Sign In
    </Button>
  </Link>
</div>
      </Container>
    </header>
  );
}