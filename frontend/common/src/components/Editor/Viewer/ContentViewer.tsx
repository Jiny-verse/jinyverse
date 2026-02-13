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
  }, [content, format]);

  return (
    <div
      className={`prose max-w-none [&_img]:w-full [&_img]:h-auto ${className}`}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
