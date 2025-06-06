import { Button, Input } from "@heroui/react";
import { useState } from "react";

type FileNode = {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
};

const mockFiles: FileNode[] = [
  {
    name: "Assets",
    type: "folder",
    children: [
      {
        name: "Scripts",
        type: "folder",
        children: [
          { name: "Player.ts", type: "file" },
          { name: "Enemy.ts", type: "file" },
        ],
      },
      {
        name: "Textures",
        type: "folder",
        children: [{ name: "hero.png", type: "file" }],
      },
      {
        name: "Scenes",
        type: "folder",
        children: [{ name: "MainScene.unity", type: "file" }],
      },
    ],
  },
];

function FileTree({
  files,
  selected,
  onSelect,
}: {
  files: FileNode[];
  selected: string[];
  onSelect: (path: string[]) => void;
}) {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  const renderTree = (nodes: FileNode[], path: string[] = []) =>
    nodes.map((file) => {
      const currentPath = [...path, file.name];
      const key = currentPath.join("/");
      if (file.type === "folder") {
        return (
          <li key={key} style={{ marginBottom: 2 }}>
            <span
              style={{
                cursor: "pointer",
                fontWeight: 500,
                color: "#e0e0e0",
                display: "flex",
                alignItems: "center",
                userSelect: "none",
                background: selected.join("/") === key ? "#333" : undefined,
                borderRadius: 4,
                padding: "2px 4px",
              }}
              onClick={() => {
                setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
                onSelect(currentPath);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
                  onSelect(currentPath);
                }
              }}
              aria-expanded={open[key] || false}
              role="treeitem"
            >
              <span className="mr-2" style={{ width: 18, display: "inline-block" }}>
                {open[key] ? <Chevron type="down" /> : <Chevron type="right" />}
              </span>
              <span>📁 {file.name}</span>
            </span>
            {open[key] && file.children && (
              <ul style={{ listStyle: "none", paddingLeft: 12, margin: 0 }}>
                {renderTree(file.children, currentPath)}
              </ul>
            )}
          </li>
        );
      }
      return (
        <li key={key} style={{ marginBottom: 2 }}>
          <span
            style={{
              marginLeft: 18,
              color: "#bdbdbd",
              display: "flex",
              alignItems: "center",
              background: selected.join("/") === key ? "#333" : undefined,
              borderRadius: 4,
              padding: "2px 4px",
              cursor: "pointer",
            }}
            onClick={() => onSelect(currentPath)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(currentPath);
            }}
            role="treeitem"
          >
            <span style={{ width: 18, display: "inline-block" }} />
            <span>📄 {file.name}</span>
          </span>
        </li>
      );
    });

  return <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>{renderTree(files)}</ul>;
}

function getFolderByPath(files: FileNode[], path: string[]): FileNode | undefined {
  let current: FileNode | undefined;
  let nodes = files;
  for (const name of path) {
    current = nodes.find((f) => f.name === name);
    if (!current || current.type !== "folder" || !current.children) return current;
    nodes = current.children;
  }
  return current;
}

function FilesGrid({ folder }: { folder?: FileNode }) {
  if (!folder || !folder.children) return null;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
        gap: 12,
        padding: 12,
      }}
    >
      {folder.children.map((file) => (
        <div
          key={file.name}
          style={{
            textAlign: "center",
            background: "#292929",
            borderRadius: 6,
            padding: 10,
            color: "#eee",
            fontSize: 13,
            cursor: "pointer",
            border: "1px solid #333",
          }}
        >
          <div style={{ fontSize: 24 }}>{file.type === "folder" ? "📁" : "📄"}</div>
          <div
            style={{
              marginTop: 6,
              wordBreak: "break-all",
              fontWeight: 500,
            }}
          >
            {file.name}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProjectPanel() {
  const [selected, setSelected] = useState<string[]>(["Assets"]);
  const selectedFolder = getFolderByPath(mockFiles, selected);

  return (
    <div
      style={{
        color: "#eee",
        height: "100%",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        borderRight: "1px solid #444",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="bg-content2 py-0 px-1"
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
          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
            add
          </span>
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
          className="bg-content2 w-80 m-1"
        />
      </div>
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        <div
          className="bg-content2"
          style={{
            width: 220,
            overflowY: "auto",
            borderRight: "1px solid #333",
            padding: "8px 0 8px 8px",
            minHeight: 0,
          }}
          role="tree"
        >
          <FileTree files={mockFiles} selected={selected} onSelect={setSelected} />
        </div>
        <div style={{ flex: 1, overflow: "auto" }}>
          <FilesGrid
            folder={selectedFolder && selectedFolder.type === "folder" ? selectedFolder : undefined}
          />
        </div>
      </div>
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
