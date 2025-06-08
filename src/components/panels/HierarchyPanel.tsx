import { Button, Input } from "@heroui/react";
import { useState } from "react";
import { Icon } from "../utils/Icon";
import { InputButtonIcon } from "../utils/Input/ButtonIcon";
import { InputSearch } from "../utils/Input/Search";

type TreeNode = {
  id: string;
  name: string;
  type: "GameObject" | "GameObjectGroup";
  children?: TreeNode[];
};

const sampleData: TreeNode[] = [
  {
    id: "1",
    name: "Root Group",
    type: "GameObjectGroup",
    children: [
      { id: "2", name: "Child 1", type: "GameObject" },
      {
        id: "3",
        name: "Child Group",
        type: "GameObjectGroup",
        children: [
          { id: "4", name: "Grandchild 1", type: "GameObject" },
          { id: "5", name: "Grandchild 2", type: "GameObject" },
        ],
      },
    ],
  },
];

function findAndRemoveNode(nodes: TreeNode[], nodeId: string): [TreeNode | null, TreeNode[]] {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === nodeId) {
      const node = nodes[i];
      const newNodes = [...nodes.slice(0, i), ...nodes.slice(i + 1)];
      return [node, newNodes];
    }
    if (nodes[i].children) {
      const [found, newChildren] = findAndRemoveNode(nodes[i].children || [], nodeId);
      if (found) {
        nodes[i].children = newChildren;
        return [found, nodes];
      }
    }
  }
  return [null, nodes];
}

function Tree({
  nodes,
  onMove,
  interactive = true,
}: {
  nodes: TreeNode[];
  onMove: (draggedId: string, targetId: string) => void;
  interactive?: boolean;
}) {
  return (
    <ul className="ml-4">
      {nodes.map((node) => (
        <TreeNodeComponent key={node.id} node={node} onMove={onMove} interactive={interactive} />
      ))}
    </ul>
  );
}

function TreeNodeComponent({
  node,
  onMove,
  interactive = true,
}: {
  node: TreeNode;
  onMove: (draggedId: string, targetId: string) => void;
  interactive?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const handleDragStart = (e: React.DragEvent) => {
    if (!interactive) return;
    e.dataTransfer.setData("text/plain", node.id);
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!interactive) return;
    e.preventDefault();
    const draggedId = e.dataTransfer.getData("text/plain");
    if (draggedId && draggedId !== node.id) {
      onMove(draggedId, node.id);
    }
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!interactive) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <li
      draggable={interactive}
      onDragStart={handleDragStart}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <div
        className={`py-0.5 flex items-center select-none ${interactive ? "cursor-pointer" : "cursor-default"}`}
        tabIndex={interactive ? 0 : -1}
        onClick={() => interactive && hasChildren && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (interactive && (e.key === "Enter" || e.key === " ") && hasChildren)
            setOpen((o) => !o);
        }}
        aria-expanded={open}
      >
        {hasChildren ? (
          open ? (
            <Icon type="outlined" symbol="chevron_down" className="ml-2 mr-1 text-tree!" />
          ) : (
            <Icon type="outlined" symbol="chevron_right" className="ml-2 mr-1 text-tree!" />
          )
        ) : (
          <span className="w-2 inline-block" />
        )}
        <span className="mr-1">
          {node.type === "GameObjectGroup" ? (
            <Icon type="outlined" symbol="game_obejct_group" className="mr-1 text-tree!" />
          ) : (
            <Icon type="outlined" symbol="game_obejct" className="mr-1 text-tree!" />
          )}
        </span>
        <span>{node.name}</span>
      </div>
      {hasChildren && open && node.children && (
        <Tree nodes={node.children} onMove={onMove} interactive={interactive} />
      )}
    </li>
  );
}

export default function HierarchyPanel() {
  const [tree, setTree] = useState<TreeNode[]>(sampleData);

  const handleMove = (draggedId: string, targetId: string) => {
    if (draggedId === targetId) return;
    const [draggedNode, treeWithoutDragged] = findAndRemoveNode([...tree], draggedId);
    if (!draggedNode) return;

    const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNode(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    const findParent = (nodes: TreeNode[], childId: string): TreeNode | null => {
      for (const node of nodes) {
        if (node.children?.some((c) => c.id === childId)) return node;
        if (node.children) {
          const found = findParent(node.children, childId);
          if (found) return found;
        }
      }
      return null;
    };

    // Helper to recursively remove empty folders
    const removeEmptyFolders = (nodes: TreeNode[]): TreeNode[] => {
      return nodes
        .filter(
          (node) => node.type !== "GameObjectGroup" || (node.children && node.children.length > 0),
        )
        .map((node) =>
          node.children ? { ...node, children: removeEmptyFolders(node.children) } : node,
        );
    };

    const targetNode = findNode(treeWithoutDragged, targetId);
    if (!targetNode) return;

    // GameObject -> GameObject: create new group with both
    if (draggedNode.type === "GameObject" && targetNode.type === "GameObject") {
      const parent = findParent(treeWithoutDragged, targetId);
      if (!parent || !parent.children) return;

      // Remove both nodes from parent
      parent.children = parent.children.filter((c) => c.id !== targetId && c.id !== draggedId);

      // Create new group with both nodes
      const newGroup: TreeNode = {
        id: `group-${Date.now()}`,
        name: "Folder",
        type: "GameObjectGroup",
        children: [targetNode, draggedNode],
      };

      parent.children.push(newGroup);
      setTree(removeEmptyFolders([...treeWithoutDragged]));
      return;
    }

    // GameObjectGroup -> GameObjectGroup: put inside
    if (draggedNode.type === "GameObjectGroup" && targetNode.type === "GameObjectGroup") {
      targetNode.children = [...(targetNode.children || []), draggedNode];
      setTree(removeEmptyFolders([...treeWithoutDragged]));
      return;
    }

    // GameObjectGroup -> GameObject: create new group with both
    if (draggedNode.type === "GameObjectGroup" && targetNode.type === "GameObject") {
      const parent = findParent(treeWithoutDragged, targetId);
      if (!parent || !parent.children) return;

      // Remove targetNode from parent
      parent.children = parent.children.filter((c) => c.id !== targetId);

      // Create new group
      const newGroup: TreeNode = {
        id: `group-${Date.now()}`,
        name: "Folder",
        type: "GameObjectGroup",
        children: [targetNode, draggedNode],
      };
      parent.children.push(newGroup);
      setTree(removeEmptyFolders([...treeWithoutDragged]));
      return;
    }

    // GameObject -> GameObjectGroup: put inside group
    if (draggedNode.type === "GameObject" && targetNode.type === "GameObjectGroup") {
      targetNode.children = [...(targetNode.children || []), draggedNode];
      setTree(removeEmptyFolders([...treeWithoutDragged]));
      return;
    }
  };

  function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
    if (!query) return nodes;
    const lower = query.toLowerCase();
    return nodes
      .map((node) => {
        if (node.name.toLowerCase().includes(lower)) return node;
        if (node.children) {
          const filtered = filterTree(node.children, query);
          if (filtered.length) return { ...node, children: filtered };
        }
        return null;
      })
      .filter(Boolean) as TreeNode[];
  }

  const filteredTree = filterTree(tree, "");

  return (
    <div className="h-full p-0">
      <div
        className="bg-content2 pl-2"
        style={{
          borderBottom: "1px solid #444",
          fontWeight: "bold",
          fontSize: "15px",
          letterSpacing: "0.5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <InputButtonIcon symbol="add" aria_label="Add new file" />
        <InputSearch />
      </div>

      <div className="pt-2">
        <Tree nodes={filteredTree} onMove={handleMove} />
      </div>
    </div>
  );
}
