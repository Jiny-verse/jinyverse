'use client';

import { useEffect, useState } from 'react';
import { useEditor } from './Hooks/useEditor';
import { Toolbar } from './UI/Toolbar';
import { StatusBar } from './UI/StatusBar';
import { LinkDialog } from './UI/LinkDialog';
import { ImageDialog } from './UI/ImageDialog';
import { TextMode } from './Modes/TextMode';
import { MarkdownMode } from './Modes/MarkdownMode';
import type { EditorProps } from './Types';

export function Editor({
  defaultValue = '',
  defaultMode = 'text',
  onChange,
  placeholder,
  className = '',
  minHeight = '200px',
  onUploadImage,
}: EditorProps) {
  const {
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
  } = useEditor({
    initialMode: defaultMode,
    initialContent: defaultValue,
    onChange,
  });

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkInitialText, setLinkInitialText] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  // Subscribe to dialog open events from modes
  useEffect(() => {
    const core = coreRef.current;
    if (!core) return;

    const onLinkDialog = (data: { mode: string; selectedText?: string }) => {
      setLinkInitialText(data.selectedText ?? '');
      setLinkDialogOpen(true);
    };
    const onImageDialog = () => setImageDialogOpen(true);

    core.on('dialog:link', onLinkDialog);
    core.on('dialog:image', onImageDialog);

    return () => {
      core.off('dialog:link', onLinkDialog);
      core.off('dialog:image', onImageDialog);
    };
  }, [coreRef.current]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleModeToggle = () => {
    setMode(currentMode === 'text' ? 'markdown' : 'text');
  };

  const handleLinkConfirm = (url: string, text: string) => {
    const mode = coreRef.current?.getCurrentMode();
    if (mode instanceof TextMode) mode.insertLink(url, text);
    else if (mode instanceof MarkdownMode) mode.insertLink(url, text);
  };

  const handleImageConfirm = (url: string, alt: string) => {
    const mode = coreRef.current?.getCurrentMode();
    if (mode instanceof TextMode) mode.insertImage(url, alt);
    else if (mode instanceof MarkdownMode) mode.insertImage(url, alt);
  };

  return (
    <div
      className={`flex flex-col border border-gray-300 rounded-md overflow-hidden bg-white text-gray-900 ${className}`}
    >
      <Toolbar
        items={toolbarItems}
        core={coreRef.current}
        currentMode={currentMode}
        onModeToggle={handleModeToggle}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className="flex-1 relative"
        style={{ minHeight }}
        data-placeholder={placeholder}
      />

      <StatusBar
        currentMode={currentMode}
        charCount={charCount}
        cursorLine={cursorLine}
        cursorColumn={cursorColumn}
      />

      <LinkDialog
        isOpen={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onConfirm={handleLinkConfirm}
        initialText={linkInitialText}
      />

      <ImageDialog
        isOpen={imageDialogOpen}
        onClose={() => setImageDialogOpen(false)}
        onConfirm={handleImageConfirm}
        onUpload={onUploadImage}
      />
    </div>
  );
}
