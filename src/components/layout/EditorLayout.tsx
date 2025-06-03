import ConsolePanel from "../panels/ConsolePanel";
import GamePanel from "../panels/GamePanel";
import HierarchyPanel from "../panels/HierarchyPanel";
import InspectorPanel from "../panels/InspectorPanel";
import ProjectPanel from "../panels/ProjectPanel";
import BottomDock from "./BottomDock";
import Sidebar from "./Sidebar";

export default function EditorLayout() {
  return (
    <div className="w-screen h-screen flex overflow-hidden m-0 p-0">
      <Sidebar position="left" initialWidth={200}>
        <HierarchyPanel />
      </Sidebar>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 p-0 overflow-auto">
          <GamePanel />
        </div>
        <BottomDock leftPanel={<ProjectPanel />} rightPanel={<ConsolePanel />} />
      </div>
      <Sidebar position="right" initialWidth={300}>
        <InspectorPanel />
      </Sidebar>
    </div>
  );
}
