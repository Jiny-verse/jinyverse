'use client';

import { useEffect, useState } from 'react';
import { useEditor } from './Hooks/useEditor';
import { Toolbar } from './UI/Toolbar';
import { StatusBar } from './UI/StatusBar';
import { LinkDialog } from './UI/LinkDialog';
import { ImageDialog } from './UI/ImageDialog';
import { SpecialCharDialog } from './UI/SpecialCharDialog';
import { EmbedDialog } from './UI/EmbedDialog';
import { TableDialog } from './UI/TableDialog';
import { TableToolbar } from './UI/TableToolbar';
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
  const [specialCharDialogOpen, setSpecialCharDialogOpen] = useState(false);
  const [embedDialogOpen, setEmbedDialogOpen] = useState(false);
  const [tableDialogOpen, setTableDialogOpen] = useState(false);
  const [isInTable, setIsInTable] = useState(false);

  // Subscribe to dialog open events from modes
  useEffect(() => {
    const core = coreRef.current;
    if (!core) return;

    const onLinkDialog = (data: { mode: string; selectedText?: string }) => {
      setLinkInitialText(data.selectedText ?? '');
      setLinkDialogOpen(true);
    };
    const onImageDialog = () => setImageDialogOpen(true);
    const onSpecialCharDialog = () => setSpecialCharDialogOpen(true);
    const onEmbedDialog = () => setEmbedDialogOpen(true);
    const onTableDialog = () => setTableDialogOpen(true);
    const onTableActive = ({ active }: { active: boolean }) => setIsInTable(active);
    const onDropImage = async ({ files }: { files: File[] }) => {
      if (!onUploadImage) return;
      const mode = coreRef.current?.getCurrentMode();
      for (const file of files) {
        try {
          const url = await onUploadImage(file);
          if (mode instanceof TextMode) mode.insertImage(url, '');
          else if (mode instanceof MarkdownMode) mode.insertImage(url, '');
        } catch {
          // ignore individual file upload errors
        }
      }
    };

    core.on('dialog:link', onLinkDialog);
    core.on('dialog:image', onImageDialog);
    core.on('dialog:specialChar', onSpecialCharDialog);
    core.on('dialog:embed', onEmbedDialog);
    core.on('dialog:table', onTableDialog);
    core.on('table:active', onTableActive);
    core.on('drop:image', onDropImage);

    return () => {
      core.off('dialog:link', onLinkDialog);
      core.off('dialog:image', onImageDialog);
      core.off('dialog:specialChar', onSpecialCharDialog);
      core.off('dialog:embed', onEmbedDialog);
      core.off('dialog:table', onTableDialog);
      core.off('table:active', onTableActive);
      core.off('drop:image', onDropImage);
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

  const handleSpecialCharSelect = (char: string) => {
    const mode = coreRef.current?.getCurrentMode();
    if (mode instanceof TextMode) mode.insertSpecialChar(char);
    else if (mode instanceof MarkdownMode) mode.insertSpecialChar(char);
  };

  const handleEmbedConfirm = (url: string) => {
    const mode = coreRef.current?.getCurrentMode();
    if (mode instanceof TextMode) mode.insertEmbed(url);
    else if (mode instanceof MarkdownMode) mode.insertEmbed(url);
  };

  const handleTableConfirm = (rows: number, cols: number, hasHeader: boolean) => {
    const mode = coreRef.current?.getCurrentMode();
    if (mode instanceof TextMode) mode.insertTable(rows, cols, hasHeader);
    else if (mode instanceof MarkdownMode) mode.insertTable(rows, cols, hasHeader);
  };

  const getTextMode = (): TextMode | null => {
    const mode = coreRef.current?.getCurrentMode();
    return mode instanceof TextMode ? mode : null;
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

      {isInTable && currentMode === 'text' && (
        <TableToolbar
          onAddRowAbove={() => getTextMode()?.addRowAbove()}
          onAddRowBelow={() => getTextMode()?.addRowBelow()}
          onDeleteRow={() => getTextMode()?.deleteRow()}
          onAddColLeft={() => getTextMode()?.addColumnLeft()}
          onAddColRight={() => getTextMode()?.addColumnRight()}
          onDeleteCol={() => getTextMode()?.deleteColumn()}
          onSetCellBgColor={(c) => getTextMode()?.setCellBgColor(c)}
          onSetCellTextColor={(c) => getTextMode()?.setCellTextColor(c)}
          onDeleteTable={() => getTextMode()?.deleteTable()}
        />
      )}

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

      <SpecialCharDialog
        isOpen={specialCharDialogOpen}
        onClose={() => setSpecialCharDialogOpen(false)}
        onSelect={handleSpecialCharSelect}
      />

      <EmbedDialog
        isOpen={embedDialogOpen}
        onClose={() => setEmbedDialogOpen(false)}
        onConfirm={handleEmbedConfirm}
      />

      <TableDialog
        isOpen={tableDialogOpen}
        onClose={() => setTableDialogOpen(false)}
        onConfirm={handleTableConfirm}
      />
    </div>
  );
}
