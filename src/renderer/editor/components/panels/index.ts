import type { JSX } from "react";
import ConsolePanel from "./ConsolePanel";
import GamePanel from "./GamePanel";
import HierarchyPanel from "./HierarchyPanel";
import InspectorPanel from "./InspectorPanel";
import ProjectPanel from "./ProjectPanel";
import ScenePanel from "./ScenePanel";

export interface PanelItem {
  tab_name: string;
  content: (...props: unknown[]) => JSX.Element;
}

export type PanelTabItem = PanelItem & { key: Panel };

export type Panel = "GAME" | "HIERARCHY" | "SCENE" | "INSPECTOR" | "PROJECT" | "CONSOLE";

export type PanelTable = Record<Panel, PanelItem>;

const PANEL: PanelTable = {
  GAME: {
    tab_name: "Game",
    content: GamePanel,
  },
  HIERARCHY: {
    tab_name: "Hierarchy",
    content: HierarchyPanel,
  },
  SCENE: {
    tab_name: "Scene",
    content: ScenePanel,
  },
  INSPECTOR: {
    tab_name: "Inspector",
    content: InspectorPanel,
  },
  PROJECT: {
    tab_name: "Project",
    content: ProjectPanel,
  },
  CONSOLE: {
    tab_name: "Console",
    content: ConsolePanel,
  },
};

export function PanelSelectTabs(tabs: Panel[]): PanelTabItem[] {
  return tabs.map((tab) => ({
    key: tab,
    tab_name: PANEL[tab].tab_name,
    content: PANEL[tab].content,
  }));
}
