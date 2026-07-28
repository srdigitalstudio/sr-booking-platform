type AuthHeaderProps = {
  title: string;
  description: string;
  emoji?: string;
};

export function AuthHeader({
  title,
  description,
  emoji,
}: AuthHeaderProps) {
  return (
    <div className="mb-8 text-center">
      <h1 className="text-3xl font-bold text-blue-600">
        SR Booking
      </h1>

      <h2 className="mt-6 text-2xl font-bold">
        {title} {emoji}
      </h2>

      <p className="mt-2 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}