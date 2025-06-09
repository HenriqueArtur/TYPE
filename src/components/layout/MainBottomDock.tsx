import Dock from "./Dock";

interface BottomDockProps {
  height: number;
}

export default function MainBottomDock({ height }: BottomDockProps) {
  return (
    <>
      <Dock panels={["PROJECT", "CONSOLE"]} default_panel={"PROJECT"} height={height} />
    </>
  );
}
