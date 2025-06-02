"use client";

import { useState, ReactNode, useEffect } from "react";

export interface TreeNodeType<T = any> {
  id: string;
  label: string;
  icon?: ReactNode;
  data?: T;
  children?: TreeNodeType<T>[];
}

interface TreeProps<T> {
  nodes: TreeNodeType<T>[];
  onSelect?: (node: TreeNodeType<T>) => void;
  depth?: number;
  checkedIds?: Set<string>;
  onCheckChange?: (checkedIds: Set<string>) => void;
}

export function Tree<T>({ 
  nodes, 
  onSelect, 
  depth = 0,
  checkedIds = new Set<string>(),
  onCheckChange 
}: TreeProps<T>) {
  return (
    <ul className="list-none">
      {nodes.map((node) => (
        <TreeNode<T>
          key={node.id}
          {...node}
          depth={depth}
          onSelect={onSelect}
          checkedIds={checkedIds}
          onCheckChange={onCheckChange}
        />
      ))}
    </ul>
  );
}

interface TreeNodeProps<T> extends TreeNodeType<T> {
  depth: number;
  onSelect?: (node: TreeNodeType<T>) => void;
  checkedIds: Set<string>;
  onCheckChange?: (checkedIds: Set<string>) => void;
}

export function TreeNode<T>({
  id,
  label,
  icon,
  data,
  children,
  depth,
  onSelect,
  checkedIds,
  onCheckChange,
}: TreeNodeProps<T>) {
  const [open, setOpen] = useState(true);
  
  // Check if this node is checked
  const isChecked = checkedIds.has(id);
  
  // Calculate if we're in indeterminate state (some children checked, but not all)
  const childIds = getAllChildIds({ id, label, icon, data, children });
  const someChildrenChecked = childIds.some(childId => checkedIds.has(childId));
  const allChildrenChecked = children && children.length > 0 ? 
    childIds.every(childId => checkedIds.has(childId)) : false;
  
  const isIndeterminate = (children && children.length > 0 && someChildrenChecked && !allChildrenChecked) || false;

  const handleClick = () => {
    if (onSelect) onSelect({ id, label, icon, data, children });
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(!open);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (!onCheckChange) return;
    
    const newCheckedIds = new Set(checkedIds);
    
    if (e.target.checked) {
      // Check this node and all children
      newCheckedIds.add(id);
      childIds.forEach(childId => newCheckedIds.add(childId));
    } else {
      // Uncheck this node and all children
      newCheckedIds.delete(id);
      childIds.forEach(childId => newCheckedIds.delete(childId));
    }
    
    onCheckChange(newCheckedIds);
  };

  // Update checkbox when parent state changes
  useEffect(() => {
    const checkbox = document.getElementById(`checkbox-${id}`) as HTMLInputElement;
    if (checkbox) {
      checkbox.indeterminate = isIndeterminate;
    }
  }, [id, isIndeterminate]);

  return (
    <li>
      <div
        className="flex items-center cursor-pointer hover:text-blue-600 py-1"
        style={{ paddingLeft: depth * 20 }}
        onClick={handleClick}
      >
        <input
          id={`checkbox-${id}`}
          type="checkbox"
          className="mr-2"
          checked={isChecked}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
        />
        
        {children && (
          <span className="mr-1 cursor-pointer" onClick={toggleExpand}>
            {open ? "▼" : "▶"}
          </span>
        )}
        
        {icon && <span className="mr-1">{icon}</span>}
        <span>{label}</span>
      </div>

      {children && open && (
        <ul className="list-none">
          {children.map((child) => (
            <TreeNode<T>
              key={child.id}
              {...child}
              depth={depth + 1}
              onSelect={onSelect}
              checkedIds={checkedIds}
              onCheckChange={onCheckChange}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// Helper function to get all child IDs recursively
function getAllChildIds<T>(node: TreeNodeType<T>): string[] {
  if (!node.children || node.children.length === 0) {
    return [];
  }
  
  return node.children.flatMap(child => [
    child.id,
    ...getAllChildIds(child)
  ]);
}