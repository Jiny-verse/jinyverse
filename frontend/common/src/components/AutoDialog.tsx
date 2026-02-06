'use client';

import React, { useState, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Switch } from '../ui/Switch';
import { Select } from '../ui/Select';
import type { z } from 'zod';

export type AutoDialogField = {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'checkbox' | 'toggle' | 'uuid' | 'select';
  optional?: boolean;
  /** 숨김 필드: 폼에는 안 보이고 defaultValue 또는 initialValues로만 값 유지 */
  hidden?: boolean;
  /** hidden 필드 또는 생성 시 기본값 */
  defaultValue?: unknown;
  /** select 타입일 때 옵션 목록 */
  options?: { value: string; label: string }[];
};

type AutoDialogProps<S extends z.ZodObject<z.ZodRawShape>> = {
  open: boolean;
  onClose: () => void;
  title: string;
  schema: S;
  fields: AutoDialogField[];
  mode: 'create' | 'edit';
  initialValues?: Partial<z.infer<S>>;
  onSubmit: (values: z.infer<S>) => void | Promise<void>;
};

export function AutoDialog<S extends z.ZodObject<z.ZodRawShape>>({
  open,
  onClose,
  title,
  schema,
  fields,
  mode,
  initialValues,
  onSubmit,
}: AutoDialogProps<S>) {
  const defaultFor = (f: AutoDialogField) => {
    if (f.hidden && f.defaultValue !== undefined) return f.defaultValue;
    if (f.type === 'checkbox' || f.type === 'toggle') return false;
    if (f.type === 'select') return '';
    return '';
  };
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const o: Record<string, unknown> = {};
    fields.forEach((f) => {
      const v = initialValues?.[f.key as keyof z.infer<S>];
      o[f.key] = v ?? defaultFor(f);
    });
    return o;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const err: Record<string, string> = {};
      parsed.error.errors.forEach((e) => {
        const path = e.path[0]?.toString();
        if (path) err[path] = e.message;
      });
      setErrors(err);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(parsed.data as z.infer<S>);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }, [schema, values, onSubmit, onClose]);

  React.useEffect(() => {
    if (open) {
      const o: Record<string, unknown> = {};
      fields.forEach((f) => {
        const v = initialValues?.[f.key as keyof z.infer<S>];
        o[f.key] = v ?? defaultFor(f);
      });
      setValues(o);
    }
  }, [open, initialValues, fields]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? '저장 중...' : mode === 'create' ? '생성' : '수정'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {fields.map((f) => {
          if (f.hidden) return null;
          return (
            <div key={f.key}>
              {f.type === 'textarea' ? (
                <Textarea
                  id={f.key}
                  label={f.label}
                  value={String(values[f.key] ?? '')}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  error={errors[f.key]}
                  rows={4}
                />
              ) : f.type === 'checkbox' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={f.key}
                    checked={Boolean(values[f.key])}
                    onChange={(e) => handleChange(f.key, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <label htmlFor={f.key} className="text-sm font-medium text-gray-700">
                    {f.label}
                  </label>
                </div>
              ) : f.type === 'toggle' ? (
                <Switch
                  id={f.key}
                  label={f.label}
                  checked={Boolean(values[f.key])}
                  onChange={(e) => handleChange(f.key, e.target.checked)}
                />
              ) : f.type === 'select' ? (
                <Select
                  id={f.key}
                  label={f.label}
                  options={f.options ?? []}
                  value={String(values[f.key] ?? '')}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  error={errors[f.key]}
                />
              ) : (
                <Input
                  id={f.key}
                  label={f.label}
                  type={f.type === 'number' ? 'number' : f.type === 'uuid' ? 'text' : 'text'}
                  value={String(values[f.key] ?? '')}
                  onChange={(e) =>
                    handleChange(
                      f.key,
                      f.type === 'number' ? e.target.valueAsNumber : e.target.value
                    )
                  }
                  error={errors[f.key]}
                />
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
