import type { ASTNode, Mark, MarkType } from '../Types';

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
