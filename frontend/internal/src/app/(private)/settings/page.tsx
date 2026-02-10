'use client';

import { useEffect, useState } from 'react';
import { getFileStorageSetting, updateFileStorageSetting } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';

export default function SettingsPage() {
  const options = useApiOptions();
  const [basePath, setBasePath] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    getFileStorageSetting(options)
      .then((res) => setBasePath(res.basePath ?? ''))
      .catch(() => setMessage({ type: 'error', text: '설정을 불러오지 못했습니다.' }))
      .finally(() => setLoading(false));
  }, [options.baseUrl, options.channel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);
    try {
      await updateFileStorageSetting(options, { basePath: basePath.trim() || null });
      setMessage({ type: 'ok', text: '저장했습니다.' });
    } catch {
      setMessage({ type: 'error', text: '저장에 실패했습니다. 관리자 권한을 확인하세요.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">설정</h1>

      <section className="max-w-xl rounded-lg border border-[#333] bg-[#1f1f1f] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">파일 저장소</h2>
        <p className="mb-4 text-sm text-neutral-400">
          업로드된 파일을 저장할 서버 디렉터리 경로입니다. 비우면 application.yml 또는 환경변수 기본값을 사용합니다.
        </p>
        {loading ? (
          <p className="text-sm text-neutral-400">로딩 중...</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-300">저장 경로</span>
              <input
                type="text"
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                placeholder="/var/jinyverse/uploads"
                className="rounded border border-[#444] bg-[#181818] px-3 py-2 text-white placeholder:text-gray-500 focus:border-[#666] focus:outline-none"
                maxLength={500}
              />
            </label>
            {message && (
              <p
                className={`text-sm ${message.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}
              >
                {message.text}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="self-start rounded border border-[#555] bg-[#333] px-4 py-2 text-sm font-medium text-white hover:bg-[#444] disabled:opacity-50"
            >
              {saving ? '저장 중...' : '저장'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
