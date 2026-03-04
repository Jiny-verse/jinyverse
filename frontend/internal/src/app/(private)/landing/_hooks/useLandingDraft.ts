'use client';

import { useState, useCallback, useRef } from 'react';
import {
  getAdminLandingSections,
  createLandingSection,
  updateLandingSection,
  deleteLandingSection,
  createLandingCta,
  updateLandingCta,
  deleteLandingCta,
  addSectionFile as addSectionFileService,
  removeSectionFile as removeSectionFileService,
  reorderSectionFiles as reorderSectionFilesService,
} from 'common/services';
import type { ApiOptions } from 'common/types';
import type {
  LandingSection,
  LandingCta,
  LandingSectionUpdateInput,
  LandingCtaUpdateInput,
} from 'common/schemas';

export function useLandingDraft(apiOptions: ApiOptions) {
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [original, setOriginal] = useState<LandingSection[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const apiOptionsRef = useRef(apiOptions);
  apiOptionsRef.current = apiOptions;
  const sectionsRef = useRef(sections);
  sectionsRef.current = sections;

  // Undo/redo stacks
  const undoStackRef = useRef<LandingSection[][]>([]);
  const redoStackRef = useRef<LandingSection[][]>([]);

  const pushHistory = useCallback(() => {
    undoStackRef.current = [...undoStackRef.current, sectionsRef.current].slice(-50);
    redoStackRef.current = [];
  }, []);

  const load = useCallback(async () => {
    const data = await getAdminLandingSections(apiOptionsRef.current);
    setSections(data);
    setOriginal(data);
    setIsDirty(false);
    undoStackRef.current = [];
    redoStackRef.current = [];
  }, []);

  const undo = useCallback(() => {
    const stack = undoStackRef.current;
    if (stack.length === 0) return;
    redoStackRef.current = [...redoStackRef.current, sectionsRef.current];
    const prev = stack[stack.length - 1];
    undoStackRef.current = stack.slice(0, -1);
    setSections(prev);
    setIsDirty(true);
  }, []);

  const redo = useCallback(() => {
    const stack = redoStackRef.current;
    if (stack.length === 0) return;
    undoStackRef.current = [...undoStackRef.current, sectionsRef.current];
    const next = stack[stack.length - 1];
    redoStackRef.current = stack.slice(0, -1);
    setSections(next);
    setIsDirty(true);
  }, []);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  const reorderSection = useCallback((fromIndex: number, toIndex: number) => {
    pushHistory();
    setSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      // Recalculate order (1-based)
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
    setIsDirty(true);
  }, [pushHistory]);

  const updateSection = useCallback((id: string, patch: Partial<LandingSectionUpdateInput>) => {
    pushHistory();
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setIsDirty(true);
  }, [pushHistory]);

  const deleteSection = useCallback(async (id: string) => {
    await deleteLandingSection(apiOptionsRef.current, id);
    setSections((prev) => prev.filter((s) => s.id !== id));
    setOriginal((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addSection = useCallback(async (type: string) => {
    const current = sectionsRef.current;
    const maxOrder = current.length > 0 ? Math.max(...current.map((s) => s.order)) : 0;
    const created = await createLandingSection(apiOptionsRef.current, {
      type,
      isActive: true,
      order: maxOrder + 1,
    });
    setSections((prev) => [...prev, created]);
    setOriginal((prev) => [...prev, created]);
  }, []);

  const updateCta = useCallback(
    (sectionId: string, ctaId: string, patch: Partial<LandingCtaUpdateInput>) => {
      pushHistory();
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, ctas: s.ctas.map((c) => (c.id === ctaId ? { ...c, ...patch } : c)) }
            : s
        )
      );
      setIsDirty(true);
    },
    [pushHistory]
  );

  const moveCta = useCallback(
    (sectionId: string, ctaId: string, top: number, left: number) => {
      // moveCta doesn't push history (too frequent during drag)
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? {
                ...s,
                ctas: s.ctas.map((c) =>
                  c.id === ctaId ? { ...c, positionTop: top, positionLeft: left } : c
                ),
              }
            : s
        )
      );
      setIsDirty(true);
    },
    []
  );

  const addCta = useCallback(async (sectionId: string, href: string): Promise<LandingCta> => {
    const created = await createLandingCta(apiOptionsRef.current, sectionId, {
      href,
      positionTop: 50,
      positionLeft: 50,
      isActive: true,
    });
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ctas: [...s.ctas, created] } : s))
    );
    setOriginal((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, ctas: [...s.ctas, created] } : s))
    );
    return created;
  }, []);

  const deleteCta = useCallback(async (sectionId: string, ctaId: string) => {
    await deleteLandingCta(apiOptionsRef.current, ctaId);
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, ctas: s.ctas.filter((c) => c.id !== ctaId) } : s
      )
    );
    setOriginal((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, ctas: s.ctas.filter((c) => c.id !== ctaId) } : s
      )
    );
  }, []);

  const addSectionFile = useCallback((sectionId: string, fileId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, fileIds: [...(s.fileIds ?? []), fileId] } : s
      )
    );
    setIsDirty(true);
  }, []);

  const removeSectionFile = useCallback((sectionId: string, fileId: string) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, fileIds: (s.fileIds ?? []).filter((id) => id !== fileId) } : s
      )
    );
    setIsDirty(true);
  }, []);

  const reorderSectionFiles = useCallback((sectionId: string, fileIds: string[]) => {
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, fileIds } : s))
    );
    setIsDirty(true);
  }, []);

  const saveAll = useCallback(async () => {
    const originalMap = new Map(original.map((s) => s.id).map((id, i) => [id, original[i]]));

    const savePromises: Promise<unknown>[] = [];

    for (const section of sections) {
      const orig = originalMap.get(section.id);
      if (!orig) continue;

      // Check if section fields or order changed
      const sectionChanged =
        section.order !== orig.order ||
        section.isActive !== orig.isActive ||
        section.boardId !== orig.boardId ||
        JSON.stringify(section.extraConfig) !== JSON.stringify(orig.extraConfig);

      if (sectionChanged) {
        savePromises.push(
          updateLandingSection(apiOptionsRef.current, section.id, {
            type: section.type,
            isActive: section.isActive,
            order: section.order,
            boardId: section.boardId ?? undefined,
            extraConfig: section.extraConfig ?? undefined,
          })
        );
      }

      // Check CTAs
      const origCtaMap = new Map(orig.ctas.map((c) => [c.id, c]));
      for (const cta of section.ctas) {
        const origCta = origCtaMap.get(cta.id);
        if (!origCta) continue;

        const ctaChanged =
          cta.type !== origCta.type ||
          cta.label !== origCta.label ||
          cta.href !== origCta.href ||
          cta.className !== origCta.className ||
          cta.positionTop !== origCta.positionTop ||
          cta.positionLeft !== origCta.positionLeft ||
          cta.positionBottom !== origCta.positionBottom ||
          cta.positionRight !== origCta.positionRight ||
          cta.positionTransform !== origCta.positionTransform ||
          cta.isActive !== origCta.isActive ||
          cta.order !== origCta.order ||
          cta.imageFileId !== origCta.imageFileId ||
          JSON.stringify(cta.styleConfig) !== JSON.stringify(origCta.styleConfig);

        if (ctaChanged) {
          savePromises.push(
            updateLandingCta(apiOptionsRef.current, cta.id, {
              type: cta.type,
              label: cta.label ?? undefined,
              href: cta.href,
              className: cta.className ?? undefined,
              positionTop: cta.positionTop ?? undefined,
              positionLeft: cta.positionLeft ?? undefined,
              positionBottom: cta.positionBottom ?? undefined,
              positionRight: cta.positionRight ?? undefined,
              positionTransform: cta.positionTransform ?? undefined,
              imageFileId: cta.imageFileId ?? undefined,
              styleConfig: cta.styleConfig ?? undefined,
              isActive: cta.isActive,
              order: cta.order,
            })
          );
        }
      }
    }

    await Promise.all(savePromises);

    // File diff: remove → add → reorder per section
    for (const section of sections) {
      const orig = originalMap.get(section.id);
      if (!orig) continue;
      const origFileIds = orig.fileIds ?? [];
      const currFileIds = section.fileIds ?? [];
      const toRemove = origFileIds.filter((id) => !currFileIds.includes(id));
      const toAdd = currFileIds.filter((id) => !origFileIds.includes(id));
      for (const fileId of toRemove) {
        await removeSectionFileService(apiOptionsRef.current, section.id, fileId);
      }
      for (const fileId of toAdd) {
        await addSectionFileService(apiOptionsRef.current, section.id, fileId, false);
      }
      if (
        currFileIds.length > 0 &&
        (toAdd.length > 0 || toRemove.length > 0 || currFileIds.join(',') !== origFileIds.join(','))
      ) {
        await reorderSectionFilesService(apiOptionsRef.current, section.id, currFileIds);
      }
    }

    await load();
  }, [sections, original, load]);

  const discard = useCallback(() => {
    setSections([...original]);
    setIsDirty(false);
    undoStackRef.current = [];
    redoStackRef.current = [];
  }, [original]);

  return {
    sections,
    isDirty,
    canUndo,
    canRedo,
    load,
    undo,
    redo,
    reorderSection,
    updateSection,
    deleteSection,
    addSection,
    addSectionFile,
    removeSectionFile,
    reorderSectionFiles,
    updateCta,
    moveCta,
    addCta,
    deleteCta,
    saveAll,
    discard,
  };
}
