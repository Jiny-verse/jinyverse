'use client';

import { useState } from 'react';
import type { NotificationTemplateInput } from 'common/types';

interface TemplateFormProps {
  initial?: Partial<NotificationTemplateInput>;
  onSubmit: (data: NotificationTemplateInput) => Promise<void>;
  submitLabel?: string;
}

export function TemplateForm({ initial, onSubmit, submitLabel = '저장' }: TemplateFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [channel, setChannel] = useState<'system' | 'email' | 'both'>(initial?.channel ?? 'both');
  const [emailSubject, setEmailSubject] = useState(initial?.emailSubject ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [variables, setVariables] = useState<string[]>(initial?.variables ?? []);
  const [varInput, setVarInput] = useState('');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addVariable = () => {
    const v = varInput.trim();
    if (v && !variables.includes(v)) {
      setVariables([...variables, v]);
    }
    setVarInput('');
  };

  const removeVariable = (v: string) => {
    setVariables(variables.filter((x) => x !== v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSubmit({ name, channel, emailSubject: emailSubject || undefined, body, variables, description: description || undefined });
    } catch (err: any) {
      setError(err?.message ?? '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="block text-sm font-medium mb-1">템플릿명 *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={255}
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">채널 *</label>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value as 'system' | 'email' | 'both')}
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="system">System Only</option>
          <option value="email">Email Only</option>
          <option value="both">System + Email</option>
        </select>
      </div>

      {(channel === 'email' || channel === 'both') && (
        <div>
          <label className="block text-sm font-medium mb-1">이메일 제목</label>
          <input
            type="text"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            maxLength={255}
            placeholder="예: [알림] {{message}}"
            className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">본문 *</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={6}
          placeholder="{{user_name}}님, {{message}}"
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-y"
        />
        <p className="text-xs text-muted-foreground mt-1">{'{{변수명}} 형식으로 변수를 사용할 수 있습니다.'}</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">지원 변수</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={varInput}
            onChange={(e) => setVarInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariable(); } }}
            placeholder="변수명 입력 후 Enter"
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={addVariable}
            className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm"
          >
            추가
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {variables.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded text-xs"
            >
              {'{{'}{v}{'}}'}
              <button type="button" onClick={() => removeVariable(v)} className="text-destructive hover:text-destructive/80">×</button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">설명</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full border border-border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-primary resize-y"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? '저장 중...' : submitLabel}
      </button>
    </form>
  );
}
