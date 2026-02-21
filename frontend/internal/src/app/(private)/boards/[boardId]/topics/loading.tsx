export default function TopicsLoading() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="h-8 w-40 rounded bg-gray-700" />
      <div className="h-6 w-24 rounded bg-gray-700" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-gray-800" />
        ))}
      </div>
    </div>
  );
}
