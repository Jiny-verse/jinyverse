'use client';

import { DetailPreviewPanel } from 'common/components';
import type { AuditLog } from 'common/schemas';

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
  return (
    <DetailPreviewPanel title="감사 로그 상세" onClose={onClose}>
      <div className="space-y-4 text-sm">
        <table className="w-full text-left border-collapse">
          <tbody>
            {[
              ['대상 유형', log.targetType],
              ['대상 ID', log.targetId ?? '-'],
              ['액션', log.action],
              ['행위자 ID', log.actorUserId ?? '-'],
              ['IP 주소', log.ipAddress ?? '-'],
              ['생성일시', log.createdAt],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-gray-100">
                <th className="py-2 pr-4 font-medium text-gray-500 whitespace-nowrap w-28">
                  {label}
                </th>
                <td className="py-2 text-gray-800 break-all">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <p className="mb-1 font-medium text-gray-500">변경 전 (Before)</p>
          <pre className="rounded bg-gray-100 p-3 text-xs overflow-auto whitespace-pre-wrap break-all">
            {parseJson(log.beforeData)}
          </pre>
        </div>

        <div>
          <p className="mb-1 font-medium text-gray-500">변경 후 (After)</p>
          <pre className="rounded bg-gray-100 p-3 text-xs overflow-auto whitespace-pre-wrap break-all">
            {parseJson(log.afterData)}
          </pre>
        </div>
      </div>
    </DetailPreviewPanel>
  );
}
