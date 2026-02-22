'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getMenuResolve } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { useLanguage } from 'common/utils';

export default function MenuResolvePage() {
  const params = useParams();
  const router = useRouter();
  const options = useApiOptions();
  const { t } = useLanguage();
  const code = params.code as string;

  useEffect(() => {
    if (!code) {
      router.replace('/');
      return;
    }
    getMenuResolve(options, decodeURIComponent(code))
      .then((res) => {
        if (!res) {
          router.replace('/');
          return;
        }
        if (res.type === 'board' && res.boardId) {
          router.replace(`/boards/${res.boardId}/topics`);
        } else if (res.type === 'topic' && res.boardId && res.topicId) {
          router.replace(`/boards/${res.boardId}/topics/${res.topicId}`);
        } else if (res.type === 'link' && res.path) {
          if (res.path.startsWith('http')) {
            window.location.href = res.path;
          } else {
            router.replace(res.path);
          }
        } else {
          router.replace('/');
        }
      })
      .catch(() => router.replace('/'));
  }, [code, options.baseUrl, options.channel, router]);

  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <p className="text-neutral-400">{t('common.redirecting')}</p>
    </div>
  );
}
