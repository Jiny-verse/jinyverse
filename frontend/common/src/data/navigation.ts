import { NavigationData, NavigationItem, Channel } from '../types/navigation';

/**
 * 네비게이션 목업 데이터
 * 추후 DB에서 관리할 예정
 */
export const mockNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: '홈',
    href: '/',
    icon: 'home',
  },
  {
    id: 'about',
    label: '소개',
    href: '/about',
    icon: 'info',
  },
  {
    id: 'products',
    label: '제품',
    href: '/products',
    icon: 'package',
  },
  {
    id: 'pricing',
    label: '요금',
    href: '/pricing',
    icon: 'dollar',
  },
  {
    id: 'contact',
    label: '문의',
    href: '/contact',
    icon: 'mail',
  },
  {
    id: 'dashboard',
    label: '대시보드',
    href: '/dashboard',
    icon: 'dashboard',
  },
  {
    id: 'users',
    label: '사용자 관리',
    href: '/users',
    icon: 'users',
  },
  {
    id: 'content',
    label: '콘텐츠 관리',
    href: '/content',
    icon: 'folder',
  },
  {
    id: 'analytics',
    label: '분석',
    href: '/analytics',
    icon: 'chart',
  },
  {
    id: 'settings',
    label: '설정',
    href: '/settings',
    icon: 'settings',
  },
];

/**
 * 채널별 표시 설정
 * 각 아이템이 어떤 채널에 표시될지 정의
 */
export const mockChannelConfig = [
  { itemId: 'home', channels: ['both'] as Channel[] },
  { itemId: 'about', channels: ['external'] as Channel[] },
  { itemId: 'products', channels: ['external'] as Channel[] },
  { itemId: 'pricing', channels: ['external'] as Channel[] },
  { itemId: 'contact', channels: ['external'] as Channel[] },
  { itemId: 'dashboard', channels: ['internal'] as Channel[] },
  { itemId: 'users', channels: ['internal'] as Channel[] },
  { itemId: 'content', channels: ['internal'] as Channel[] },
  { itemId: 'analytics', channels: ['internal'] as Channel[] },
  { itemId: 'settings', channels: ['internal'] as Channel[] },
];

/**
 * 채널에 따라 필터링된 네비게이션 아이템 반환
 */
export function getNavigationItemsByChannel(
  channel: 'external' | 'internal'
): NavigationItem[] {
  return mockNavigationItems.filter((item) => {
    const config = mockChannelConfig.find((c) => c.itemId === item.id);
    if (!config) return false;

    return (
      config.channels.includes(channel) || config.channels.includes('both')
    );
  });
}

/**
 * 전체 네비게이션 데이터
 */
export const mockNavigationData: NavigationData = {
  items: mockNavigationItems,
  channelConfig: mockChannelConfig,
};
