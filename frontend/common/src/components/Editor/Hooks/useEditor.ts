'use client';

import { useRef, useState, useEffect, MutableRefObject } from 'react';
import { EditorCore } from '../Core/EditorCore';
import { TextMode } from '../Modes/TextMode';
import { MarkdownMode } from '../Modes/MarkdownMode';
import type { IEditorCore, ToolbarItem } from '../Types';

interface UseEditorOptions {
  initialMode?: 'text' | 'markdown';
  initialContent?: string;
  onChange?: (content: string) => void;
}

interface UseEditorReturn {
  coreRef: MutableRefObject<IEditorCore | null>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
  currentMode: 'text' | 'markdown';
  setMode: (mode: 'text' | 'markdown') => void;
  toolbarItems: ToolbarItem[];
  canUndo: boolean;
  canRedo: boolean;
  charCount: number;
  cursorLine: number;
  cursorColumn: number;
}

export function useEditor({
  initialMode = 'text',
  initialContent = '',
  onChange,
}: UseEditorOptions = {}): UseEditorReturn {
  const coreRef = useRef<IEditorCore | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [currentMode, setCurrentModeState] = useState<'text' | 'markdown'>(initialMode);
  const [toolbarItems, setToolbarItems] = useState<ToolbarItem[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const core = new EditorCore();
    coreRef.current = core;

    const handleHistoryChange = (data: { canUndo: boolean; canRedo: boolean }) => {
      setCanUndo(data.canUndo);
      setCanRedo(data.canRedo);
    };
    const handleContentChange = (data: { content: string }) => {
      onChangeRef.current?.(data.content);
    };
    const handleCursorChange = (data: {
      line: number;
      column: number;
      charCount: number;
    }) => {
      setCursorLine(data.line);
      setCursorColumn(data.column);
      setCharCount(data.charCount);
    };

    core.on('history:change', handleHistoryChange);
    core.on('content:change', handleContentChange);
    core.on('cursor:change', handleCursorChange);

    // 1. Create mode instance
    const mode = initialMode === 'text' ? new TextMode() : new MarkdownMode();
    // 2. Render DOM into container
    mode.render(container, core);
    // 3. Register with core (no transformation for initial mount)
    core.initMode(mode);
    setToolbarItems(mode.getToolbarItems());
    // 4. Set initial content if provided
    if (initialContent) {
      core.setContent(initialContent);
      setCharCount(initialContent.length);
    }

    return () => {
      core.off('history:change', handleHistoryChange);
      core.off('content:change', handleContentChange);
      core.off('cursor:change', handleCursorChange);
      core.destroy();
      coreRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMode = (mode: 'text' | 'markdown') => {
    const core = coreRef.current;
    const container = containerRef.current;
    if (!core || !container) return;

    const newMode = mode === 'text' ? new TextMode() : new MarkdownMode();

    // 1. setMode: destroys old mode DOM, transforms content, registers new mode
    //    Returns transformed content to apply after rendering
    const transformedContent = core.setMode(newMode);

    // 2. Render new mode DOM into now-empty container
    newMode.render(container, core);

    // 3. Apply transformed content to newly rendered DOM
    newMode.setContent(transformedContent);

    setToolbarItems(newMode.getToolbarItems());
    setCurrentModeState(mode);
  };

  return {
    coreRef,
    containerRef,
    currentMode,
    setMode,
    toolbarItems,
    canUndo,
    canRedo,
    charCount,
    cursorLine,
    cursorColumn,
  };
}
