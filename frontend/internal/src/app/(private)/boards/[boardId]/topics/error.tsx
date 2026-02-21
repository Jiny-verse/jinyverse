'use client';

export default function TopicsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <p className="text-red-400 text-sm">
        게시글 목록을 불러오는 중 오류가 발생했습니다.
      </p>
      <p className="text-gray-500 text-xs">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
      >
        다시 시도
      </button>
    </div>
  );
}
