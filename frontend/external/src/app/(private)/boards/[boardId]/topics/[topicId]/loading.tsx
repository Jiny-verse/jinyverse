export default function TopicDetailLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="h-8 w-2/3 rounded bg-gray-200" />
      <div className="flex gap-3">
        <div className="h-4 w-20 rounded bg-gray-200" />
        <div className="h-4 w-24 rounded bg-gray-200" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}
