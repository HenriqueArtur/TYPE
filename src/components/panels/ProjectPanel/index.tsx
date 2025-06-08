import { useMemo, useState } from "react";
import { ProjectPanelContent } from "./ProjectPanelContent";
import { ProjectPanelHeader } from "./ProjectPanelHeader";

export type FileNode = {
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
        children: [{ name: "MainScene.engine", type: "file" }],
      },
    ],
  },
];

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

export default function ProjectPanel() {
  const [selected, setSelected] = useState<string[]>(["Assets"]);
  const selected_folder = useMemo(() => getFolderByPath(mockFiles, selected), [selected]);

  return (
    <div className="text-zinc-100 h-full text-[14px] border-r border-zinc-700 flex flex-col">
      <ProjectPanelHeader />
      <ProjectPanelContent
        files={mockFiles}
        selected_folder={selected_folder}
        selected={selected}
        onSelect={setSelected}
      />
    </div>
  );
}
