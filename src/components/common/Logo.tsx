import Link from "next/link";
import { siteConfig } from "@/constants/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
        SR
      </div>

      <div className="hidden sm:block">
        <p className="font-bold leading-none">
          {siteConfig.shortName}
        </p>

        <p className="text-xs text-muted-foreground">
          Booking Platform
        </p>
      </div>
    </Link>
  );
}