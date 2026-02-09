
import { buildMenuTree, menuTreeToSelectOptions } from './data/menuTree';
import type { Menu } from './schemas/menu';

// Mock user data
// 343b3cac-4762-4fee-b471-026d625d696b	board	게시판 관리		true	true	0	2026-02-09 14:51:08.812	2026-02-09 14:51:08.812		menu_channel	INTERNAL	/boards
// 24bd68ad-94b5-4705-a589-ab76f33d797f	system	시스템 설정		true	true	99	2026-02-09 15:02:14.089	2026-02-09 15:02:14.089		menu_channel	INTERNAL
// bc4e64f2-0e7b-4c4c-a678-4f076a4c7ea5	menu	메뉴 관리		true	true	100	2026-02-09 15:04:36.210	2026-02-09 15:04:36.210		menu_channel	INTERNAL	/menus

const mockMenus: Menu[] = [
  {
    id: '343b3cac-4762-4fee-b471-026d625d696b',
    code: 'board',
    name: '게시판 관리',
    isActive: true,
    isAdmin: true,
    order: 0,
    upperId: null,
    channel: 'INTERNAL',
    path: '/boards',
    createdAt: '2026-02-09T14:51:08.812',
    updatedAt: '2026-02-09T14:51:08.812',
    description: null,
    channelCategoryCode: 'menu_channel',
    deletedAt: null,
  },
  {
    id: '24bd68ad-94b5-4705-a589-ab76f33d797f',
    code: 'system',
    name: '시스템 설정',
    isActive: true, // Assuming true
    isAdmin: true,  // Assuming true
    order: 99,
    upperId: null,
    channel: 'INTERNAL',
    path: null,
    createdAt: '2026-02-09T15:02:14.089',
    updatedAt: '2026-02-09T15:02:14.089',
    description: null,
    channelCategoryCode: 'menu_channel',
    deletedAt: null,
  },
  {
    id: 'bc4e64f2-0e7b-4c4c-a678-4f076a4c7ea5',
    code: 'menu',
    name: '메뉴 관리',
    isActive: true,
    isAdmin: true,
    order: 100,
    upperId: null,
    channel: 'INTERNAL',
    path: '/menus',
    createdAt: '2026-02-09T15:04:36.210',
    updatedAt: '2026-02-09T15:04:36.210',
    description: null,
    channelCategoryCode: 'menu_channel',
    deletedAt: null,
  },
];

const tree = buildMenuTree(mockMenus);
console.log('Tree roots:', tree.map(n => n.name));

const options = menuTreeToSelectOptions(tree);
console.log('Options:', options);

// Emulate filtering in UpdateDialog for "Menu Management"
const menuId = 'bc4e64f2-0e7b-4c4c-a678-4f076a4c7ea5'; // Menu Management
const upperOptions = options.filter((opt) => opt.value === '' || opt.value !== menuId);
console.log('Upper options for Menu Management:', upperOptions);

const hasSystem = upperOptions.some(o => o.value === '24bd68ad-94b5-4705-a589-ab76f33d797f');
console.log('Has System Settings?', hasSystem);
