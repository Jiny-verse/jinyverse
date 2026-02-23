'use client';

import { DetailPreviewPanel } from 'common/components';
import type { AuditLog } from 'common/schemas';
import { useLanguage } from 'common/utils';

interface DetailPanelProps {
  log: AuditLog;
  onClose: () => void;
}

function parseJson(raw: string | null | undefined): string {
  if (!raw) return '-';
  try {
    return JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return raw;
  }
}

export function DetailPanel({ log, onClose }: DetailPanelProps) {
  const { t } = useLanguage();
  return (
    <DetailPreviewPanel title={t('admin.audit.detail')} onClose={onClose}>
      <div className="space-y-4 text-sm">
        <table className="w-full text-left border-collapse">
          <tbody>
            {[
              [t('form.label.targetType'), log.targetType],
              [t('admin.audit.targetId'), log.targetId ?? '-'],
              [t('form.label.action'), log.action],
              [t('admin.audit.actorId'), log.actorUserId ?? '-'],
              [t('admin.audit.ipAddress'), log.ipAddress ?? '-'],
              [t('form.label.createdAt'), log.createdAt],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-gray-100">
                <th className="py-2 pr-4 font-medium text-muted-foreground whitespace-nowrap w-28">
                  {label}
                </th>
                <td className="py-2 text-gray-800 break-all">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <p className="mb-1 font-medium text-muted-foreground">{t('admin.audit.before')}</p>
          <pre className="rounded bg-gray-100 p-3 text-xs overflow-auto whitespace-pre-wrap break-all">
            {parseJson(log.beforeData)}
          </pre>
        </div>

        <div>
          <p className="mb-1 font-medium text-muted-foreground">{t('admin.audit.after')}</p>
          <pre className="rounded bg-gray-100 p-3 text-xs overflow-auto whitespace-pre-wrap break-all">
            {parseJson(log.afterData)}
          </pre>
        </div>
      </div>
    </DetailPreviewPanel>
  );
}
