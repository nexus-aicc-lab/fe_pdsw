"use client";

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type BlendKind = 1 | 2 | 3 | null; // 1: inbound, 2: outbound, 3: blend
export type SortType = 'name' | 'id';
export type SortDirection = 'asc' | 'desc';
export type NodeType = 'tenant' | 'group' | 'team' | 'counselor' | 'all' | 'organization';

export interface SortOption {
  type: SortType;
  direction: SortDirection;
  nodeType: NodeType;
}

interface CounselorFilterState {
  selectedBlendKind: BlendKind;
  selectedCounselor: {
    counselorId: string | null;
    counselorName: string | null;
    tenantId: string | null;
  };
  candidateMembersForSkilAssign: any[];
  sortOption: SortOption;
  currentExpansionLevel: number;
  
  setSelectedBlendKind: (blendKind: BlendKind) => void;
  setSelectedCounselor: (counselorId: string, counselorName: string, tenantId: string) => void;
  setCandidateMembersForSkilAssign: (members: any[]) => void;
  resetFilter: () => void;
  getState: () => any;
  setSortOption: (option: SortOption) => void;
  
  // 레벨별 확장 기능
  expandToLevel: (level: number) => void;
  expandAll: () => void;
  collapseAll: () => void;
  applyDefaultExpansion: () => void;
}

export const useCounselorFilterStore = create<CounselorFilterState>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      selectedBlendKind: null,
      selectedCounselor: {
        counselorId: null,
        counselorName: null,
        tenantId: null,
      },
      candidateMembersForSkilAssign: [],
      sortOption: { 
        type: 'id',  // QA요청 기본 정렬 기준 name --> id 로 변경 0522
        direction: 'asc',
        nodeType: 'all'
      },
      currentExpansionLevel: 0,

      // 기존 액션
      setSelectedBlendKind: (blendKind) => {
        set(
          { selectedBlendKind: blendKind },
          false,
          'counselorFilter/setSelectedBlendKind'
        );
      },

      setSelectedCounselor: (counselorId, counselorName, tenantId) => {
        set(
          { 
            selectedCounselor: { 
              counselorId, 
              counselorName, 
              tenantId 
            } 
          },
          false,
          'counselorFilter/setSelectedCounselor'
        );
      },

      setCandidateMembersForSkilAssign: (members) => {
        set(
          { candidateMembersForSkilAssign: members },
          false,
          'counselorFilter/setCandidateMembersForSkilAssign'
        );
      },

      resetFilter: () => {
        set(
          {
            selectedBlendKind: null,
            selectedCounselor: { 
              counselorId: null, 
              counselorName: null, 
              tenantId: null 
            },
            candidateMembersForSkilAssign: [],
            sortOption: { 
              type: 'name', 
              direction: 'asc',
              nodeType: 'all'
            },
            currentExpansionLevel: 0,
          },
          false,
          'counselorFilter/resetFilter'
        );
      },

      getState: () => {
        return {
          selectedBlendKind: get().selectedBlendKind,
          selectedCounselor: get().selectedCounselor,
          candidateMembersForSkilAssign: get().candidateMembersForSkilAssign,
          sortOption: get().sortOption,
          currentExpansionLevel: get().currentExpansionLevel,
        };
      },

      setSortOption: (option) => {
        // 노드 타입이 변경되면 해당 레벨까지 확장
        const { nodeType } = option;
        const currentNodeType = get().sortOption.nodeType;
        
        if (nodeType !== currentNodeType) {
          // 노드 타입에 따라 적절한 레벨로 확장
          switch (nodeType) {
            case 'tenant':
              get().expandToLevel(2);
              break;
            case 'group':
              get().expandToLevel(3);
              break;
            case 'team':
              get().expandToLevel(4);
              break;
            case 'counselor':
              get().expandToLevel(5);
              break;
            case 'all':
              get().expandToLevel(5);
              break;
            case 'organization':
              get().expandToLevel(1);
              break;
          }
        }
        
        set({ sortOption: option }, false, 'counselorFilter/setSortOption');
        console.log(`Sort option updated - Type: ${option.type}, Direction: ${option.direction}, NodeType: ${option.nodeType}`);
      },

      // 확장 관련 액션
      expandToLevel: (level) => {
        set(
          { currentExpansionLevel: level },
          false,
          'counselorFilter/expandToLevel'
        );
        // console.log(`Expansion level set to: ${level}`);
      },

      expandAll: () => {
        set(
          { currentExpansionLevel: 5 }, // 전체 레벨 5로 가정
          false,
          'counselorFilter/expandAll'
        );
        console.log('Expanded all nodes (level 5)');
      },

      collapseAll: () => {
        set(
          { currentExpansionLevel: 1 }, // 1은 최상위 노드만 표시
          false,
          'counselorFilter/collapseAll'
        );
        console.log('Collapsed all nodes (level 1)');
      },

      applyDefaultExpansion: () => {
        set(
          { currentExpansionLevel: 4 }, // 팀 레벨까지 기본 확장
          false,
          'counselorFilter/applyDefaultExpansion'
        );
        console.log('Applied default expansion (level 4)');
      }
    }),
    {
      name: 'Counselor Filter Store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);