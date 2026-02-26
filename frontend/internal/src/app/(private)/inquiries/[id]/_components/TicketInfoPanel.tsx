'use client';

import { useState } from 'react';
import type { ApiOptions, Inquiry } from 'common/types';
import { updateInquiryStatus, updateInquiryPriority, assignInquiry } from 'common/services';

interface TicketInfoPanelProps {
  inquiry: Inquiry;
  apiOptions: ApiOptions;
  onUpdated: (updated: Inquiry) => void;
}

const STATUS_OPTIONS = ['pending', 'in_progress', 'answered', 'closed'];
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent'];

const PRIORITY_COLORS: Record<string, string> = {
  low: 'text-muted-foreground',
  medium: 'text-blue-600',
  high: 'text-orange-500',
  urgent: 'text-destructive font-bold',
};

export function TicketInfoPanel({ inquiry, apiOptions, onUpdated }: TicketInfoPanelProps) {
  const [assigneeIdInput, setAssigneeIdInput] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    try {
      const updated = await updateInquiryStatus(apiOptions, inquiry.id, newStatus);
      onUpdated(updated);
    } finally {
      setUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setUpdating(true);
    try {
      const updated = await updateInquiryPriority(apiOptions, inquiry.id, newPriority);
      onUpdated(updated);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigneeIdInput.trim()) return;
    setUpdating(true);
    try {
      const updated = await assignInquiry(apiOptions, inquiry.id, assigneeIdInput.trim());
      onUpdated(updated);
      setAssigneeIdInput('');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4 text-sm">
      <div>
        <p className="text-xs text-muted-foreground mb-1">티켓 번호</p>
        <p className="font-mono font-medium">{inquiry.ticketNo}</p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">카테고리</p>
        <p>{inquiry.categoryCode}</p>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">상태</p>
        <select
          value={inquiry.statusCode}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={updating}
          className="w-full border border-border rounded px-2 py-1 text-sm bg-background disabled:opacity-50"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">우선순위</p>
        <div className="flex gap-1 flex-wrap">
          {PRIORITY_OPTIONS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePriorityChange(p)}
              disabled={updating}
              className={`px-2 py-1 rounded text-xs border ${
                inquiry.priorityCode === p
                  ? 'border-primary bg-primary/10 font-medium'
                  : 'border-border hover:bg-muted'
              } ${PRIORITY_COLORS[p]} disabled:opacity-50`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">담당자</p>
        <p className="text-sm mb-2">{inquiry.assigneeName ?? '미지정'}</p>
        <form onSubmit={handleAssign} className="flex gap-2">
          <input
            type="text"
            value={assigneeIdInput}
            onChange={(e) => setAssigneeIdInput(e.target.value)}
            placeholder="담당자 UUID"
            className="flex-1 border border-border rounded px-2 py-1 text-xs bg-background"
          />
          <button
            type="submit"
            disabled={updating}
            className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs disabled:opacity-50"
          >
            지정
          </button>
        </form>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-1">생성일</p>
        <p className="text-xs">{new Date(inquiry.createdAt).toLocaleString('ko-KR')}</p>
      </div>
    </div>
  );
}
