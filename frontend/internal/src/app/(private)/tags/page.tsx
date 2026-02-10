'use client';

import { useEffect, useState } from 'react';
import { getCodes } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { Table, CreateDialog, UpdateDialog } from './_components';
import { TagProvider } from './_hooks/useTagContext';

const TAG_USAGE_CATEGORY = 'tag_usage';

function TagsContent() {
  const [usageOptions, setUsageOptions] = useState<{ value: string; label: string }[]>([]);
  const options = useApiOptions();

  useEffect(() => {
    getCodes(options, { categoryCode: TAG_USAGE_CATEGORY })
      .then((codes) => setUsageOptions(codes.map((c) => ({ value: c.code, label: c.name }))))
      .catch(() => setUsageOptions([{ value: 'topic', label: '게시글' }, { value: 'board', label: '게시판' }]));
  }, [options.baseUrl, options.channel]);

  return (
    <div className="">
      <h1 className="mb-6 text-2xl font-bold">태그 관리</h1>
      <Table apiOptions={options} />
      <CreateDialog usageOptions={usageOptions} />
      <UpdateDialog usageOptions={usageOptions} />
    </div>
  );
}

export default function TagsPage() {
  const options = useApiOptions();
  return (
    <TagProvider apiOptions={options}>
      <TagsContent />
    </TagProvider>
  );
}
