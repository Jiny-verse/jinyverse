'use client';

import DOMPurify from 'dompurify';
import { useMemo } from 'react';
import { markdownToAST } from '../Utils/markdownConverter';
import { astToHtml } from '../Utils/astUtils';

interface ContentViewerProps {
  content: string;
  format?: 'html' | 'markdown';
  className?: string;
}

export function ContentViewer({ content, format = 'html', className = '' }: ContentViewerProps) {
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
    });
    const result = DOMPurify.sanitize(raw);
    DOMPurify.removeHooks('afterSanitizeAttributes');
    return result;
  }, [content, format]);

  return (
    <div
      className={`prose max-w-none [&_img]:w-full [&_img]:h-auto ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
