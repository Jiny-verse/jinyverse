'use client';

import { useEffect, useState } from 'react';
import { getCodes } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { Table } from './_components/Table';
import { CreateDialog } from './_components/CreateDialog';
import { UpdateDialog } from './_components/UpdateDialog';
import { BoardProvider, useBoardContext } from './_hooks/useBoardContext';

const BOARD_TYPE_CATEGORY = 'board_type';

function BoardsContent() {
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const options = useApiOptions();

  useEffect(() => {
    getCodes(options, { categoryCode: BOARD_TYPE_CATEGORY })
      .then((codes) => setTypeOptions(codes.map((c) => ({ value: c.code, label: c.name }))))
      .catch(() => setTypeOptions([]));
  }, [options.baseUrl, options.channel]);

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">게시판 관리</h1>
      <Table apiOptions={options} />
      <CreateDialog typeOptions={typeOptions} />
      <UpdateDialog typeOptions={typeOptions} />
    </div>
  );
}

export default function BoardsPage() {
  const options = useApiOptions();
  return (
    <BoardProvider apiOptions={options}>
      <BoardsContent />
    </BoardProvider>
  );
}
