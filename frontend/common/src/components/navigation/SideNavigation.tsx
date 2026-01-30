'use client';

import { getNavigationItemsByChannel } from '../../data/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  channel?: 'external' | 'internal';
}

export function Navigation({ channel = 'internal' }: Props) {
  const items = getNavigationItemsByChannel(channel);
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-10 h-screen w-64 shrink-0 overflow-y-auto border-r border-[#333] bg-[#181818]">
      <div className="h-screen overflow-y-auto">
        {/* 로고/헤더 */}
        <div className="border-b border-[#333] p-6">
          <h2 className="m-0 text-xl font-bold text-white">Jinyverse</h2>
          <p className="m-0 mt-1 text-sm text-gray-500">Admin Panel</p>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className="p-4">
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`block rounded px-4 py-3 text-sm no-underline transition-all duration-150 ${
                      isActive
                        ? 'font-medium text-white bg-[#333]'
                        : 'font-normal text-[#b3b3b3] hover:bg-[#2a2a2a] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
