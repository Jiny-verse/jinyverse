import { HeroSection } from './HeroSection';
import { DescriptionImageSection } from './DescriptionImageSection';
import { BoardTopSection } from './BoardTopSection';
import { ImageLinkSection } from './ImageLinkSection';
import type { LandingSection } from 'common/schemas';

interface DynamicLandingRendererProps {
  sections: LandingSection[];
  apiBaseUrl: string;
}

export function DynamicLandingRenderer({ sections, apiBaseUrl }: DynamicLandingRendererProps) {
  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case 'hero':
            return <HeroSection key={section.id} section={section} apiBaseUrl={apiBaseUrl} />;
          case 'image':
          case 'image_link':
            return (
              <DescriptionImageSection
                key={section.id}
                section={section}
                apiBaseUrl={apiBaseUrl}
              />
            );
          case 'board_top':
            return (
              <BoardTopSection key={section.id} section={section} apiBaseUrl={apiBaseUrl} />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
