import Image from "next/image";

const SWATCHES = [
  "zara-swatch-1",
  "zara-swatch-2",
  "zara-swatch-3",
  "zara-swatch-4",
  "zara-swatch-5",
  "zara-swatch-6",
  "zara-swatch-7",
  "zara-swatch-8",
];

function swatchFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return SWATCHES[h % SWATCHES.length];
}

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  // Stack vertically like Zara — no thumbnails, scroll through all shots.
  const items: (string | number)[] =
    images.length > 0 ? images : Array.from({ length: 2 }, (_, i) => i);

  // The key changes when the selected color (image set) changes; React remounts
  // the stack so the CSS `gallery-fade` reveal replays — a fade-in on first load
  // and on each color switch. Pure CSS keeps images SSR-visible (no opacity:0 in
  // the HTML) and respects prefers-reduced-motion via the media query.
  const sig = images.length > 0 ? images.join("|") : `ph-${name}`;

  return (
    <div key={sig} className="gallery-fade flex flex-col gap-1">
      {items.map((src, i) => {
        if (typeof src === "string") {
          return (
            <div
              key={i}
              className="relative aspect-[3/4] w-full overflow-hidden bg-secondary"
            >
              <Image
                src={src}
                alt={`${name} ${i + 1}`}
                width={1200}
                height={1600}
                priority={i === 0}
                className="h-full w-full object-cover"
              />
            </div>
          );
        }
        const cls = swatchFor(`${name}-${i}`);
        return (
          <div
            key={i}
            className={`relative aspect-[3/4] w-full overflow-hidden ${cls} flex items-center justify-center`}
          >
            <span className="font-heading text-7xl tracking-[0.2em] uppercase opacity-20">
              {name.charAt(0)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
