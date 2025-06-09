import Dock from "./Dock";
import Sidebar from "./Sidebar";

interface BottomDockProps {
  never?: never;
}

export default function LeftDock(_props: BottomDockProps) {
  return (
    <Sidebar position="right" initialWidth={300}>
      <Dock panels={["INSPECTOR"]} default_panel={"INSPECTOR"} />
    </Sidebar>
  );
}
