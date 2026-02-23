'use client';

import { Avatar, Badge, FilterSelect } from 'common/ui';
import { DataTable, type ColumnDef } from 'common/components';
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

  const columns: ColumnDef<User>[] = [
    {
      key: 'avatar',
      header: '',
      width: '3rem',
      render: (user) => (
        <Avatar
          fileId={user.profileImageFileId}
          apiOptions={apiOptions}
          alt={user.nickname}
          size="sm"
        />
      ),
    },
    {
      key: 'username',
      header: t('form.label.username', { defaultValue: '사용자명' }),
      render: (row) => <span className="font-medium text-foreground">{row.username}</span>,
    },
    {
      key: 'name',
      header: t('form.label.name'),
      render: (row) => <span className="text-foreground/80">{row.name}</span>,
    },
    {
      key: 'nickname',
      header: t('form.label.nickname', { defaultValue: '닉네임' }),
      render: (row) => <span className="text-foreground/80">{row.nickname}</span>,
    },
    {
      key: 'email',
      header: t('form.label.email', { defaultValue: '이메일' }),
      render: (row) => <span className="text-muted-foreground text-xs">{row.email}</span>,
    },
    {
      key: 'role',
      header: t('form.label.role', { defaultValue: '권한' }),
      render: (user) => (
        <Badge variant={user.role === 'admin' ? 'error' : 'default'}>
          {user.role ?? '-'}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: t('form.label.status', { defaultValue: '상태' }),
      render: (user) => (
        <div className="flex gap-1">
          {user.isLocked && <Badge variant="warning">{t('user.status.locked', { defaultValue: '잠금' })}</Badge>}
          {user.isActive === false && <Badge variant="error">{t('common.inactive', { defaultValue: '비활성' })}</Badge>}
          {!user.isLocked && user.isActive !== false && (
            <Badge variant="success">{t('common.normal', { defaultValue: '정상' })}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: t('form.label.createdAt', { defaultValue: '생성일' }),
      render: (user) => (
        <span className="text-muted-foreground text-xs">
          {user.createdAt
            ? new Date(user.createdAt).toLocaleString(
                language === 'ko' ? 'ko-KR' : language === 'ja' ? 'ja-JP' : 'en-US',
                { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }
              )
            : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="h-full flex flex-col min-h-0">
      <DataTable<User>
        data={data.content ?? []}
        columns={columns}
        isLoading={false}
        emptyMessage={t('common.noData')}
        pagination={{
          page,
          size,
          totalElements: data.totalElements,
          totalPages: data.totalPages,
          onPageChange,
          onSizeChange,
        }}
        search={{
          value: keyword,
          onChange: onKeywordChange,
          placeholder: t('form.placeholder.search'),
        }}
        filterSlot={
          <div className="flex items-center gap-3">
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
        }
        onRowClick={onSelectUser}
        selectedRowId={selectedUserId}
        getRowId={(row) => row.id}
      />
    </div>
  );
}
