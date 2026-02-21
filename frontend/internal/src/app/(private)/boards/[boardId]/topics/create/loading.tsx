export default function TopicCreateLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse max-w-2xl">
      <div className="h-8 w-40 rounded bg-gray-700" />
      <div className="flex flex-col gap-3">
        <div className="h-10 rounded bg-gray-800" />
        <div className="h-10 rounded bg-gray-800" />
        <div className="h-40 rounded bg-gray-800" />
        <div className="h-10 rounded bg-gray-800" />
      </div>
      <div className="h-10 w-32 rounded bg-gray-700" />
    </div>
  );
}
