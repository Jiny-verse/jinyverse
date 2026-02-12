import type { IEditorMode, IEditorCore, ICommand, ToolbarItem } from '../Types';
import { htmlToMarkdown } from '../Utils/markdownConverter';

class TextInsertCommand implements ICommand {
  readonly description: string;
  private textarea: HTMLTextAreaElement;
  private previousValue: string;
  private insertText: string;
  private selStart: number;
  private selEnd: number;

  constructor(textarea: HTMLTextAreaElement, insertText: string, description: string) {
    this.textarea = textarea;
    this.insertText = insertText;
    this.description = description;
    this.previousValue = textarea.value;
    this.selStart = textarea.selectionStart;
    this.selEnd = textarea.selectionEnd;
  }

  execute(): void {
    const { textarea, insertText, selStart, selEnd } = this;
    const before = textarea.value.slice(0, selStart);
    const selected = textarea.value.slice(selStart, selEnd);
    const after = textarea.value.slice(selEnd);

    if (selStart !== selEnd) {
      textarea.value = before + insertText + selected + insertText + after;
      textarea.selectionStart = selStart + insertText.length;
      textarea.selectionEnd = selEnd + insertText.length;
    } else {
      textarea.value = before + insertText + insertText + after;
      textarea.selectionStart = selStart + insertText.length;
      textarea.selectionEnd = selStart + insertText.length;
    }
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  undo(): void {
    this.textarea.value = this.previousValue;
    this.textarea.selectionStart = this.selStart;
    this.textarea.selectionEnd = this.selEnd;
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

class LineInsertCommand implements ICommand {
  readonly description: string;
  private textarea: HTMLTextAreaElement;
  private previousValue: string;
  private prefix: string;

  constructor(textarea: HTMLTextAreaElement, prefix: string, description: string) {
    this.textarea = textarea;
    this.prefix = prefix;
    this.description = description;
    this.previousValue = textarea.value;
  }

  execute(): void {
    const { textarea, prefix } = this;
    const pos = textarea.selectionStart;
    const value = textarea.value;
    const lineStart = value.lastIndexOf('\n', pos - 1) + 1;
    const before = value.slice(0, lineStart);
    const rest = value.slice(lineStart);
    textarea.value = before + prefix + rest;
    textarea.selectionStart = pos + prefix.length;
    textarea.selectionEnd = pos + prefix.length;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  undo(): void {
    this.textarea.value = this.previousValue;
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

export class MarkdownMode implements IEditorMode {
  readonly name = 'markdown' as const;
  private container: HTMLElement | null = null;
  private textarea: HTMLTextAreaElement | null = null;
  private core: IEditorCore | null = null;
  private isComposing = false;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private inputHandler: (() => void) | null = null;
  private compositionStartHandler: (() => void) | null = null;
  private compositionEndHandler: (() => void) | null = null;

  render(container: HTMLElement, core: IEditorCore): void {
    this.container = container;
    this.core = core;

    const ta = document.createElement('textarea');
    ta.className =
      'editor-markdown-mode w-full h-full min-h-[inherit] outline-none p-4 resize-none bg-transparent text-gray-900';
    ta.style.fontFamily = "'Fira Code', 'Cascadia Code', 'Consolas', monospace";
    ta.style.fontSize = '14px';
    ta.style.lineHeight = '1.75';
    ta.spellcheck = false;

    this.textarea = ta;

    // IME composition guards
    this.compositionStartHandler = () => { this.isComposing = true; };
    this.compositionEndHandler = () => { this.isComposing = false; };
    ta.addEventListener('compositionstart', this.compositionStartHandler);
    ta.addEventListener('compositionend', this.compositionEndHandler);

    this.keydownHandler = this.handleKeydown.bind(this);
    ta.addEventListener('keydown', this.keydownHandler);

    this.inputHandler = () => {
      const content = this.getContent();
      core.emit('content:change', { content });
      const lines = ta.value.split('\n');
      const pos = ta.selectionStart;
      let charCount = 0;
      let lineNum = 1;
      for (const line of lines) {
        if (charCount + line.length + 1 > pos) break;
        charCount += line.length + 1;
        lineNum++;
      }
      const col = pos - charCount + 1;
      core.emit('cursor:change', { line: lineNum, column: col, charCount: ta.value.length });
    };
    ta.addEventListener('input', this.inputHandler);

    container.appendChild(ta);
  }

  private handleKeydown(e: KeyboardEvent): void {
    // Block shortcuts during IME composition (Korean, Chinese, Japanese input)
    if (this.isComposing) return;
    if (!this.core || !this.textarea) return;
    const isMac = navigator.platform.includes('Mac');
    const ctrl = isMac ? e.metaKey : e.ctrlKey;

    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = this.textarea;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value = ta.value.slice(0, start) + '  ' + ta.value.slice(end);
      ta.selectionStart = start + 2;
      ta.selectionEnd = start + 2;
      ta.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }

    if (ctrl) {
      switch (e.key.toLowerCase()) {
        case 'b': {
          e.preventDefault();
          this.core.executeCommand(new TextInsertCommand(this.textarea, '**', 'Bold'));
          break;
        }
        case 'i': {
          e.preventDefault();
          this.core.executeCommand(new TextInsertCommand(this.textarea, '*', 'Italic'));
          break;
        }
        case 'z': {
          e.preventDefault();
          if (e.shiftKey) {
            this.core.redo();
          } else {
            this.core.undo();
          }
          break;
        }
        case 'y': {
          e.preventDefault();
          this.core.redo();
          break;
        }
      }
    }
  }

  destroy(): void {
    if (this.textarea) {
      if (this.keydownHandler) this.textarea.removeEventListener('keydown', this.keydownHandler);
      if (this.inputHandler) this.textarea.removeEventListener('input', this.inputHandler);
      if (this.compositionStartHandler) this.textarea.removeEventListener('compositionstart', this.compositionStartHandler);
      if (this.compositionEndHandler) this.textarea.removeEventListener('compositionend', this.compositionEndHandler);
    }
    if (this.container && this.textarea) {
      this.container.removeChild(this.textarea);
    }
    this.textarea = null;
    this.container = null;
    this.core = null;
    this.keydownHandler = null;
    this.inputHandler = null;
    this.compositionStartHandler = null;
    this.compositionEndHandler = null;
  }

  getContent(): string {
    return this.textarea?.value ?? '';
  }

  setContent(content: string): void {
    if (this.textarea) {
      this.textarea.value = content;
    }
  }

  getToolbarItems(): ToolbarItem[] {
    const insert = (text: string, desc: string) => (core: IEditorCore) => {
      if (this.textarea) core.executeCommand(new TextInsertCommand(this.textarea, text, desc));
    };
    const insertLine = (prefix: string, desc: string) => (core: IEditorCore) => {
      if (this.textarea) core.executeCommand(new LineInsertCommand(this.textarea, prefix, desc));
    };

    return [
      { id: 'bold', type: 'button', icon: 'Bold', labelKey: 'editor.toolbar.bold', action: insert('**', 'Bold') },
      { id: 'italic', type: 'button', icon: 'Italic', labelKey: 'editor.toolbar.italic', action: insert('*', 'Italic') },
      { id: 'strike', type: 'button', icon: 'Strikethrough', labelKey: 'editor.toolbar.strike', action: insert('~~', 'Strikethrough') },
      { id: 'code', type: 'button', icon: 'Code', labelKey: 'editor.toolbar.code', action: insert('`', 'Code') },
      { id: 'sep1', type: 'separator', labelKey: '' },
      { id: 'h1', type: 'button', icon: 'Heading1', labelKey: 'editor.toolbar.h1', action: insertLine('# ', 'Heading 1') },
      { id: 'h2', type: 'button', icon: 'Heading2', labelKey: 'editor.toolbar.h2', action: insertLine('## ', 'Heading 2') },
      { id: 'h3', type: 'button', icon: 'Heading3', labelKey: 'editor.toolbar.h3', action: insertLine('### ', 'Heading 3') },
      { id: 'sep2', type: 'separator', labelKey: '' },
      { id: 'ul', type: 'button', icon: 'List', labelKey: 'editor.toolbar.ul', action: insertLine('- ', 'Bullet List') },
      { id: 'ol', type: 'button', icon: 'ListOrdered', labelKey: 'editor.toolbar.ol', action: insertLine('1. ', 'Ordered List') },
      { id: 'sep3', type: 'separator', labelKey: '' },
      { id: 'codeblock', type: 'button', icon: 'Code2', labelKey: 'editor.toolbar.codeBlock', action: insert('```\n', 'Code Block') },
      { id: 'sep4', type: 'separator', labelKey: '' },
      { id: 'link', type: 'button', icon: 'Link', labelKey: 'editor.toolbar.link', action: (core) => { core.emit('dialog:link', { mode: 'markdown' }); } },
      { id: 'image', type: 'button', icon: 'Image', labelKey: 'editor.toolbar.image', action: (core) => { core.emit('dialog:image', { mode: 'markdown' }); } },
    ];
  }

  insertLink(url: string, text = ''): void {
    if (!this.textarea || !this.core) return;
    const ta = this.textarea;
    const selStart = ta.selectionStart;
    const selEnd = ta.selectionEnd;
    const selected = ta.value.slice(selStart, selEnd) || text;
    const snippet = `[${selected}](${url})`;
    const prev = ta.value;
    this.core.executeCommand({
      description: 'Insert Link',
      execute: () => {
        ta.value = ta.value.slice(0, selStart) + snippet + ta.value.slice(selEnd);
        ta.selectionStart = selStart + snippet.length;
        ta.selectionEnd = selStart + snippet.length;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      },
      undo: () => {
        ta.value = prev;
        ta.selectionStart = selStart;
        ta.selectionEnd = selEnd;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      },
    });
  }

  insertImage(url: string, alt = ''): void {
    if (!this.textarea || !this.core) return;
    const ta = this.textarea;
    const pos = ta.selectionStart;
    const snippet = `![${alt}](${url})`;
    const prev = ta.value;
    this.core.executeCommand({
      description: 'Insert Image',
      execute: () => {
        ta.value = ta.value.slice(0, pos) + snippet + ta.value.slice(pos);
        ta.selectionStart = pos + snippet.length;
        ta.selectionEnd = pos + snippet.length;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      },
      undo: () => {
        ta.value = prev;
        ta.selectionStart = pos;
        ta.selectionEnd = pos;
        ta.dispatchEvent(new Event('input', { bubbles: true }));
      },
    });
  }

  transformData(input: string): string {
    if (!input.trim()) return '';
    if (!input.trimStart().startsWith('<')) return input;
    return htmlToMarkdown(input);
  }
}
