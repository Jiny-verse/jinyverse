export default function MenuPageLoading() {
  return (
    <div className="flex flex-col animate-pulse">
      {/* Page title skeleton */}
      <div className="h-7 w-40 rounded bg-muted mb-6" />

      {/* Article rows skeleton */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="py-6 border-b border-border">
          {/* Title line */}
          <div className="h-5 w-3/4 rounded bg-muted" />
          {/* Excerpt lines */}
          <div className="mt-2 h-4 w-full rounded bg-muted/70" />
          <div className="mt-1 h-4 w-2/3 rounded bg-muted/70" />
          {/* Meta line */}
          <div className="mt-2 h-3 w-48 rounded bg-muted/50" />
        </div>
      ))}
    </div>
  );
}
