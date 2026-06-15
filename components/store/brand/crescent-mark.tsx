// components/store/brand/crescent-mark.tsx
// Presentation-only. Uses currentColor so callers set gold/black/white via text color.
// Approximates public/brand/mark-gold.png; the real PNG remains the resting brand asset.

export function CrescentMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* outer crescent (opens to the right; interior is transparent) */}
      <path d="M70 8a46 46 0 1 0 0 84 36 36 0 1 1 0-84z" />
      {/* star ornament */}
      <circle cx="78" cy="20" r="3.4" />
    </svg>
  );
}
