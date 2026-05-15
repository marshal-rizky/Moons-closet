export function ProductCardSkeleton() {
  return (
    <div>
      <div className="aspect-[3/4] bg-secondary/30 animate-shimmer" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-secondary/30 animate-shimmer" />
        <div className="h-4 w-1/2 rounded bg-secondary/30 animate-shimmer" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
