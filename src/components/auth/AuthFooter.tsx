import Link from "next/link";

type AuthFooterProps = {
  text: string;
  linkText: string;
  href: string;
};

export function AuthFooter({
  text,
  linkText,
  href,
}: AuthFooterProps) {
  return (
    <p className="mt-8 text-center text-sm text-muted-foreground">
      {text}{" "}
      <Link
        href={href}
        className="font-semibold text-blue-600 hover:underline"
      >
        {linkText}
      </Link>
    </p>
  );
}