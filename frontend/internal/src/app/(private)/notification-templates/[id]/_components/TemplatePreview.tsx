'use client';

import { useState } from 'react';
import { renderTemplatePreview } from 'common/services';

interface TemplatePreviewProps {
  body: string;
  emailSubject?: string;
  variables: string[];
}

export function TemplatePreview({ body, emailSubject, variables }: TemplatePreviewProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const renderedBody = renderTemplatePreview(body, values);
  const renderedSubject = emailSubject ? renderTemplatePreview(emailSubject, values) : undefined;

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">미리보기</h3>

      {variables.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">테스트 값 입력</p>
          {variables.map((v) => (
            <div key={v} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-28 shrink-0">{'{{'}{v}{'}}'}</span>
              <input
                type="text"
                value={values[v] ?? ''}
                onChange={(e) => handleChange(v, e.target.value)}
                placeholder={v}
                className="flex-1 border border-border rounded px-2 py-1 text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md border border-border bg-muted/30 p-4 space-y-3">
        {renderedSubject !== undefined && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">제목</p>
            <p className="text-sm">{renderedSubject || '(비어있음)'}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">본문</p>
          <pre className="text-sm whitespace-pre-wrap font-sans">{renderedBody || '(비어있음)'}</pre>
        </div>
      </div>
    </div>
  );
}
