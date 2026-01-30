export default function Page() {
  return (
    <div className="min-h-screen pt-[70px]">
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-6xl font-bold">Jinyverse</h1>
        <p className="mt-3 text-2xl">Connected to Spring Boot Backend</p>
      </div>
      
      {/* 스크롤 테스트용 더미 콘텐츠 */}
      <div className="h-[200vh] px-12">
        <p className="h-[5000px] text-gray-400">Scroll down to see the navigation background change...</p>
      </div>
    </div>
  );
}
