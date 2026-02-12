import type { ASTNode, Mark } from '../Types';
import {
  createDoc,
  createParagraph,
  createText,
  createHeading,
  createCodeBlock,
  createList,
  createListItem,
  marksToMarkdown,
} from './astUtils';

// ── AST → Markdown ──────────────────────────────────────────────

export function astToMarkdown(nodes: ASTNode[]): string {
  return nodes.map(nodeToMarkdown).join('\n');
}

function nodeToMarkdown(node: ASTNode): string {
  switch (node.type) {
    case 'doc':
      return astToMarkdown(node.content ?? []);
    case 'paragraph': {
      const inner = inlineToMarkdown(node.content ?? []);
      return inner;
    }
    case 'heading': {
      const level = (node.attrs?.level as number) ?? 2;
      const prefix = '#'.repeat(level);
      const inner = inlineToMarkdown(node.content ?? []);
      return `${prefix} ${inner}`;
    }
    case 'blockquote': {
      const inner = astToMarkdown(node.content ?? []);
      return inner.split('\n').map((line) => `> ${line}`).join('\n');
    }
    case 'code_block': {
      const inner = inlineToMarkdown(node.content ?? []);
      return `\`\`\`\n${inner}\n\`\`\``;
    }
    case 'list': {
      const ordered = Boolean(node.attrs?.ordered);
      return (node.content ?? [])
        .map((item, i) => {
          const inner = astToMarkdown(item.content ?? []);
          return ordered ? `${i + 1}. ${inner}` : `- ${inner}`;
        })
        .join('\n');
    }
    case 'list_item':
      return inlineToMarkdown(node.content ?? []);
    case 'text': {
      const text = node.text ?? '';
      return node.marks ? marksToMarkdown(text, node.marks) : text;
    }
    case 'hard_break':
      return '  \n';
    case 'image': {
      const src = node.attrs?.src ?? '';
      const alt = node.attrs?.alt ?? '';
      return `![${alt}](${src})`;
    }
    case 'link': {
      const href = node.attrs?.href ?? '#';
      const inner = inlineToMarkdown(node.content ?? []);
      return `[${inner}](${href})`;
    }
    default:
      return '';
  }
}

function inlineToMarkdown(nodes: ASTNode[]): string {
  return nodes.map(nodeToMarkdown).join('');
}

// ── Markdown → AST ──────────────────────────────────────────────

export function markdownToAST(md: string): ASTNode[] {
  const lines = md.split('\n');
  const blocks: ASTNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(createCodeBlock([createText(codeLines.join('\n'))]));
      continue;
    }

    // Heading
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      const content = parseInline(headingMatch[2]);
      blocks.push(createHeading(level, content));
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      const innerAST = markdownToAST(quoteLines.join('\n'));
      blocks.push({ type: 'blockquote', content: innerAST });
      continue;
    }

    // Unordered list
    if (/^[-*+]\s/.test(line)) {
      const items: ASTNode[] = [];
      while (i < lines.length && /^[-*+]\s/.test(lines[i])) {
        const text = lines[i].replace(/^[-*+]\s+/, '');
        items.push(createListItem([createParagraph(parseInline(text))]));
        i++;
      }
      blocks.push(createList(false, items));
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const items: ASTNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        const text = lines[i].replace(/^\d+\.\s+/, '');
        items.push(createListItem([createParagraph(parseInline(text))]));
        i++;
      }
      blocks.push(createList(true, items));
      continue;
    }

    // Empty line — skip
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph
    const paraLines: string[] = [];
    while (i < lines.length && lines[i].trim() !== '' && !lines[i].match(/^[#>\-*+`\d]/)) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length === 0) {
      // Single line that matched an excluded pattern but wasn't caught above
      paraLines.push(line);
      i++;
    }
    const content = parseInline(paraLines.join(' '));
    blocks.push(createParagraph(content));
  }

  return blocks;
}

// Parse inline markdown (bold, italic, code, strikethrough)
function parseInline(text: string): ASTNode[] {
  const nodes: ASTNode[] = [];
  // Regex patterns ordered by precedence
  const pattern = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|__(.+?)__|_(.+?)_|~~(.+?)~~|`(.+?)`|\[(.+?)\]\((.+?)\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Text before match
    if (match.index > lastIndex) {
      nodes.push(createText(text.slice(lastIndex, match.index)));
    }

    const full = match[0];
    if (full.startsWith('***')) {
      // Bold + Italic
      nodes.push(createText(match[2], [{ type: 'bold' }, { type: 'italic' }]));
    } else if (full.startsWith('**') || full.startsWith('__')) {
      // Bold
      const inner = match[3] || match[5];
      nodes.push(createText(inner, [{ type: 'bold' }]));
    } else if (full.startsWith('*') || full.startsWith('_')) {
      // Italic
      const inner = match[4] || match[6];
      nodes.push(createText(inner, [{ type: 'italic' }]));
    } else if (full.startsWith('~~')) {
      // Strikethrough
      nodes.push(createText(match[7], [{ type: 'strikethrough' }]));
    } else if (full.startsWith('`')) {
      // Code
      nodes.push(createText(match[8], [{ type: 'code' }]));
    } else if (full.startsWith('[')) {
      // Link
      const linkText = match[9];
      const href = match[10];
      nodes.push({
        type: 'link',
        attrs: { href },
        content: [createText(linkText)],
      });
    }

    lastIndex = match.index + full.length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    nodes.push(createText(text.slice(lastIndex)));
  }

  if (nodes.length === 0) {
    nodes.push(createText(text));
  }

  return nodes;
}

// ── HTML → Markdown (simple regex conversion) ──────────────────

export function htmlToMarkdown(html: string): string {
  return html
    // Headings
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n')
    // Bold
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    // Italic
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Underline (no markdown equivalent, keep text)
    .replace(/<u[^>]*>(.*?)<\/u>/gi, '$1')
    // Strikethrough
    .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
    .replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
    // Inline code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    // Code blocks
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n')
    // Images
    .replace(/<img[^>]*>/gi, (match) => {
      const src = match.match(/src="([^"]*)"/i)?.[1] ?? '';
      const alt = match.match(/alt="([^"]*)"/i)?.[1] ?? '';
      return src ? `![${alt}](${src})` : '';
    })
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Ordered lists
    .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
      let idx = 1;
      return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, item: string) => `${idx++}. ${item.trim()}\n`);
    })
    // Unordered lists
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) =>
      content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_: string, item: string) => `- ${item.trim()}\n`),
    )
    // Blockquotes
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) =>
      content.trim().split('\n').map((line: string) => `> ${line}`).join('\n') + '\n',
    )
    // Divs (contentEditable line breaks in Chrome)
    .replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n\n')
    // Paragraphs
    .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up excessive newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
