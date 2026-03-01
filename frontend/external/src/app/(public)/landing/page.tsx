import { DynamicLandingRenderer } from '@/components/landing/DynamicLandingRenderer';
import type { LandingSection } from 'common/schemas';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function fetchSections(): Promise<LandingSection[]> {
  try {
    const res = await fetch(`${apiBaseUrl}/api/landing/sections`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function LandingPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="text-4xl font-bold text-foreground">준비 중입니다</h1>
      <p className="mt-3 text-lg text-muted-foreground">곧 멋진 콘텐츠가 공개됩니다.</p>
    </div>
  );
}

export default async function LandingPage() {
  const sections = await fetchSections();

  if (sections.length === 0) {
    return <LandingPlaceholder />;
  }

  return (
    <div className="flex flex-col w-full">
      <DynamicLandingRenderer sections={sections} apiBaseUrl={apiBaseUrl} />
    </div>
  );
}
