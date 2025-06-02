export {};

declare global {
  interface Window {
    expandAllNodes?: () => void;
    expandTenantsOnly?: () => void;
    treeExpandNodes?: (nodes: Set<string>) => void;
    originalTreeItems?: any[];
    treeSavePreviousState?: () => void;
    treeRestorePreviousState?: () => void;

    // 👇 여기에 추가
    treeForceUpdate?: () => void;
    treeSetSelectedNodeId?: (nodeId: string | undefined) => void;
  }
}
