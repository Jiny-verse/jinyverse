'use client';

import React, { useState, useEffect } from 'react';
import { TreeNode, TreeViewProps } from './types';
import { TreeItem } from './TreeItem';

export function TreeView({
  data,
  onSelect,
  onExpand,
  onCollapse,
  selectedId,
  className,
  renderItem,
}: TreeViewProps) {
  // Local state to manage expansion if not controlled externally (though usually data drives it)
  // For simplicity, we assume 'data' is the source of truth for expansion state, 
  // or we can maintain a set of expanded IDs.
  // Let's maintain a set of expanded IDs for internal state management if data doesn't have isExpanded.
  // BUT the requirement says "folder/package file tree", so let's allow `data` to control it primarily,
  // but we might need a way to toggle.
  // Actually, modifying the 'data' prop directly is bad. 
  // Let's use an internal state for expanded node IDs.
  
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Initialize expanded state from data if provided
  useEffect(() => {
    const initialExpanded = new Set<string>();
    const traverse = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.isExpanded) initialExpanded.add(node.id);
        if (node.children) traverse(node.children);
      });
    };
    traverse(data);
    setExpandedIds(initialExpanded);
  }, [data]); // Re-run if data structure changes entirely, careful with dependency

  const handleToggle = (node: TreeNode) => {
    const newExpandedIds = new Set(expandedIds);
    if (newExpandedIds.has(node.id)) {
      newExpandedIds.delete(node.id);
      onCollapse?.(node);
    } else {
      newExpandedIds.add(node.id);
      onExpand?.(node);
    }
    setExpandedIds(newExpandedIds);
  };

  // Helper to merge internal expansion state with data
  const mergeExpansionState = (nodes: TreeNode[]): TreeNode[] => {
    return nodes.map(node => ({
      ...node,
      isExpanded: expandedIds.has(node.id),
      children: node.children ? mergeExpansionState(node.children) : undefined
    }));
  };

  const displayData = mergeExpansionState(data);

  return (
    <div className={className}>
      {displayData.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          onToggle={handleToggle}
          renderItem={renderItem}
        />
      ))}
    </div>
  );
}
