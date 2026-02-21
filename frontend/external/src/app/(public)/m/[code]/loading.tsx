export default function MenuPageLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
