import Dock from "./Dock";
import Sidebar from "./Sidebar";

interface BottomDockProps {
  never?: never;
}

export default function LeftDock(_props: BottomDockProps) {
  return (
    <Sidebar position="left" initialWidth={300}>
      <Dock panels={["HIERARCHY"]} default_panel={"HIERARCHY"} />
    </Sidebar>
  );
}
