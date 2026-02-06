'use client';

import { useEffect, useState } from 'react';
import { getCodes } from 'common/services';
import { useApiOptions } from '@/app/providers/ApiProvider';
import { Table } from './_components/Table';
import { Panel } from './_components/Panel';
import { CreateDialog } from './_components/CreateDialog';
import { UpdateDialog } from './_components/UpdateDialog';
import { BoardProvider, useBoardContext } from './_hooks/useBoardContext';

const BOARD_TYPE_CATEGORY = 'BOARD_TYPE';

function BoardsContent() {
  const domain = useBoardContext();
  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const options = useApiOptions();

  useEffect(() => {
    getCodes(options, { categoryCode: BOARD_TYPE_CATEGORY })
      .then((codes) => setTypeOptions(codes.map((c) => ({ value: c.code, label: c.name }))))
      .catch(() => setTypeOptions([]));
  }, [options.baseUrl, options.channel]);

  const hasSidePanel = domain.preview.selectedId != null;

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6">게시판 관리</h1>
      <div className={hasSidePanel ? 'flex gap-0 h-[calc(100vh-10rem)] min-h-[400px]' : ''}>
        <div className={hasSidePanel ? 'w-1/2 min-w-0 pr-4 flex flex-col' : ''}>
          <Table apiOptions={options} />
        </div>
        <Panel apiOptions={options} />
      </div>
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
