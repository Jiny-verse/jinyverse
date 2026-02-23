'use client';

export default function TopicCreateError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-4 py-12">
      <p className="text-red-400 text-sm">
        게시글 작성 폼을 불러오는 중 오류가 발생했습니다.
      </p>
      <p className="text-muted-foreground text-xs">{error.message}</p>
      <button
        onClick={reset}
        className="px-4 py-2 text-sm text-foreground bg-blue-600 rounded hover:bg-blue-700"
      >
        다시 시도
      </button>
    </div>
  );
}
