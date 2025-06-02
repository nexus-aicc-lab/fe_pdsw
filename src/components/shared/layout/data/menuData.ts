// src\components\shared\layout\data\menuData.ts
import { TabData } from "@/features/campaignManager/types/typeForSidebar2";

export const tabsData: TabData[] = [
  {
    id: 'campaign',
    label: '캠페인',
    items: [
      {
        id: 'nexus',
        label: 'NEXUS',
        type: 'folder',
        children: [
          {
            id: 'none',
            label: 'NONE',
            type: 'folder'
          },
          {
            id: 'nexus-dev',
            label: 'NEXUS_DEV',
            type: 'folder',
            children: [
              { id: 'campaign1', label: '100번캠페인1', type: 'campaign', status: 'pending', direction: 'inbound' },
              { id: 'campaign2', label: '101번캠페인2', type: 'campaign', status: 'pending', direction: 'outbound' },
              { id: 'campaign3', label: '102번캠페인3', type: 'campaign', status: 'stopped', direction: 'inbound' },
              { id: 'campaign4', label: '103번캠페인4', type: 'campaign', status: 'started', direction: 'outbound' },
              { id: 'cp1000', label: 'CP1000', type: 'campaign', status: 'pending', direction: 'inbound' },
              { id: '1111', label: '1111', type: 'campaign', status: 'stopped', direction: 'outbound' },
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'agent',
    label: '상담사',
    items: [
      {
        id: 'agent-list',
        label: '상담사 목록',
        type: 'folder',
        children: [
          { id: 'agent1', label: '상담사1', type: 'campaign', status: 'started', direction: 'inbound' },
          { id: 'agent2', label: '상담사2', type: 'campaign', status: 'pending', direction: 'outbound' },
          { 
            id: 'department1',
            label: '영업부',
            type: 'folder',
            children: [
              { id: 'agent3', label: '상담사3', type: 'campaign', status: 'started', direction: 'inbound' },
              { id: 'agent4', label: '상담사4', type: 'campaign', status: 'stopped', direction: 'outbound' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'campaign-group',
    label: '캠페인인 그룹',
    items: [
      {
        id: 'group-list',
        label: '그룹 목록',
        type: 'folder',
        children: [
          { 
            id: 'group1',
            label: '영업팀',
            type: 'folder',
            children: [
              { id: 'subgroup1', label: '1팀', type: 'campaign', status: 'started', direction: 'inbound' },
              { id: 'subgroup2', label: '2팀', type: 'campaign', status: 'pending', direction: 'outbound' }
            ]
          },
          { 
            id: 'group2',
            label: '고객지원팀',
            type: 'folder',
            children: [
              { id: 'subgroup3', label: 'A팀', type: 'campaign', status: 'started', direction: 'inbound' },
              { id: 'subgroup4', label: 'B팀', type: 'campaign', status: 'stopped', direction: 'outbound' }
            ]
          }
        ]
      }
    ]
  }
];

export const agentTab: TabData = {
  id: 'agent',
  label: '상담사',
  items: [
    {
      id: 'agent-list',
      label: '상담사 목록',
      type: 'folder',
      children: [
        { id: 'agent1', label: '상담사1', type: 'campaign', status: 'started', direction: 'inbound' },
        { id: 'agent2', label: '상담사2', type: 'campaign', status: 'pending', direction: 'outbound' }
      ]
    }
  ]
};

export const agentGroupTab: TabData = {
  id: 'campaign-group',
  label: '상담사 그룹',
  items: [
    {
      id: 'group-list',
      label: '그룹 목록',
      type: 'folder',
      children: [
        { id: 'group1', label: '그룹1', type: 'campaign', status: 'started', direction: 'inbound' },
        { id: 'group2', label: '그룹2', type: 'campaign', status: 'stopped', direction: 'outbound' }
      ]
    }
  ]
};
