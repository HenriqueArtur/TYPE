import ConsolePanel, { type ConsolePanelProps } from "./ConsolePanel";
import GamePanel, { type GamePanelProps } from "./GamePanel";
import HierarchyPanel from "./HierarchyPanel";
import InspectorPanel, { type InspectorPanelProps } from "./InspectorPanel";
import ProjectPanel from "./ProjectPanel";
import ScenePanel from "./ScenePanel";

export interface PanelItem<T> {
  tab_name: string;
  content: React.FC<T>;
}

export type PanelTabItem = PanelItem<unknown> & { key: Panel };

export type Panel = "GAME" | "HIERARCHY" | "SCENE" | "INSPECTOR" | "PROJECT" | "CONSOLE";

export type PanelTable = {
  GAME: PanelItem<GamePanelProps>;
  HIERARCHY: PanelItem<unknown>;
  SCENE: PanelItem<unknown>;
  INSPECTOR: PanelItem<InspectorPanelProps>;
  PROJECT: PanelItem<unknown>;
  CONSOLE: PanelItem<ConsolePanelProps>;
};

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
    // This cast is necessary because the content of each panel has different props,
    // but the function must return an array of panels with a common props type.
    content: PANEL[tab].content as React.FC<unknown>,
  }));
}
