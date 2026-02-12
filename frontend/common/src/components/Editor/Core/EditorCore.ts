import type { IEditorCore, IEditorMode, ICommand, EditorEventMap } from '../Types';

type EventHandler<T> = (data: T) => void;

export class EditorCore implements IEditorCore {
  private eventBus = new Map<string, Set<EventHandler<unknown>>>();
  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private currentMode: IEditorMode | null = null;
  private destroyed = false;

  on<K extends keyof EditorEventMap>(
    event: K,
    handler: (data: EditorEventMap[K]) => void,
  ): void {
    if (!this.eventBus.has(event)) {
      this.eventBus.set(event, new Set());
    }
    this.eventBus.get(event)!.add(handler as EventHandler<unknown>);
  }

  off<K extends keyof EditorEventMap>(
    event: K,
    handler: (data: EditorEventMap[K]) => void,
  ): void {
    this.eventBus.get(event)?.delete(handler as EventHandler<unknown>);
  }

  emit<K extends keyof EditorEventMap>(event: K, data: EditorEventMap[K]): void {
    this.eventBus.get(event)?.forEach((handler) => handler(data as unknown));
  }

  executeCommand(command: ICommand): void {
    command.execute();
    this.undoStack.push(command);
    this.redoStack = [];
    this.emit('history:change', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }

  undo(): void {
    const command = this.undoStack.pop();
    if (!command) return;
    command.undo();
    this.redoStack.push(command);
    this.emit('history:change', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }

  redo(): void {
    const command = this.redoStack.pop();
    if (!command) return;
    command.execute();
    this.undoStack.push(command);
    this.emit('history:change', {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    });
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  initMode(mode: IEditorMode): void {
    this.currentMode = mode;
  }

  /**
   * Destroys the old mode, transforms its content, and registers the new mode.
   * Returns the transformed content — caller must call mode.setContent() after rendering.
   */
  setMode(mode: IEditorMode): string {
    const previousContent = this.currentMode?.getContent() ?? '';

    // Destroy previous mode (removes from DOM)
    this.currentMode?.destroy();

    // Transform data from previous mode format to new mode format
    const newContent = mode.transformData(previousContent);
    this.currentMode = mode;

    // Clear history on mode switch
    this.undoStack = [];
    this.redoStack = [];

    this.emit('mode:change', { mode: mode.name });
    this.emit('history:change', { canUndo: false, canRedo: false });

    // Return transformed content — caller sets it after rendering the DOM
    return newContent;
  }

  getCurrentMode(): IEditorMode | null {
    return this.currentMode;
  }

  getContent(): string {
    return this.currentMode?.getContent() ?? '';
  }

  setContent(content: string): void {
    this.currentMode?.setContent(content);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.currentMode?.destroy();
    this.eventBus.clear();
    this.undoStack = [];
    this.redoStack = [];
  }
}
