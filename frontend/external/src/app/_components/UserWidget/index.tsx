'use client';

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from 'common';
import { getMe } from 'common/services';
import { Avatar } from 'common/ui';
import { useLanguage } from 'common/utils';
import type { ApiOptions, User } from 'common/types';

interface UserWidgetProps {
  apiOptions: ApiOptions;
}

export function UserWidget({ apiOptions }: UserWidgetProps) {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<User | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authUser) return;
    getMe(apiOptions).then(setMe).catch(() => {});
  }, [authUser, apiOptions.baseUrl]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!authUser) return null;

  const handleLogout = () => {
    setOpen(false);
    logout();
    router.replace('/login');
  };

  const displayName = me?.nickname ?? authUser.username;

  return (
    <div ref={containerRef} className="relative ml-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('nav.profile')}
        className={`w-52 h-10 flex items-center gap-2 px-1 bg-background border border-border shadow-sm text-foreground hover:bg-muted/50 transition-colors ${
          open ? 'rounded-t-[20px] border-b-background' : 'rounded-full'
        }`}
      >
        <Avatar
          fileId={me?.profileImageFileId}
          apiOptions={me ? apiOptions : null}
          alt={displayName}
          size="sm"
          fallback={displayName.charAt(0).toUpperCase()}
        />
        <span className="flex-1 text-center text-sm font-medium truncate">{t('common.greeting', { name: displayName })}</span>
        <svg
          viewBox="0 0 24 24"
          width={14}
          height={14}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 w-52 rounded-b-[20px] border border-t-0 border-border bg-background shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">{t('common.greeting', { name: displayName })}</p>
            <p className="text-xs text-muted-foreground truncate">{me?.email ?? authUser.username}</p>
          </div>
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors no-underline"
            >
              {t('nav.profileManage')}
            </Link>
            <Link
              href="/inquiries"
              onClick={() => setOpen(false)}
              className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors no-underline"
            >
              {t('nav.myInquiries')}
            </Link>
          </div>
          <div className="border-t border-border py-1">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              {t('ui.button.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
