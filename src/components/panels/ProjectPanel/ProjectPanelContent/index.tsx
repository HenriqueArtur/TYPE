import { Divider } from "@heroui/react";
import { useState } from "react";
import type { FileNode } from "..";
import { Icon } from "../../../utils/Icon";

export interface PortalPanelContentProps {
  files: FileNode[];
  selected_folder: FileNode | undefined;
  selected: string[];
  onSelect: (path: string[]) => void;
}

export function ProjectPanelContent({ files, selected, onSelect }: PortalPanelContentProps) {
  const [selectedPath, setSelectedPath] = useState<string[]>(selected);

  const handleSelect = (path: string[], fileType?: string) => {
    // If a file is selected, show its parent folder in the grid
    if (fileType === "file") {
      setSelectedPath(path.slice(0, -1));
      onSelect(path.slice(0, -1));
    } else {
      setSelectedPath(path);
      onSelect(path);
    }
  };

  // Find the folder node for the selected path
  const findFolderNode = (nodes: FileNode[], path: string[]): FileNode | undefined => {
    let currentNodes = nodes;
    let node: FileNode | undefined;
    for (const part of path) {
      node = currentNodes.find((n) => n.name === part);
      if (!node) return undefined;
      if (node.type === "folder" && node.children) {
        currentNodes = node.children;
      } else if (node.type === "folder") {
        currentNodes = [];
      }
    }
    return node && node.type === "folder" ? node : undefined;
  };

  const folderToShow = findFolderNode(files, selectedPath);

  return (
    <div className="flex flex-full h-full">
      <div className="pl-2 py-2 w-[220px] overflow-y-auto overflow-x-hidden" role="tree">
        <FileTree files={files} selected={selectedPath} onSelect={handleSelect} />
      </div>
      <Divider orientation="vertical" />
      <div className="flex-1 overflow-auto min-h-0">
        <div className="bg-content3 p-2 text-xs select-none">{selectedPath.join(" / ")}</div>
        <div className="flex-1 overflow-auto min-h-0">
          <FilesGrid folder={folderToShow} />
        </div>
      </div>
    </div>
  );
}

function FileTree({
  files,
  selected,
  onSelect,
}: {
  files: FileNode[];
  selected: string[];
  onSelect: (path: string[], fileType?: string) => void;
}) {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});

  const renderTree = (nodes: FileNode[], path: string[] = []) =>
    nodes.map((file) => {
      const currentPath = [...path, file.name];
      const key = currentPath.join("/");
      if (file.type === "folder") {
        return (
          <TreeItem
            key={key}
            file={file}
            currentPath={currentPath}
            selected={selected}
            open={open[key] || false}
            onToggle={() => setOpen((prev) => ({ ...prev, [key]: !prev[key] }))}
            onSelect={(p, t) => onSelect(p, t)}
            renderChildren={
              file.children
                ? () =>
                    open[key] && (
                      <ul className="list-none pl-3 ml-0">
                        {renderTree(file.children || [], currentPath)}
                      </ul>
                    )
                : undefined
            }
          />
        );
      }
      return (
        <TreeItem
          key={key}
          file={file}
          currentPath={currentPath}
          selected={selected}
          onSelect={(p, t) => onSelect(p, t)}
        />
      );
    });

  return (
    <ul className="list-none pl-0 ml-0 overflow-y-auto overflow-x-hidden">{renderTree(files)}</ul>
  );
}

interface TreeItemProps {
  file: FileNode;
  currentPath: string[];
  selected: string[];
  open?: boolean;
  onToggle?: () => void;
  onSelect: (path: string[], fileType?: string) => void;
  renderChildren?: () => React.ReactNode;
}

function TreeItem({
  file,
  currentPath,
  selected,
  open,
  onToggle,
  onSelect,
  renderChildren,
}: TreeItemProps) {
  const key = currentPath.join("/");
  if (file.type === "folder") {
    return (
      <li className="h-full overflow-y-auto">
        <span
          className={"cursor-pointer font-medium flex items-center select-none rounded px-1"}
          onClick={() => {
            onToggle?.();
            onSelect(currentPath, "folder");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onToggle?.();
              onSelect(currentPath, "folder");
            }
          }}
          aria-expanded={open || false}
          role="treeitem"
        >
          <span className="mr-1">
            {open ? (
              <Icon type="outlined" symbol="folder_open" className="text-tree!" />
            ) : (
              <Icon type="outlined" symbol="folder" className="text-tree!" />
            )}
          </span>
          <span>{file.name}</span>
        </span>
        {renderChildren?.()}
      </li>
    );
  }
  return (
    <li className="mb-1">
      <span
        className={`cursor-pointer select-none rounded px-1 ${
          selected.join("/") === key ? "bg-zinc-800 ring-2 ring-blue-500" : ""
        }`}
        onClick={() => onSelect(currentPath, "file")}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect(currentPath, "file");
        }}
        role="treeitem"
      >
        {file.name.includes(".engine") ? (
          <Icon type="outlined" symbol="game_object" className="text-tree!" />
        ) : (
          <Icon type="outlined" symbol="document" className="text-tree!" />
        )}{" "}
        {file.name}
      </span>
    </li>
  );
}

function FilesGrid({ folder }: { folder?: FileNode }) {
  if (!folder || !folder.children) return null;
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(90px,1fr))] gap-3 p-3">
      {folder.children.map((file) => (
        <GridItem key={file.name} file={file} parentPath={folder.name} />
      ))}
    </div>
  );
}

function GridItem({
  file,
  selected,
  parentPath,
}: { file: FileNode; selected?: string[]; parentPath?: string }) {
  const key = parentPath ? [parentPath, file.name].join("/") : file.name;
  const isActive = selected && selected.join("/") === key;
  return (
    <div
      className={`text-center bg-zinc-800 rounded-lg p-2.5 text-zinc-100 text-sm cursor-pointer border border-zinc-700 ${
        isActive ? "ring-2 ring-blue-500 bg-zinc-900" : ""
      }`}
    >
      <div className="text-2xl">
        {file.type === "folder" ? (
          <Icon type="outlined" symbol="folder" className="select-none text-grid!" />
        ) : file.name.includes(".engine") ? (
          <Icon type="outlined" symbol="game_object" className="select-none text-grid!" />
        ) : (
          <Icon type="outlined" symbol="document" className="select-none text-grid!" />
        )}
      </div>
      <div className="mt-1.5 break-all select-none">{file.name}</div>
    </div>
  );
}
