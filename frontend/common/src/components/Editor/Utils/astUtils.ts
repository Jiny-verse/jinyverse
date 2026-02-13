import type { ASTNode, Mark, MarkType, CalloutType } from '../Types';

export function createDoc(content: ASTNode[] = []): ASTNode {
  return { type: 'doc', content };
}

export function createParagraph(content: ASTNode[] = []): ASTNode {
  return { type: 'paragraph', content };
}

export function createText(text: string, marks: Mark[] = []): ASTNode {
  const node: ASTNode = { type: 'text', text };
  if (marks.length > 0) node.marks = marks;
  return node;
}

export function createHeading(level: 1 | 2 | 3, content: ASTNode[]): ASTNode {
  return { type: 'heading', attrs: { level }, content };
}

export function createCodeBlock(content: ASTNode[]): ASTNode {
  return { type: 'code_block', content };
}

export function createList(ordered: boolean, content: ASTNode[]): ASTNode {
  return { type: 'list', attrs: { ordered: ordered ? 1 : 0 }, content };
}

export function createListItem(content: ASTNode[]): ASTNode {
  return { type: 'list_item', content };
}

export function createHorizontalRule(): ASTNode {
  return { type: 'horizontal_rule' };
}

export function createCallout(calloutType: CalloutType, content: ASTNode[]): ASTNode {
  return { type: 'callout', attrs: { calloutType }, content };
}

export function createEmbed(url: string): ASTNode {
  return { type: 'embed', attrs: { url } };
}

export function createTableCell(content: ASTNode[], isHeader = false, bgColor?: string, textColor?: string): ASTNode {
  const attrs: Record<string, string | number | null> = { isHeader: isHeader ? 1 : 0 };
  if (bgColor) attrs.bgColor = bgColor;
  if (textColor) attrs.textColor = textColor;
  return { type: 'table_cell', attrs, content };
}

export function createTableRow(cells: ASTNode[], isHeader = false): ASTNode {
  return { type: 'table_row', attrs: { isHeader: isHeader ? 1 : 0 }, content: cells };
}

export function createTable(rows: ASTNode[]): ASTNode {
  return { type: 'table', content: rows };
}

/** Converts a YouTube/Vimeo URL to an embed iframe URL. Returns null if not recognized. */
export function toEmbedUrl(url: string): string | null {
  // YouTube: https://www.youtube.com/watch?v=ID  or https://youtu.be/ID
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo: https://vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

// Default callout background color if none specified
const DEFAULT_CALLOUT_COLOR = '#e8f4fd';

// Walk AST depth-first
export function walkAST(node: ASTNode, visitor: (node: ASTNode) => void): void {
  visitor(node);
  if (node.content) {
    for (const child of node.content) {
      walkAST(child, visitor);
    }
  }
}

// Serialize AST to HTML
export function astToHtml(nodes: ASTNode[]): string {
  return nodes.map(nodeToHtml).join('');
}

function wrapWithMarks(html: string, marks: Mark[]): string {
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case 'bold': return `<strong>${acc}</strong>`;
      case 'italic': return `<em>${acc}</em>`;
      case 'underline': return `<u>${acc}</u>`;
      case 'strikethrough': return `<s>${acc}</s>`;
      case 'code': return `<code>${acc}</code>`;
      default: return acc;
    }
  }, html);
}

function nodeToHtml(node: ASTNode): string {
  switch (node.type) {
    case 'doc':
      return astToHtml(node.content ?? []);
    case 'paragraph': {
      const inner = astToHtml(node.content ?? []);
      return `<p>${inner || '<br>'}</p>`;
    }
    case 'heading': {
      const level = node.attrs?.level ?? 2;
      const inner = astToHtml(node.content ?? []);
      return `<h${level}>${inner}</h${level}>`;
    }
    case 'blockquote': {
      const inner = astToHtml(node.content ?? []);
      return `<blockquote>${inner}</blockquote>`;
    }
    case 'code_block': {
      const inner = astToHtml(node.content ?? []);
      return `<pre><code>${inner}</code></pre>`;
    }
    case 'list': {
      const tag = node.attrs?.ordered ? 'ol' : 'ul';
      const inner = astToHtml(node.content ?? []);
      return `<${tag}>${inner}</${tag}>`;
    }
    case 'list_item': {
      const inner = astToHtml(node.content ?? []);
      return `<li>${inner}</li>`;
    }
    case 'text': {
      const escaped = escapeHtml(node.text ?? '');
      return node.marks ? wrapWithMarks(escaped, node.marks) : escaped;
    }
    case 'hard_break':
      return '<br>';
    case 'horizontal_rule':
      return '<hr>';
    case 'table': {
      const rows = node.content ?? [];
      const headerRows = rows.filter((r) => r.attrs?.isHeader === 1);
      const bodyRows = rows.filter((r) => !r.attrs?.isHeader);
      let html = '<table class="editor-table">';
      if (headerRows.length > 0) html += `<thead>${astToHtml(headerRows)}</thead>`;
      if (bodyRows.length > 0) html += `<tbody>${astToHtml(bodyRows)}</tbody>`;
      html += '</table>';
      return html;
    }
    case 'table_row': {
      return `<tr>${astToHtml(node.content ?? [])}</tr>`;
    }
    case 'table_cell': {
      const tag = node.attrs?.isHeader ? 'th' : 'td';
      const styleParts = [
        node.attrs?.bgColor ? `background-color: ${node.attrs.bgColor}` : '',
        node.attrs?.textColor ? `color: ${node.attrs.textColor}` : '',
      ].filter(Boolean);
      const styleAttr = styleParts.length ? ` style="${styleParts.join('; ')}"` : '';
      const inner = astToHtml(node.content ?? []);
      return `<${tag}${styleAttr}>${inner || '<br>'}</${tag}>`;
    }
    case 'embed': {
      const rawUrl = String(node.attrs?.url ?? '');
      const embedUrl = toEmbedUrl(rawUrl);
      if (embedUrl) {
        return `<div class="embed-wrapper"><iframe src="${embedUrl}" frameborder="0" allowfullscreen sandbox="allow-scripts allow-same-origin allow-presentation"></iframe></div>`;
      }
      return `<div class="embed-wrapper embed-link"><a href="${rawUrl}" target="_blank" rel="noopener noreferrer">${rawUrl}</a></div>`;
    }
    case 'callout': {
      const color = String(node.attrs?.calloutType ?? DEFAULT_CALLOUT_COLOR);
      const inner = astToHtml(node.content ?? []);
      return `<div class="callout" style="background-color: ${color};"><div class="callout-body">${inner}</div></div>`;
    }
    case 'image': {
      const src = node.attrs?.src ?? '';
      const alt = node.attrs?.alt ?? '';
      return `<img src="${src}" alt="${alt}">`;
    }
    case 'link': {
      const raw = String(node.attrs?.href ?? '#');
      const href = raw !== '#' && !/^https?:\/\//i.test(raw) ? `https://${raw}` : raw;
      const inner = astToHtml(node.content ?? []);
      return `<a href="${href}">${inner}</a>`;
    }
    default:
      return '';
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Convert marks to string for markdown
export function marksToMarkdown(text: string, marks: Mark[]): string {
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case 'bold': return `**${acc}**`;
      case 'italic': return `*${acc}*`;
      case 'strikethrough': return `~~${acc}~~`;
      case 'code': return `\`${acc}\``;
      case 'underline': return acc; // Markdown doesn't have native underline
      default: return acc;
    }
  }, text);
}

export function getActiveMarks(marks: Mark[]): MarkType[] {
  return marks.map((m) => m.type);
}
