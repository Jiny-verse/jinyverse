'use client';

import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import { markdownToAST } from '../Utils/markdownConverter';
import { astToHtml } from '../Utils/astUtils';
import type { ApiOptions } from '../../../types/api';
import { getPublicImageUrl } from '../../../utils/file';

interface ContentViewerProps {
  content: string;
  format?: 'html' | 'markdown';
  className?: string;
  apiOptions?: ApiOptions;
}

const FILE_ID_PATTERN = /\/api\/files\/([0-9a-f-]{36})\/download/i;

export function ContentViewer({ content, format = 'html', className = '', apiOptions }: ContentViewerProps) {
  const safeHtml = useMemo(() => {
    if (!content) return '';
    const raw = format === 'markdown' ? astToHtml(markdownToAST(content)) : content;
    DOMPurify.addHook('afterSanitizeAttributes', (node) => {
      if (node.tagName === 'A') {
        const href = node.getAttribute('href');
        if (href && href !== '#' && !/^https?:\/\//i.test(href)) {
          node.setAttribute('href', `https://${href}`);
        }
      }
      if (node.tagName === 'IMG' && apiOptions) {
        const src = node.getAttribute('src') ?? '';
        const match = FILE_ID_PATTERN.exec(src);
        if (match) {
          const fileId = match[1];
          node.setAttribute('src', getPublicImageUrl(fileId, apiOptions));
        }
      }
      const style = node.getAttribute('style');
      if (style) {
        const allowed = style
          .split(';')
          .map((s) => s.trim())
          .filter((s) => /^(color|background-color|text-align|line-height|font-family|font-size)\s*:/i.test(s))
          .join('; ');
        if (allowed) {
          node.setAttribute('style', allowed);
        } else {
          node.removeAttribute('style');
        }
      }
    });
    const result = DOMPurify.sanitize(raw, {
      ADD_ATTR: ['style', 'frameborder', 'allowfullscreen', 'sandbox'],
      ADD_TAGS: ['iframe'],
    });
    DOMPurify.removeHooks('afterSanitizeAttributes');
    return result;
  }, [content, format, apiOptions]);

  return (
    <div
      className={`prose max-w-none [&_img]:w-full [&_img]:h-auto [&_img]:rounded-none [&_.editor-image-layout]:grid [&_.editor-image-layout]:gap-2 [&_.editor-image-layout[data-columns='1']]:grid-cols-1 [&_.editor-image-layout[data-columns='2']]:grid-cols-2 [&_.editor-image-layout[data-columns='3']]:grid-cols-3 [&_.editor-image-layout_img]:object-cover ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
