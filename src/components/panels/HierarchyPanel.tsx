import { Button, Input } from "@heroui/react";
import { useState } from "react";

type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

const sampleData: TreeNode[] = [
  {
    id: "1",
    name: "Root",
    children: [
      { id: "2", name: "Child 1" },
      {
        id: "3",
        name: "Child 2",
        children: [
          { id: "4", name: "Grandchild 1" },
          { id: "5", name: "Grandchild 2" },
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

function insertNode(nodes: TreeNode[], parentId: string, node: TreeNode): TreeNode[] {
  return nodes.map((n) => {
    if (n.id === parentId) {
      return {
        ...n,
        children: n.children ? [...n.children, node] : [node],
      };
    }
    if (n.children) {
      return { ...n, children: insertNode(n.children, parentId, node) };
    }
    return n;
  });
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
    <ul className="pl-4">
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
        className={`flex items-center select-none ${interactive ? "cursor-pointer" : "cursor-default"}`}
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
            <Chevron type="down" />
          ) : (
            <Chevron type="right" />
          )
        ) : (
          <span className="w-5 inline-block" />
        )}
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
    const [draggedNode, newTree] = findAndRemoveNode([...tree], draggedId);
    if (!draggedNode) return;
    const updatedTree = insertNode(newTree, targetId, draggedNode);
    setTree(updatedTree);
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
        <Button isIconOnly variant="light" size="sm" aria-label="Dock to Bottom">
          <span className="material-symbols-outlined text-md!">add</span>
        </Button>
        <Input
          type="search"
          variant="bordered"
          size="sm"
          maxLength={120}
          placeholder="Search..."
          startContent={
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              search
            </span>
          }
          className="w-80 m-1"
        />
      </div>

      <Tree nodes={filteredTree} onMove={handleMove} />
    </div>
  );
}

function Chevron({ type }: { type: "right" | "down" }) {
  return (
    <span className="material-symbols-outlined">
      {type === "right" ? "keyboard_arrow_right" : "keyboard_arrow_down"}
    </span>
  );
}
