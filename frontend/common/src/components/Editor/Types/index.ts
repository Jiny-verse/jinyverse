// AST Node Types
export type MarkType = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code';

export type CalloutType = string; // background color hex (e.g. '#e8f4fd')

export interface Mark {
  type: MarkType;
}

export interface ASTNode {
  type: 'doc' | 'paragraph' | 'heading' | 'blockquote' | 'code_block' | 'list' | 'list_item' | 'text' | 'hard_break' | 'image' | 'link' | 'horizontal_rule' | 'callout' | 'embed' | 'table' | 'table_row' | 'table_cell';
  content?: ASTNode[];
  marks?: Mark[];
  text?: string;
  attrs?: Record<string, string | number | null>;
}

// Editor Selection / Range
export interface EditorSelection {
  anchor: number;
  head: number;
}

export interface EditorRange {
  from: number;
  to: number;
}

// Command Pattern
export interface ICommand {
  execute(): void;
  undo(): void;
  readonly description: string;
}

// Editor Mode Interface (Strategy Pattern)
export interface IEditorMode {
  readonly name: 'text' | 'markdown';
  render(container: HTMLElement, core: IEditorCore): void;
  destroy(): void;
  getContent(): string;
  setContent(content: string): void;
  getToolbarItems(): ToolbarItem[];
  transformData(input: string): string;
}

// Core Interface
export interface IEditorCore {
  on<K extends keyof EditorEventMap>(event: K, handler: (data: EditorEventMap[K]) => void): void;
  off<K extends keyof EditorEventMap>(event: K, handler: (data: EditorEventMap[K]) => void): void;
  emit<K extends keyof EditorEventMap>(event: K, data: EditorEventMap[K]): void;
  executeCommand(command: ICommand): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
  initMode(mode: IEditorMode): void;
  /** Destroys old mode, transforms content, registers new mode. Returns transformed content to apply after rendering. */
  setMode(mode: IEditorMode): string;
  getCurrentMode(): IEditorMode | null;
  getContent(): string;
  setContent(content: string): void;
  destroy(): void;
}

// Toolbar Item
export type ToolbarItemType = 'button' | 'separator' | 'mode-toggle' | 'color-picker' | 'select';

export interface ToolbarSelectOption {
  value: string;
  label: string;
}

export interface ToolbarItem {
  id: string;
  type: ToolbarItemType;
  icon?: string;
  labelKey: string;
  action?: (core: IEditorCore) => void;
  isActive?: (core: IEditorCore) => boolean;
  /** For 'color-picker' type: list of preset color hex strings */
  colorOptions?: string[];
  /** For 'color-picker' type: callback with chosen color */
  onColorSelect?: (color: string, core: IEditorCore) => void;
  /** For 'select' type: list of options */
  selectOptions?: ToolbarSelectOption[];
  /** For 'select' type: callback with chosen value */
  onSelect?: (value: string, core: IEditorCore) => void;
}

// Event Map (type-safe event bus)
export interface EditorEventMap {
  'content:change': { content: string };
  'mode:change': { mode: 'text' | 'markdown' };
  'selection:change': { selection: EditorSelection };
  'history:change': { canUndo: boolean; canRedo: boolean };
  'cursor:change': { line: number; column: number; charCount: number };
  'format:active': { bold: boolean; italic: boolean; underline: boolean; strikethrough: boolean };
  'dialog:link': { mode: 'text' | 'markdown'; selectedText?: string };
  'dialog:image': { mode: 'text' | 'markdown' };
  'dialog:specialChar': { mode: 'text' | 'markdown' };
  'dialog:embed': { mode: 'text' | 'markdown' };
  'dialog:table': { mode: 'text' | 'markdown' };
  'table:active': { active: boolean };
  'drop:image': { files: File[] };
}

// Editor Props
export interface EditorProps {
  defaultValue?: string;
  defaultMode?: 'text' | 'markdown';
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  /** Called when user selects an image file. Should return the uploaded image URL. */
  onUploadImage?: (file: File) => Promise<string>;
}
