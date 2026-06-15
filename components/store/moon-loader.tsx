// components/store/moon-loader.tsx
// Pure-CSS loader (no JS hooks). Reduced-motion handled by the CSS media query.
export function MoonLoader({ label = "Memuat" }: { label?: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center bg-cream">
      <div className="flex flex-col items-center gap-4">
        <span className="moon-loader-disc block h-10 w-10 rounded-full bg-[#b08d57]" />
        <span className="text-[9px] tracking-[0.3em] uppercase text-foreground/70">
          {label}
        </span>
      </div>
    </div>
  );
}
