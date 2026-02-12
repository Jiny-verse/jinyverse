import DOMPurify from 'dompurify';
import type { IEditorMode, IEditorCore, ICommand, ToolbarItem } from '../Types';
import { markdownToAST } from '../Utils/markdownConverter';
import { astToHtml } from '../Utils/astUtils';

class FormatCommand implements ICommand {
  readonly description: string;
  private container: HTMLElement;
  private commandName: string;
  private value: string | undefined;
  private previousHTML: string;

  constructor(container: HTMLElement, commandName: string, description: string, value?: string) {
    this.container = container;
    this.commandName = commandName;
    this.description = description;
    this.value = value;
    this.previousHTML = container.innerHTML;
  }

  execute(): void {
    document.execCommand(this.commandName, false, this.value);
  }

  undo(): void {
    this.container.innerHTML = DOMPurify.sanitize(this.previousHTML);
  }
}

export class TextMode implements IEditorMode {
  readonly name = 'text' as const;
  private container: HTMLElement | null = null;
  private editorDiv: HTMLDivElement | null = null;
  private core: IEditorCore | null = null;
  private isComposing = false;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private inputHandler: (() => void) | null = null;
  private selectionHandler: (() => void) | null = null;
  private compositionStartHandler: (() => void) | null = null;
  private compositionEndHandler: (() => void) | null = null;
  private savedLinkRange: Range | null = null;

  render(container: HTMLElement, core: IEditorCore): void {
    this.container = container;
    this.core = core;

    const div = document.createElement('div');
    div.contentEditable = 'true';
    div.className =
      'editor-text-mode prose max-w-none w-full h-full min-h-[inherit] outline-none p-4 overflow-auto';
    div.style.fontFamily = 'inherit';
    div.style.fontSize = 'inherit';
    div.style.lineHeight = '1.75';

    this.editorDiv = div;

    if (div.innerHTML) {
      div.innerHTML = DOMPurify.sanitize(div.innerHTML);
    }

    // IME composition guards
    this.compositionStartHandler = () => { this.isComposing = true; };
    this.compositionEndHandler = () => { this.isComposing = false; };
    div.addEventListener('compositionstart', this.compositionStartHandler);
    div.addEventListener('compositionend', this.compositionEndHandler);

    this.keydownHandler = this.handleKeydown.bind(this);
    div.addEventListener('keydown', this.keydownHandler);

    this.inputHandler = () => {
      const content = this.getContent();
      core.emit('content:change', { content });
      const text = div.innerText ?? '';
      core.emit('cursor:change', { line: 1, column: 1, charCount: text.length });
    };
    div.addEventListener('input', this.inputHandler);

    // Selection change — emit format:active state
    this.selectionHandler = () => {
      core.emit('selection:change', { selection: { anchor: 0, head: 0 } });
      core.emit('format:active', {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
      });
    };
    document.addEventListener('selectionchange', this.selectionHandler);

    container.appendChild(div);
  }

  private handleKeydown(e: KeyboardEvent): void {
    // Block shortcuts during IME composition (Korean, Chinese, Japanese input)
    if (this.isComposing) return;
    if (!this.core || !this.editorDiv) return;
    const isMac = navigator.platform.includes('Mac');
    const ctrl = isMac ? e.metaKey : e.ctrlKey;

    if (ctrl) {
      switch (e.key.toLowerCase()) {
        case 'b': {
          e.preventDefault();
          this.core.executeCommand(new FormatCommand(this.editorDiv, 'bold', 'Bold'));
          break;
        }
        case 'i': {
          e.preventDefault();
          this.core.executeCommand(new FormatCommand(this.editorDiv, 'italic', 'Italic'));
          break;
        }
        case 'u': {
          e.preventDefault();
          this.core.executeCommand(new FormatCommand(this.editorDiv, 'underline', 'Underline'));
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
    if (this.editorDiv) {
      if (this.keydownHandler) this.editorDiv.removeEventListener('keydown', this.keydownHandler);
      if (this.inputHandler) this.editorDiv.removeEventListener('input', this.inputHandler);
      if (this.compositionStartHandler) this.editorDiv.removeEventListener('compositionstart', this.compositionStartHandler);
      if (this.compositionEndHandler) this.editorDiv.removeEventListener('compositionend', this.compositionEndHandler);
    }
    if (this.selectionHandler) {
      document.removeEventListener('selectionchange', this.selectionHandler);
    }
    if (this.container && this.editorDiv) {
      this.container.removeChild(this.editorDiv);
    }
    this.editorDiv = null;
    this.container = null;
    this.core = null;
    this.keydownHandler = null;
    this.inputHandler = null;
    this.selectionHandler = null;
    this.compositionStartHandler = null;
    this.compositionEndHandler = null;
  }

  getContent(): string {
    return this.editorDiv?.innerHTML ?? '';
  }

  setContent(content: string): void {
    if (this.editorDiv) {
      this.editorDiv.innerHTML = DOMPurify.sanitize(content);
    }
  }

  getToolbarItems(): ToolbarItem[] {
    const execCommand = (cmd: string, desc: string, value?: string) => (core: IEditorCore) => {
      if (this.editorDiv) {
        core.executeCommand(new FormatCommand(this.editorDiv, cmd, desc, value));
      }
    };

    return [
      { id: 'bold', type: 'button', icon: 'Bold', labelKey: 'editor.toolbar.bold', action: execCommand('bold', 'Bold') },
      { id: 'italic', type: 'button', icon: 'Italic', labelKey: 'editor.toolbar.italic', action: execCommand('italic', 'Italic') },
      { id: 'underline', type: 'button', icon: 'Underline', labelKey: 'editor.toolbar.underline', action: execCommand('underline', 'Underline') },
      { id: 'strike', type: 'button', icon: 'Strikethrough', labelKey: 'editor.toolbar.strike', action: execCommand('strikeThrough', 'Strikethrough') },
      { id: 'sep1', type: 'separator', labelKey: '' },
      { id: 'h1', type: 'button', icon: 'Heading1', labelKey: 'editor.toolbar.h1', action: execCommand('formatBlock', 'Heading 1', '<h1>') },
      { id: 'h2', type: 'button', icon: 'Heading2', labelKey: 'editor.toolbar.h2', action: execCommand('formatBlock', 'Heading 2', '<h2>') },
      { id: 'h3', type: 'button', icon: 'Heading3', labelKey: 'editor.toolbar.h3', action: execCommand('formatBlock', 'Heading 3', '<h3>') },
      { id: 'sep2', type: 'separator', labelKey: '' },
      { id: 'ul', type: 'button', icon: 'List', labelKey: 'editor.toolbar.ul', action: execCommand('insertUnorderedList', 'Bullet List') },
      { id: 'ol', type: 'button', icon: 'ListOrdered', labelKey: 'editor.toolbar.ol', action: execCommand('insertOrderedList', 'Ordered List') },
      { id: 'sep3', type: 'separator', labelKey: '' },
      { id: 'code', type: 'button', icon: 'Code', labelKey: 'editor.toolbar.code', action: execCommand('formatBlock', 'Code Block', '<pre>') },
      { id: 'sep4', type: 'separator', labelKey: '' },
      { id: 'link', type: 'button', icon: 'Link', labelKey: 'editor.toolbar.link', action: (_core) => { this.openLinkDialog(_core); } },
      { id: 'image', type: 'button', icon: 'Image', labelKey: 'editor.toolbar.image', action: () => { this.openImagePicker(); } },
    ];
  }

  private openLinkDialog(core: IEditorCore): void {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      this.savedLinkRange = sel.getRangeAt(0).cloneRange();
    } else {
      this.savedLinkRange = null;
    }
    const selectedText = sel?.toString() ?? '';
    core.emit('dialog:link', { mode: 'text', selectedText });
  }

  private openImagePicker(): void {
    if (!this.core) return;
    this.core.emit('dialog:image', { mode: 'text' });
  }

  insertLink(url: string, text?: string): void {
    if (!this.editorDiv || !this.core) return;
    const previousHTML = this.editorDiv.innerHTML;
    // Restore selection lost when dialog opened
    if (this.savedLinkRange) {
      this.editorDiv.focus();
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(this.savedLinkRange);
      this.savedLinkRange = null;
    }
    const sel = window.getSelection();
    const hasSelection = sel && sel.toString().length > 0;
    if (!hasSelection && text) {
      document.execCommand('insertText', false, text);
      // Re-select inserted text
      const newSel = window.getSelection();
      if (newSel && newSel.rangeCount > 0) {
        const range = newSel.getRangeAt(0);
        range.setStart(range.endContainer, range.endOffset - text.length);
        newSel.removeAllRanges();
        newSel.addRange(range);
      }
    }
    this.core?.executeCommand({
      description: 'Insert Link',
      execute: () => { document.execCommand('createLink', false, url); },
      undo: () => {
        if (this.editorDiv) this.editorDiv.innerHTML = DOMPurify.sanitize(previousHTML);
      },
    });
  }

  insertImage(url: string, alt = ''): void {
    if (!this.editorDiv || !this.core) return;
    const previousHTML = this.editorDiv.innerHTML;
    this.core.executeCommand({
      description: 'Insert Image',
      execute: () => {
        document.execCommand(
          'insertHTML', false,
          `<img src="${DOMPurify.sanitize(url)}" alt="${DOMPurify.sanitize(alt)}">`,
        );
      },
      undo: () => {
        if (this.editorDiv) this.editorDiv.innerHTML = DOMPurify.sanitize(previousHTML);
      },
    });
  }

  transformData(input: string): string {
    if (!input.trim()) return '';
    if (input.trimStart().startsWith('<')) {
      return DOMPurify.sanitize(input);
    }
    const ast = markdownToAST(input);
    return DOMPurify.sanitize(astToHtml(ast));
  }
}
