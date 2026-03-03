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

  const load = useCallback(async () => {
    const data = await getAdminLandingSections(apiOptionsRef.current);
    setSections(data);
    setOriginal(data);
    setIsDirty(false);
  }, []);

  const reorderSection = useCallback((fromIndex: number, toIndex: number) => {
    setSections((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      // Recalculate order (1-based)
      return next.map((s, i) => ({ ...s, order: i + 1 }));
    });
    setIsDirty(true);
  }, []);

  const updateSection = useCallback((id: string, patch: Partial<LandingSectionUpdateInput>) => {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setIsDirty(true);
  }, []);

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
      setSections((prev) =>
        prev.map((s) =>
          s.id === sectionId
            ? { ...s, ctas: s.ctas.map((c) => (c.id === ctaId ? { ...c, ...patch } : c)) }
            : s
        )
      );
      setIsDirty(true);
    },
    []
  );

  const moveCta = useCallback(
    (sectionId: string, ctaId: string, top: number, left: number) => {
      updateCta(sectionId, ctaId, { positionTop: top, positionLeft: left });
    },
    [updateCta]
  );

  const addCta = useCallback(async (sectionId: string, href: string) => {
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

  const addSectionFile = useCallback(async (sectionId: string, fileId: string, isMain = false) => {
    const updated = await addSectionFileService(apiOptionsRef.current, sectionId, fileId, isMain);
    setSections((prev) => prev.map((s) => (s.id === sectionId ? updated : s)));
    setOriginal((prev) => prev.map((s) => (s.id === sectionId ? updated : s)));
  }, []);

  const removeSectionFile = useCallback(async (sectionId: string, fileId: string) => {
    await removeSectionFileService(apiOptionsRef.current, sectionId, fileId);
    setSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, fileIds: (s.fileIds ?? []).filter((id) => id !== fileId) } : s
      )
    );
    setOriginal((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, fileIds: (s.fileIds ?? []).filter((id) => id !== fileId) } : s
      )
    );
  }, []);

  const reorderSectionFiles = useCallback(async (sectionId: string, fileIds: string[]) => {
    const updated = await reorderSectionFilesService(apiOptionsRef.current, sectionId, fileIds);
    setSections((prev) => prev.map((s) => (s.id === sectionId ? updated : s)));
    setOriginal((prev) => prev.map((s) => (s.id === sectionId ? updated : s)));
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
          cta.imageFileId !== origCta.imageFileId;

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
              isActive: cta.isActive,
              order: cta.order,
            })
          );
        }
      }
    }

    await Promise.all(savePromises);
    await load();
  }, [sections, original, load]);

  const discard = useCallback(() => {
    setSections([...original]);
    setIsDirty(false);
  }, [original]);

  return {
    sections,
    isDirty,
    load,
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
