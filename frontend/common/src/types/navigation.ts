/**
 * 네비게이션 아이템 타입
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

/**
 * 채널 타입
 * external, internal, 또는 둘 다에 표시할 수 있음
 */
export type Channel = 'external' | 'internal' | 'both';

/**
 * 네비게이션 채널 설정
 */
export interface NavigationChannel {
  itemId: string;
  channels: Channel[];
}

/**
 * 네비게이션 데이터 구조
 */
export interface NavigationData {
  items: NavigationItem[];
  channelConfig: NavigationChannel[];
}
