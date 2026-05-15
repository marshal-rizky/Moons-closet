export function PlaceholderImage({
  className = "",
  text = "",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-secondary/60 text-muted-foreground ${className}`}
    >
      {text && <span className="text-xs">{text}</span>}
    </div>
  );
}
