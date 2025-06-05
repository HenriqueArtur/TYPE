import Resizer from "../utils/Resizer";
import useResizable from "../utils/Resizer/useResizable";
import Dock from "./Dock";

interface BottomDockProps {
  initialHeight?: number;
}

export default function MainBottomDock({ initialHeight = 200 }: BottomDockProps) {
  const [height, handleHeightResize] = useResizable({
    initial: initialHeight,
    min: 80,
    max: 600,
  });

  return (
    <>
      <Resizer direction="row" onResize={handleHeightResize} />
      <Dock panels={["PROJECT", "CONSOLE"]} default_panel={"PROJECT"} height={height} />
    </>
  );
}
