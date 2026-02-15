'use client';

import { useCallback, useEffect, useState } from 'react';
import { getUsersForAdmin, updateUser } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import type { User, PageResponse } from 'common/types';
import { UsersTable, UserDetailPanel } from './_components';

const EMPTY_PAGE: PageResponse<User> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
};

function UsersContent() {
  const options = useApiOptions();
  const [data, setData] = useState<PageResponse<User>>(EMPTY_PAGE);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [isActive, setIsActive] = useState('');
  const [isLocked, setIsLocked] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = useCallback(() => {
    setLoading(true);
    const params: Parameters<typeof getUsersForAdmin>[1] = { page, size };
    if (keyword) params.keyword = keyword;
    if (isActive !== '') params.isActive = isActive === 'true';
    if (isLocked !== '') params.isLocked = isLocked === 'true';
    getUsersForAdmin(options, params)
      .then(setData)
      .catch(() => setData(EMPTY_PAGE))
      .finally(() => setLoading(false));
  }, [options.baseUrl, options.channel, page, size, keyword, isActive, isLocked]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleKeywordChange = (v: string) => {
    setKeyword(v);
    setPage(0);
  };

  const handleActiveChange = (v: string) => {
    setIsActive(v);
    setPage(0);
  };

  const handleLockedChange = (v: string) => {
    setIsLocked(v);
    setPage(0);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser((prev) => (prev?.id === user.id ? null : user));
  };

  const handleUserUpdated = (updated: User) => {
    setData((prev) => ({
      ...prev,
      content: prev.content.map((u) => (u.id === updated.id ? updated : u)),
    }));
    setSelectedUser(updated);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">유저 관리</h1>
      <div
        className="grid gap-6 transition-[grid-template-columns] duration-300 ease-out"
        style={{ gridTemplateColumns: selectedUser ? '1fr 1fr' : '1fr 0fr' }}
      >
        <div className="min-h-[420px] min-w-0 flex flex-col">
          {loading && (
            <p className="text-sm text-gray-400 mb-2">불러오는 중...</p>
          )}
          <UsersTable
            apiOptions={options}
            data={data}
            page={page}
            size={size}
            keyword={keyword}
            isActive={isActive}
            isLocked={isLocked}
            selectedUserId={selectedUser?.id ?? null}
            onKeywordChange={handleKeywordChange}
            onActiveChange={handleActiveChange}
            onLockedChange={handleLockedChange}
            onPageChange={setPage}
            onSizeChange={(s) => { setSize(s); setPage(0); }}
            onSelectUser={handleSelectUser}
          />
        </div>
        <div className="min-h-[420px] min-w-0 overflow-hidden">
          {selectedUser && (
            <UserDetailPanel
              user={selectedUser}
              apiOptions={options}
              onClose={() => setSelectedUser(null)}
              onUpdated={handleUserUpdated}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return <UsersContent />;
}
