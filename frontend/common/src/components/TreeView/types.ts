export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  icon?: React.ReactNode;
  isExpanded?: boolean;
}

export interface TreeViewProps {
  data: TreeNode[];
  onSelect?: (node: TreeNode) => void;
  onExpand?: (node: TreeNode) => void;
  onCollapse?: (node: TreeNode) => void;
  selectedId?: string;
  renderItem?: (node: TreeNode) => React.ReactNode;
  onNodeClick?: (node: TreeNode) => void;
  className?: string;
}
