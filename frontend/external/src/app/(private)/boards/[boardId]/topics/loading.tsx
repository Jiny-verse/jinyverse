export default function TopicsLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-40 rounded bg-gray-200" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
