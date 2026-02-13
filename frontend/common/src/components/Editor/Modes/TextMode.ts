import DOMPurify from 'dompurify';
import type { IEditorMode, IEditorCore, ICommand, ToolbarItem } from '../Types';
import { markdownToAST } from '../Utils/markdownConverter';
import { astToHtml, toEmbedUrl } from '../Utils/astUtils';

class SpanStyleCommand implements ICommand {
  readonly description: string;
  private container: HTMLElement;
  private property: string;
  private value: string;
  private previousHTML: string;

  constructor(container: HTMLElement, property: string, value: string, description: string) {
    this.container = container;
    this.property = property;
    this.value = value;
    this.description = description;
    this.previousHTML = container.innerHTML;
  }

  execute(): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    const fragment = range.extractContents();
    const span = document.createElement('span');
    span.style.setProperty(this.property, this.value);
    span.appendChild(fragment);
    range.insertNode(span);
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);
  }

  undo(): void {
    this.container.innerHTML = DOMPurify.sanitize(this.previousHTML, { ADD_ATTR: ['style'] });
  }
}

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
    this.container.innerHTML = DOMPurify.sanitize(this.previousHTML, { ADD_ATTR: ['style'] });
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
  private savedSelection: Range | null = null;

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
      div.innerHTML = DOMPurify.sanitize(div.innerHTML, { ADD_ATTR: ['style'] });
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

    // Selection change — emit format:active and table:active state, save selection
    this.selectionHandler = () => {
      const sel = window.getSelection();
      // Only save selection when inside our editor
      if (sel && sel.rangeCount > 0 && div.contains(sel.anchorNode)) {
        this.savedSelection = sel.getRangeAt(0).cloneRange();
      }
      core.emit('selection:change', { selection: { anchor: 0, head: 0 } });
      core.emit('format:active', {
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikethrough: document.queryCommandState('strikeThrough'),
      });
      core.emit('table:active', { active: this.isInTable() });
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

    // Backspace: remove callout when empty
    if (e.key === 'Backspace') {
      const callout = this.getCurrentCallout();
      if (callout) {
        const body = callout.querySelector('.callout-body');
        if (body && (body.textContent ?? '').trim() === '') {
          e.preventDefault();
          const prev = this.editorDiv.innerHTML;
          const core = this.core;
          const editorDiv = this.editorDiv;
          callout.remove();
          core.emit('content:change', { content: editorDiv.innerHTML });
          core.executeCommand({
            description: 'Remove Callout',
            execute: () => {
              // already removed
            },
            undo: () => {
              editorDiv.innerHTML = DOMPurify.sanitize(prev, { ADD_ATTR: ['style'] });
              core.emit('content:change', { content: editorDiv.innerHTML });
            },
          });
          return;
        }
      }
    }

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

  private getCurrentCallout(): HTMLElement | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
    while (node && node !== this.editorDiv) {
      if (node instanceof HTMLElement && node.classList.contains('callout')) {
        return node;
      }
      node = node.parentNode;
    }
    return null;
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
      this.editorDiv.innerHTML = DOMPurify.sanitize(content, {
        ADD_ATTR: ['style', 'frameborder', 'allowfullscreen', 'sandbox'],
        ADD_TAGS: ['iframe'],
      });
    }
  }

  getToolbarItems(): ToolbarItem[] {
    const execCommand = (cmd: string, desc: string, value?: string) => (core: IEditorCore) => {
      if (this.editorDiv) {
        core.executeCommand(new FormatCommand(this.editorDiv, cmd, desc, value));
      }
    };

    const insertHR = (core: IEditorCore) => {
      if (!this.editorDiv) return;
      const prev = this.editorDiv.innerHTML;
      core.executeCommand({
        description: 'Horizontal Rule',
        execute: () => { document.execCommand('insertHTML', false, '<hr>'); },
        undo: () => { if (this.editorDiv) this.editorDiv.innerHTML = DOMPurify.sanitize(prev); },
      });
    };

    const applyColor = (color: string, core: IEditorCore) => {
      if (!this.editorDiv) return;
      core.executeCommand(new FormatCommand(this.editorDiv, 'foreColor', 'Text Color', color));
    };

    const applyHighlight = (color: string, core: IEditorCore) => {
      if (!this.editorDiv) return;
      core.executeCommand(new FormatCommand(this.editorDiv, 'hiliteColor', 'Highlight', color));
    };

    const applyLineHeight = (value: string, core: IEditorCore) => {
      if (!this.editorDiv) return;
      // Use savedSelection to handle focus loss when toolbar dropdown is clicked
      const range = this.savedSelection?.cloneRange() ?? (() => {
        const sel = window.getSelection();
        return (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;
      })();
      if (!range) return;
      const prev = this.editorDiv.innerHTML;
      core.executeCommand({
        description: 'Line Height',
        execute: () => {
          const BLOCK_TAGS = ['P', 'DIV', 'H1', 'H2', 'H3', 'LI', 'BLOCKQUOTE'];
          const allBlocks = Array.from(
            this.editorDiv!.querySelectorAll<HTMLElement>(BLOCK_TAGS.join(','))
          );
          const blocksInRange = allBlocks.filter(block => range.intersectsNode(block));
          // 조상 블록 제거: 다른 블록을 contains하는 블록은 제외 (leaf block만 적용)
          const leafBlocks = blocksInRange.filter(
            b => !blocksInRange.some(other => b !== other && b.contains(other))
          );
          if (leafBlocks.length > 0) {
            leafBlocks.forEach(block => { block.style.lineHeight = value; });
          } else if (allBlocks.length === 0) {
            this.editorDiv!.style.lineHeight = value;
          }
          core.emit('content:change', { content: this.editorDiv!.innerHTML });
        },
        undo: () => { if (this.editorDiv) this.editorDiv.innerHTML = DOMPurify.sanitize(prev, { ADD_ATTR: ['style'] }); },
      });
    };

    const applyFontFamily = (family: string, core: IEditorCore) => {
      if (!this.editorDiv) return;
      core.executeCommand(new SpanStyleCommand(this.editorDiv, 'font-family', family, 'Font Family'));
    };

    const applyFontSize = (size: string, core: IEditorCore) => {
      if (!this.editorDiv) return;
      core.executeCommand(new SpanStyleCommand(this.editorDiv, 'font-size', size, 'Font Size'));
    };

    const TEXT_COLORS = ['#000000', '#e03e3e', '#0f7b6c', '#0b6e99', '#6940a5', '#d9730d', '#64779c', '#9b9a97'];
    const HIGHLIGHT_COLORS = ['transparent', '#fdfdfd', '#ffecc7', '#d4efdf', '#d6eaf8', '#f4d7f5', '#fce8e4', '#e8eaf6'];
    const LINE_HEIGHT_OPTIONS = [
      { value: '1.0', label: '1.0' },
      { value: '1.5', label: '1.5' },
      { value: '1.75', label: '1.75' },
      { value: '2.0', label: '2.0' },
    ];
    const FONT_FAMILY_OPTIONS = [
      { value: 'inherit', label: '기본' },
      { value: "'Nanum Gothic', sans-serif", label: '나눔고딕' },
      { value: "'Malgun Gothic', sans-serif", label: '맑은고딕' },
      { value: 'Arial, sans-serif', label: 'Arial' },
      { value: "'Times New Roman', serif", label: 'Times' },
      { value: "'Courier New', monospace", label: 'Monospace' },
    ];
    const FONT_SIZE_OPTIONS = [
      { value: '10px', label: '10' },
      { value: '12px', label: '12' },
      { value: '14px', label: '14' },
      { value: '16px', label: '16' },
      { value: '18px', label: '18' },
      { value: '20px', label: '20' },
      { value: '24px', label: '24' },
      { value: '28px', label: '28' },
      { value: '32px', label: '32' },
      { value: '36px', label: '36' },
    ];

    return [
      {
        id: 'fontFamily', type: 'select', icon: 'Type', labelKey: 'editor.toolbar.fontFamily',
        selectOptions: FONT_FAMILY_OPTIONS,
        onSelect: applyFontFamily,
      },
      {
        id: 'fontSize', type: 'select', icon: 'AArrowUp', labelKey: 'editor.toolbar.fontSize',
        selectOptions: FONT_SIZE_OPTIONS,
        onSelect: applyFontSize,
      },
      { id: 'sep0', type: 'separator', labelKey: '' },
      { id: 'bold', type: 'button', icon: 'Bold', labelKey: 'editor.toolbar.bold', action: execCommand('bold', 'Bold') },
      { id: 'italic', type: 'button', icon: 'Italic', labelKey: 'editor.toolbar.italic', action: execCommand('italic', 'Italic') },
      { id: 'underline', type: 'button', icon: 'Underline', labelKey: 'editor.toolbar.underline', action: execCommand('underline', 'Underline') },
      { id: 'strike', type: 'button', icon: 'Strikethrough', labelKey: 'editor.toolbar.strike', action: execCommand('strikeThrough', 'Strikethrough') },
      {
        id: 'textColor', type: 'color-picker', icon: 'Palette', labelKey: 'editor.toolbar.textColor',
        colorOptions: TEXT_COLORS,
        onColorSelect: applyColor,
      },
      {
        id: 'highlight', type: 'color-picker', icon: 'Highlighter', labelKey: 'editor.toolbar.highlight',
        colorOptions: HIGHLIGHT_COLORS,
        onColorSelect: applyHighlight,
      },
      { id: 'sep1', type: 'separator', labelKey: '' },
      { id: 'h1', type: 'button', icon: 'Heading1', labelKey: 'editor.toolbar.h1', action: execCommand('formatBlock', 'Heading 1', '<h1>') },
      { id: 'h2', type: 'button', icon: 'Heading2', labelKey: 'editor.toolbar.h2', action: execCommand('formatBlock', 'Heading 2', '<h2>') },
      { id: 'h3', type: 'button', icon: 'Heading3', labelKey: 'editor.toolbar.h3', action: execCommand('formatBlock', 'Heading 3', '<h3>') },
      { id: 'sep2', type: 'separator', labelKey: '' },
      { id: 'ul', type: 'button', icon: 'List', labelKey: 'editor.toolbar.ul', action: execCommand('insertUnorderedList', 'Bullet List') },
      { id: 'ol', type: 'button', icon: 'ListOrdered', labelKey: 'editor.toolbar.ol', action: execCommand('insertOrderedList', 'Ordered List') },
      { id: 'blockquote', type: 'button', icon: 'Quote', labelKey: 'editor.toolbar.blockquote', action: execCommand('formatBlock', 'Blockquote', '<blockquote>') },
      { id: 'sep3', type: 'separator', labelKey: '' },
      { id: 'alignLeft', type: 'button', icon: 'AlignLeft', labelKey: 'editor.toolbar.alignLeft', action: execCommand('justifyLeft', 'Align Left') },
      { id: 'alignCenter', type: 'button', icon: 'AlignCenter', labelKey: 'editor.toolbar.alignCenter', action: execCommand('justifyCenter', 'Align Center') },
      { id: 'alignRight', type: 'button', icon: 'AlignRight', labelKey: 'editor.toolbar.alignRight', action: execCommand('justifyRight', 'Align Right') },
      { id: 'sep4', type: 'separator', labelKey: '' },
      { id: 'code', type: 'button', icon: 'Code', labelKey: 'editor.toolbar.code', action: execCommand('formatBlock', 'Code Block', '<pre>') },
      { id: 'hr', type: 'button', icon: 'Minus', labelKey: 'editor.toolbar.hr', action: insertHR },
      {
        id: 'lineHeight', type: 'select', icon: 'AlignJustify', labelKey: 'editor.toolbar.lineHeight',
        selectOptions: LINE_HEIGHT_OPTIONS,
        onSelect: applyLineHeight,
      },
      { id: 'sep5', type: 'separator', labelKey: '' },
      {
        id: 'callout', type: 'color-picker', icon: 'MessageSquare', labelKey: 'editor.toolbar.callout',
        colorOptions: ['#e8f4fd', '#fef9e7', '#f0fdf4', '#fef2f2', '#f5f0ff', '#fff7ed', '#f3f4f6'],
        onColorSelect: (color, core) => {
          if (!this.editorDiv) return;
          // If cursor is already inside a callout, toggle it off
          const existing = this.getCurrentCallout();
          if (existing) {
            const prev = this.editorDiv.innerHTML;
            const editorDiv = this.editorDiv;
            const body = existing.querySelector('.callout-body');
            const fragment = document.createDocumentFragment();
            if (body) {
              while (body.firstChild) fragment.appendChild(body.firstChild);
            }
            existing.replaceWith(fragment);
            core.emit('content:change', { content: editorDiv.innerHTML });
            core.executeCommand({
              description: 'Remove Callout',
              execute: () => {},
              undo: () => {
                editorDiv.innerHTML = DOMPurify.sanitize(prev, { ADD_ATTR: ['style'] });
                core.emit('content:change', { content: editorDiv.innerHTML });
              },
            });
            return;
          }
          // Insert new callout via DOM (prevents nesting)
          const prev = this.editorDiv.innerHTML;
          const editorDiv = this.editorDiv;
          const range = this.savedSelection?.cloneRange() ?? (() => {
            const sel = window.getSelection();
            return (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;
          })();
          const wrapper = document.createElement('div');
          wrapper.className = 'callout';
          wrapper.style.backgroundColor = color;
          const bodyDiv = document.createElement('div');
          bodyDiv.className = 'callout-body';
          const p = document.createElement('p');
          p.innerHTML = '<br>';
          bodyDiv.appendChild(p);
          wrapper.appendChild(bodyDiv);
          // Insert after current block
          let insertAfter: Node | null = null;
          if (range) {
            let block: Node | null = range.commonAncestorContainer;
            while (block && block !== editorDiv) {
              if (block.parentNode === editorDiv) {
                insertAfter = block;
                break;
              }
              block = block.parentNode;
            }
          }
          if (insertAfter && insertAfter.parentNode === editorDiv) {
            editorDiv.insertBefore(wrapper, insertAfter.nextSibling);
          } else {
            editorDiv.appendChild(wrapper);
          }
          if (!wrapper.nextSibling) {
            const nextP = document.createElement('p');
            nextP.innerHTML = '<br>';
            editorDiv.appendChild(nextP);
          }
          // Move cursor into callout body
          const sel2 = window.getSelection();
          if (sel2) {
            const r = document.createRange();
            r.setStart(p, 0);
            r.collapse(true);
            sel2.removeAllRanges();
            sel2.addRange(r);
          }
          core.emit('content:change', { content: editorDiv.innerHTML });
          core.executeCommand({
            description: 'Insert Callout',
            execute: () => {},
            undo: () => {
              editorDiv.innerHTML = DOMPurify.sanitize(prev, { ADD_ATTR: ['style'] });
              core.emit('content:change', { content: editorDiv.innerHTML });
            },
          });
        },
      },
      { id: 'table', type: 'button', icon: 'Table', labelKey: 'editor.toolbar.table', action: (core) => { core.emit('dialog:table', { mode: 'text' }); } },
      { id: 'sep6', type: 'separator', labelKey: '' },
      { id: 'link', type: 'button', icon: 'Link', labelKey: 'editor.toolbar.link', action: (_core) => { this.openLinkDialog(_core); } },
      { id: 'image', type: 'button', icon: 'Image', labelKey: 'editor.toolbar.image', action: () => { this.openImagePicker(); } },
      { id: 'embed', type: 'button', icon: 'Youtube', labelKey: 'editor.toolbar.embed', action: (core) => { core.emit('dialog:embed', { mode: 'text' }); } },
      { id: 'specialChar', type: 'button', icon: 'Hash', labelKey: 'editor.toolbar.specialChar', action: (core) => { core.emit('dialog:specialChar', { mode: 'text' }); } },
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

  // ── Table helpers ─────────────────────────────────────────────

  private getCurrentTableCell(): {
    tableEl: HTMLTableElement;
    rowEl: HTMLTableRowElement;
    cellEl: HTMLTableCellElement;
    rowIndex: number;
    colIndex: number;
  } | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
    while (node && node !== this.editorDiv) {
      if (node instanceof HTMLTableCellElement) {
        const rowEl = node.parentElement as HTMLTableRowElement;
        const tableEl = node.closest('table') as HTMLTableElement;
        if (!rowEl || !tableEl) return null;
        return { tableEl, rowEl, cellEl: node, rowIndex: rowEl.rowIndex, colIndex: node.cellIndex };
      }
      node = node.parentNode;
    }
    return null;
  }

  private tableCommand(description: string, op: () => void): void {
    if (!this.editorDiv || !this.core) return;
    const before = this.editorDiv.innerHTML;
    op();
    this.core.emit('content:change', { content: this.getContent() });
    const after = this.editorDiv.innerHTML;
    const div = this.editorDiv;
    const core = this.core;
    const sanitize = (html: string) =>
      DOMPurify.sanitize(html, { ADD_ATTR: ['style'], ADD_TAGS: ['iframe'] });
    let skipFirst = true;
    core.executeCommand({
      description,
      execute: () => {
        if (skipFirst) { skipFirst = false; return; }
        div.innerHTML = sanitize(after);
        core.emit('content:change', { content: div.innerHTML });
      },
      undo: () => {
        div.innerHTML = sanitize(before);
        core.emit('content:change', { content: div.innerHTML });
      },
    });
  }

  // ── Table insert ───────────────────────────────────────────────

  insertTable(rows: number, cols: number, hasHeader: boolean): void {
    if (!this.editorDiv || !this.core) return;
    let html = '<table class="editor-table">';
    if (hasHeader) {
      html += '<thead><tr>';
      for (let c = 0; c < cols; c++) html += `<th>헤더 ${c + 1}</th>`;
      html += '</tr></thead>';
    }
    html += '<tbody>';
    const bodyRows = hasHeader ? rows - 1 : rows;
    for (let r = 0; r < Math.max(1, bodyRows); r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) html += '<td><br></td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br></p>';
    this.tableCommand('Insert Table', () => {
      document.execCommand('insertHTML', false, html);
    });
  }

  // ── Row operations ─────────────────────────────────────────────

  addRowAbove(): void {
    const info = this.getCurrentTableCell();
    if (!info) return;
    this.tableCommand('Add Row Above', () => {
      const colCount = info.tableEl.rows[info.rowIndex]?.cells.length ?? 1;
      const newRow = info.tableEl.insertRow(info.rowIndex);
      for (let i = 0; i < colCount; i++) newRow.insertCell(i).innerHTML = '<br>';
    });
  }

  addRowBelow(): void {
    const info = this.getCurrentTableCell();
    if (!info) return;
    this.tableCommand('Add Row Below', () => {
      const colCount = info.tableEl.rows[info.rowIndex]?.cells.length ?? 1;
      const newRow = info.tableEl.insertRow(info.rowIndex + 1);
      for (let i = 0; i < colCount; i++) newRow.insertCell(i).innerHTML = '<br>';
    });
  }

  deleteRow(): void {
    const info = this.getCurrentTableCell();
    if (!info || info.tableEl.rows.length <= 1) return;
    this.tableCommand('Delete Row', () => {
      info.tableEl.deleteRow(info.rowIndex);
    });
  }

  // ── Column operations ──────────────────────────────────────────

  addColumnLeft(): void {
    const info = this.getCurrentTableCell();
    if (!info) return;
    this.tableCommand('Add Column Left', () => {
      for (let i = 0; i < info.tableEl.rows.length; i++) {
        const cell = info.tableEl.rows[i].insertCell(info.colIndex);
        cell.innerHTML = '<br>';
      }
    });
  }

  addColumnRight(): void {
    const info = this.getCurrentTableCell();
    if (!info) return;
    this.tableCommand('Add Column Right', () => {
      for (let i = 0; i < info.tableEl.rows.length; i++) {
        const cell = info.tableEl.rows[i].insertCell(info.colIndex + 1);
        cell.innerHTML = '<br>';
      }
    });
  }

  deleteColumn(): void {
    const info = this.getCurrentTableCell();
    if (!info || (info.tableEl.rows[0]?.cells.length ?? 0) <= 1) return;
    this.tableCommand('Delete Column', () => {
      for (let i = 0; i < info.tableEl.rows.length; i++) {
        if (info.tableEl.rows[i].cells[info.colIndex]) {
          info.tableEl.rows[i].deleteCell(info.colIndex);
        }
      }
    });
  }

  // ── Cell styling ───────────────────────────────────────────────

  setCellBgColor(color: string): void {
    const info = this.getCurrentTableCell();
    if (!info) return;
    this.tableCommand('Cell Background Color', () => {
      info.cellEl.style.backgroundColor = color === 'transparent' ? '' : color;
    });
  }

  setCellTextColor(color: string): void {
    const info = this.getCurrentTableCell();
    if (!info) return;
    this.tableCommand('Cell Text Color', () => {
      info.cellEl.style.color = color;
    });
  }

  deleteTable(): void {
    const info = this.getCurrentTableCell();
    if (!info) return;
    this.tableCommand('Delete Table', () => {
      info.tableEl.remove();
    });
  }

  isInTable(): boolean {
    return this.getCurrentTableCell() !== null;
  }

  insertEmbed(url: string): void {
    if (!this.editorDiv || !this.core) return;
    const prev = this.editorDiv.innerHTML;
    const core = this.core;
    const editorDiv = this.editorDiv;
    const range = this.savedSelection?.cloneRange() ?? (() => {
      const sel = window.getSelection();
      return (sel && sel.rangeCount > 0) ? sel.getRangeAt(0).cloneRange() : null;
    })();
    const embedUrl = toEmbedUrl(url);

    const doInsert = () => {
      const wrapper = document.createElement('div');
      wrapper.contentEditable = 'false';
      if (embedUrl) {
        wrapper.className = 'embed-wrapper';
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.setAttribute('frameborder', '0');
        iframe.allowFullscreen = true;
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
        wrapper.appendChild(iframe);
      } else {
        wrapper.className = 'embed-wrapper embed-link';
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = url;
        wrapper.appendChild(a);
      }
      // Insert after the current block element
      let insertAfter: Node | null = null;
      if (range) {
        let block: Node | null = range.commonAncestorContainer;
        while (block && block !== editorDiv) {
          if (block instanceof HTMLElement && ['P', 'DIV', 'H1', 'H2', 'H3', 'LI', 'BLOCKQUOTE', 'PRE'].includes(block.tagName)) {
            insertAfter = block;
            break;
          }
          block = block.parentNode;
        }
      }
      if (insertAfter && insertAfter.parentNode === editorDiv) {
        editorDiv.insertBefore(wrapper, insertAfter.nextSibling);
      } else {
        editorDiv.appendChild(wrapper);
      }
      // Ensure a paragraph follows
      if (!wrapper.nextSibling) {
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        editorDiv.appendChild(p);
      }
      core.emit('content:change', { content: editorDiv.innerHTML });
    };

    core.executeCommand({
      description: 'Insert Embed',
      execute: doInsert,
      undo: () => {
        editorDiv.innerHTML = DOMPurify.sanitize(prev, { ADD_ATTR: ['style', 'frameborder', 'allowfullscreen', 'sandbox'], ADD_TAGS: ['iframe'] });
        core.emit('content:change', { content: editorDiv.innerHTML });
      },
    });
  }

  insertSpecialChar(char: string): void {
    if (!this.editorDiv || !this.core) return;
    const prev = this.editorDiv.innerHTML;
    this.core.executeCommand({
      description: 'Insert Special Character',
      execute: () => { document.execCommand('insertText', false, char); },
      undo: () => { if (this.editorDiv) this.editorDiv.innerHTML = DOMPurify.sanitize(prev); },
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
    const sanitizeOpts = { ADD_ATTR: ['style', 'frameborder', 'allowfullscreen', 'sandbox'], ADD_TAGS: ['iframe'] };
    if (input.trimStart().startsWith('<')) {
      return DOMPurify.sanitize(input, sanitizeOpts);
    }
    const ast = markdownToAST(input);
    return DOMPurify.sanitize(astToHtml(ast), sanitizeOpts);
  }
}
