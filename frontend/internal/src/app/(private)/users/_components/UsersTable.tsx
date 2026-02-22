'use client';

import { Avatar, Badge, PaginationFooter, SearchInput, FilterSelect } from 'common/ui';
import type { ApiOptions, User, PageResponse } from 'common/types';
import { useLanguage } from 'common/utils';

const getActiveOptions = (t: any) => [
  { value: 'true', label: t('common.active', { defaultValue: '활성' }) },
  { value: 'false', label: t('common.inactive', { defaultValue: '비활성' }) },
];

const getLockedOptions = (t: any) => [
  { value: 'false', label: t('common.normal', { defaultValue: '정상' }) },
  { value: 'true', label: t('user.status.locked', { defaultValue: '잠금' }) },
];

interface UsersTableProps {
  apiOptions: ApiOptions;
  data: PageResponse<User>;
  page: number;
  size: number;
  keyword: string;
  isActive: string;
  isLocked: string;
  selectedUserId: string | null;
  onKeywordChange: (v: string) => void;
  onActiveChange: (v: string) => void;
  onLockedChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onSizeChange: (s: number) => void;
  onSelectUser: (user: User) => void;
}

export function UsersTable({
  apiOptions,
  data,
  page,
  size,
  keyword,
  isActive,
  isLocked,
  selectedUserId,
  onKeywordChange,
  onActiveChange,
  onLockedChange,
  onPageChange,
  onSizeChange,
  onSelectUser,
}: UsersTableProps) {
  const { t, language } = useLanguage();
  const ACTIVE_OPTIONS = getActiveOptions(t);
  const LOCKED_OPTIONS = getLockedOptions(t);
  return (
    <div className="flex flex-col h-full min-h-0 rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* 필터 헤더 */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50/80">
        <SearchInput
          value={keyword}
          onChange={onKeywordChange}
          placeholder={t('form.placeholder.search')}
        />
        <FilterSelect
          label={t('common.active', { defaultValue: '활성' })}
          value={isActive}
          options={ACTIVE_OPTIONS}
          onChange={onActiveChange}
          placeholder={t('common.all')}
        />
        <FilterSelect
          label={t('user.status.locked', { defaultValue: '잠금' })}
          value={isLocked}
          options={LOCKED_OPTIONS}
          onChange={onLockedChange}
          placeholder={t('common.all')}
        />
      </div>

      {/* 테이블 */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 w-10"></th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t('form.label.username', { defaultValue: '사용자명' })}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t('form.label.name')}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t('form.label.nickname', { defaultValue: '닉네임' })}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t('form.label.email', { defaultValue: '이메일' })}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t('form.label.role', { defaultValue: '권한' })}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t('form.label.status', { defaultValue: '상태' })}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">{t('form.label.createdAt', { defaultValue: '생성일' })}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.content.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                  {t('common.noData', { defaultValue: '데이터가 없습니다' })}
                </td>
              </tr>
            ) : (
              data.content.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => onSelectUser(user)}
                  className={`cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedUserId === user.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  <td className="px-4 py-2">
                    <Avatar
                      fileId={user.profileImageFileId}
                      apiOptions={apiOptions}
                      alt={user.nickname}
                      size="sm"
                    />
                  </td>
                  <td className="px-4 py-2 text-gray-900 font-medium">{user.username}</td>
                  <td className="px-4 py-2 text-gray-700">{user.name}</td>
                  <td className="px-4 py-2 text-gray-700">{user.nickname}</td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{user.email}</td>
                  <td className="px-4 py-2">
                    <Badge variant={user.role === 'admin' ? 'error' : 'default'}>
                      {user.role ?? '-'}
                    </Badge>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      {user.isLocked && <Badge variant="warning">{t('user.status.locked', { defaultValue: '잠금' })}</Badge>}
                      {user.isActive === false && <Badge variant="error">{t('common.inactive', { defaultValue: '비활성' })}</Badge>}
                      {!user.isLocked && user.isActive !== false && (
                        <Badge variant="success">{t('common.normal', { defaultValue: '정상' })}</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-gray-400 text-xs">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(
                      language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US'
                    ) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationFooter
        page={page}
        size={size}
        totalElements={data.totalElements}
        totalPages={data.totalPages}
        currentCount={data.content.length}
        onPageChange={onPageChange}
        onSizeChange={onSizeChange}
      />
    </div>
  );
}
