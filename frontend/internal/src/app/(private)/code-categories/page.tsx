'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getCodeCategories,
  getCodes,
  createCodeCategory,
  updateCodeCategory,
  deleteCodeCategory,
  createCode,
  updateCode,
  deleteCode,
} from 'common/services';
import type { CodeCategory, Code } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useLanguage, parseApiError } from 'common/utils';
import { Alert, Toast, useToast } from 'common/ui';
import { CategoryTable } from './_components/CategoryTable';
import { CodeTable } from './_components/CodeTable';
import { CreateCategoryDialog } from './_components/CreateCategoryDialog';
import { UpdateCategoryDialog } from './_components/UpdateCategoryDialog';
import { CreateCodeDialog } from './_components/CreateCodeDialog';
import { UpdateCodeDialog } from './_components/UpdateCodeDialog';

type PageData = {
  content: CodeCategory[];
  totalElements: number;
  totalPages: number;
};

export default function CodeCategoriesPage() {
  const options = useApiOptions();
  const { t } = useLanguage();
  const { toast, showToast, hideToast } = useToast();

  const [categoryData, setCategoryData] = useState<PageData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [catPage, setCatPage] = useState(0);
  const [catSize, setCatSize] = useState(10);
  const [catSearch, setCatSearch] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<CodeCategory | null>(null);
  const [codes, setCodes] = useState<Code[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);

  const [createCatOpen, setCreateCatOpen] = useState(false);
  const [updateCatTarget, setUpdateCatTarget] = useState<CodeCategory | null>(null);
  const [createCodeOpen, setCreateCodeOpen] = useState(false);
  const [updateCodeTarget, setUpdateCodeTarget] = useState<Code | null>(null);

  const loadCategories = useCallback(() => {
    getCodeCategories(options, {
      page: catPage,
      size: catSize,
      q: catSearch.trim() || undefined,
    })
      .then((data) => { setCategoryData(data); setLoadError(null); })
      .catch((err) => {
        const { messageKey, fallback } = parseApiError(err);
        setLoadError(t(messageKey) || fallback);
      });
  }, [options.baseUrl, options.channel, options.role, catPage, catSize, catSearch]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const loadCodes = useCallback(
    (category: CodeCategory) => {
      setCodesLoading(true);
      getCodes(options, { categoryCode: category.code, size: 100 })
        .then(setCodes)
        .catch((err) => {
          const { messageKey, fallback } = parseApiError(err);
          setLoadError(t(messageKey) || fallback);
        })
        .finally(() => setCodesLoading(false));
    },
    [options.baseUrl, options.channel, options.role]
  );

  useEffect(() => {
    if (selectedCategory) {
      loadCodes(selectedCategory);
    } else {
      setCodes([]);
    }
  }, [selectedCategory, loadCodes]);

  const handleSelectCategory = (cat: CodeCategory) => {
    setSelectedCategory(cat);
  };

  const handleCreateCategory = async (data: {
    code: string;
    name: string;
    isSealed: boolean;
    description?: string;
    note?: string;
  }) => {
    await createCodeCategory(options, data);
    loadCategories();
  };

  const handleUpdateCategory = async (data: {
    name?: string;
    isSealed?: boolean;
    description?: string;
    note?: string;
  }) => {
    if (!updateCatTarget) return;
    await updateCodeCategory(options, updateCatTarget.code, data);
    if (selectedCategory?.code === updateCatTarget.code) {
      setSelectedCategory((prev) => prev ? { ...prev, ...data } : prev);
    }
    loadCategories();
  };

  const handleDeleteCategory = async (code: string) => {
    try {
      await deleteCodeCategory(options, code);
      if (selectedCategory?.code === code) setSelectedCategory(null);
      loadCategories();
    } catch (err) {
      const { messageKey, fallback } = parseApiError(err);
      showToast(t(messageKey) || fallback, 'error');
    }
  };

  const handleCreateCode = async (data: {
    code: string;
    name: string;
    value?: string;
    description?: string;
    note?: string;
    order?: number;
  }) => {
    if (!selectedCategory) return;
    await createCode(options, { categoryCode: selectedCategory.code, ...data });
    loadCodes(selectedCategory);
  };

  const handleUpdateCode = async (data: {
    name?: string;
    value?: string;
    description?: string;
    note?: string;
    order?: number;
  }) => {
    if (!selectedCategory || !updateCodeTarget) return;
    await updateCode(options, selectedCategory.code, updateCodeTarget.code, data);
    loadCodes(selectedCategory);
  };

  const handleDeleteCode = async (catCode: string, code: string) => {
    try {
      await deleteCode(options, catCode, code);
      if (selectedCategory) loadCodes(selectedCategory);
    } catch (err) {
      const { messageKey, fallback } = parseApiError(err);
      showToast(t(messageKey) || fallback, 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <Toast {...toast} onClose={hideToast} />
      <h1 className="text-2xl font-bold">{t('admin.category.title')}</h1>
      {loadError && <Alert variant="error">{loadError}</Alert>}
      <div className="flex gap-6">
        <div className="w-1/2 min-w-0">
          <CategoryTable
            data={categoryData?.content ?? []}
            totalElements={categoryData?.totalElements ?? 0}
            totalPages={categoryData?.totalPages ?? 0}
            page={catPage}
            size={catSize}
            search={catSearch}
            isLoading={!categoryData}
            selectedCode={selectedCategory?.code}
            onPageChange={setCatPage}
            onSizeChange={(s) => { setCatSize(s); setCatPage(0); }}
            onSearchChange={(v) => { setCatSearch(v); setCatPage(0); }}
            onSelect={handleSelectCategory}
            onAdd={() => setCreateCatOpen(true)}
            onEdit={(cat) => setUpdateCatTarget(cat)}
            onDelete={handleDeleteCategory}
          />
        </div>
        <div className="w-1/2 min-w-0">
          <CodeTable
            categoryCode={selectedCategory?.code ?? null}
            isSealed={selectedCategory?.isSealed ?? false}
            codes={codes}
            isLoading={codesLoading}
            onAdd={() => setCreateCodeOpen(true)}
            onEdit={(code) => setUpdateCodeTarget(code)}
            onDelete={handleDeleteCode}
          />
        </div>
      </div>

      <CreateCategoryDialog
        open={createCatOpen}
        onClose={() => setCreateCatOpen(false)}
        onSubmit={handleCreateCategory}
      />
      <UpdateCategoryDialog
        open={!!updateCatTarget}
        target={updateCatTarget}
        onClose={() => setUpdateCatTarget(null)}
        onSubmit={handleUpdateCategory}
      />
      <CreateCodeDialog
        open={createCodeOpen && !!selectedCategory}
        onClose={() => setCreateCodeOpen(false)}
        onSubmit={handleCreateCode}
      />
      <UpdateCodeDialog
        open={!!updateCodeTarget}
        target={updateCodeTarget}
        onClose={() => setUpdateCodeTarget(null)}
        onSubmit={handleUpdateCode}
      />
    </div>
  );
}
