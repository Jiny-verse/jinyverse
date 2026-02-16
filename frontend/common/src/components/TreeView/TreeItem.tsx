'use client';

import React from 'react';
import { TreeNode } from './types';

interface TreeItemProps {
  node: TreeNode;
  level?: number;
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
  onToggle?: (node: TreeNode) => void;
  renderItem?: (node: TreeNode) => React.ReactNode;
}

export function TreeItem({ 
  node, 
  level = 0,
  selectedId,
  onSelect,
  onToggle,
  renderItem,
}: TreeItemProps) {
  const isExpanded = node.isExpanded ?? false;
  const isSelected = selectedId === node.id;

  const handleClick = () => {
    if (node.children && node.children.length > 0) {
      onToggle?.(node);
    }
    onSelect?.(node);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer ${
          isSelected ? 'bg-blue-100 dark:bg-blue-900' : ''
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.children && node.children.length > 0 && (
          <span className="text-xs">{isExpanded ? '▼' : '▶'}</span>
        )}
        {renderItem ? renderItem(node) : (
          <>
            {node.icon}
            <span>{node.label}</span>
          </>
        )}
      </div>
      {isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
              renderItem={renderItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
