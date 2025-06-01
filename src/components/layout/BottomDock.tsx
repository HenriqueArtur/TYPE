import type React from "react";
import Resizer from "../utils/Resizer";
import useResizable from "../utils/Resizer/useResizable";

interface BottomDockProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialHeight?: number;
  initialWidth?: number;
}

export default function BottomDock({
  leftPanel,
  rightPanel,
  initialHeight = 200,
  initialWidth = 100,
}: BottomDockProps) {
  const [height, handleHeightResize] = useResizable({
    initial: initialHeight,
    min: 80,
    max: 600,
  });
  const [width, handleWidthResize] = useResizable({
    initial: initialWidth,
    min: 80,
    max: 600,
  });

  return (
    <>
      <Resizer direction="row" onResize={handleHeightResize} />
      <div className="flex" style={{ height }}>
        <div className="flex-1 bg-gray-700 text-white p-2 overflow-auto" style={{ width: width }}>
          {leftPanel}
        </div>
        <Resizer direction="col" onResize={handleWidthResize} />
        <div
          className="w-[300px] bg-gray-600 text-white p-2 overflow-auto"
          style={{ width: width }}
        >
          {rightPanel}
        </div>
      </div>
    </>
  );
}
