// src/widgets/header/model/menuItems.ts
export interface MenuItem {
  id: number;
  menuId: number;
  title: string;
  icon: string;
  href: string;
  content?: null;
  uniqueKey?: string;
}

export const menuItems: MenuItem[] = [
  { 
    id: 1,
    menuId: 1,
    title: '캠페인 그룹 관리', 
    icon: '/header-menu/캠페인그룹관리.svg', 
    href: '/main',
    content: null
  },
  { 
    id: 2,
    menuId: 2,
    title: '캠페인 관리', 
    icon: '/header-menu/캠페인관리.svg', 
    href: '/campaign',
    content: null
  },
  { 
    id: 3,
    menuId: 3,
    title: '통합 모니터', 
    icon: '/header-menu/통합모니터.svg', 
    href: '/monitor',
    content: null
  },
  { 
    id: 4,
    menuId: 4,
    title: '총 진행 상황', 
    icon: '/header-menu/총진행상황.svg', 
    href: '/status',
    content: null
  },
  { 
    id: 5,
    menuId: 5,
    title: '발신 진행 상태', 
    icon: '/header-menu/발신진행상태.svg', 
    href: '/call',
    content: null
  },
  { 
    id: 14,
    menuId: 6,
    title: '캠페인별 상태', 
    icon: '/header-menu/캠페인별상태.svg', 
    href: '/chartCampaign',
    content: null
  },
  { 
    id: 6,
    menuId: 7,
    title: '채널 모니터', 
    icon: '/header-menu/채널모니터.svg', 
    href: '/channel',
    content: null
  },
  { 
    id: 23,
    menuId: 8,
    title: '시스템 모니터링', 
    icon: '/header-menu/시스템모니터링.svg', 
    href: '/settings',
    content: null
  },
  { 
    id: 7,
    menuId: 9,
    title: '리스트 매니저', 
    icon: '/header-menu/리스트매니저.svg', 
    href: '/list',
    content: null
  },
  { 
    id: 8,
    menuId: 10,
    title: '예약 콜 제한 설정', 
    icon: '/header-menu/예약콜제한설정.svg', 
    href: '/reserve',
    content: null
  },
  { 
    id: 9,
    menuId: 11,
    title: '분배 호수 제한 설정', 
    icon: '/header-menu/분배호수제한설정.svg', 
    href: '/distribute',
    content: null
  },
  { 
    id: 10,
    menuId: 12,
    title: '시스템 설정', 
    icon: '/header-menu/시스템설정.svg', 
    href: '/system',
    content: null
  },
  { 
    id: 11,
    menuId: 13,
    title: '운영 설정', 
    icon: '/header-menu/운영설정.svg', 
    href: '/operation',
    content: null
  },
  { 
    id: 12,
    menuId: 14,
    title: '환경 설정', 
    icon: '/header-menu/환경설정.svg', 
    href: '/settings',
    content: null
  },

  // {
  //   id: 701,
  //   menuId: 701,
  //   title: '스킬 관리',
  //   icon: '/header-menu/캠페인관리.svg',
  //   href: '/skil-admin',
  //   content: null,
  // },

];