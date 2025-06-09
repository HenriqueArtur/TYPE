import { useEffect, useRef, useState } from "react";
import Resizer from "../utils/Resizer";
import useResizable from "../utils/Resizer/useResizable";
import MainBottomDock from "./MainBottomDock";
import MainDrawDock from "./MainDrawDock";

const INITIAL_HEIGHT_BOTTOM = 350;

export default function MainDock() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  const [height_bottom, handleHeightResize] = useResizable({
    initial: INITIAL_HEIGHT_BOTTOM,
    min: 80,
    max: 720,
  });

  useEffect(() => {
    function updateHeight() {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    }
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const height_draw = Math.max(containerHeight - height_bottom, 0);

  return (
    <div
      ref={containerRef}
      className="flex flex-1 flex-col overflow-hidden h-full"
      style={{ minHeight: 0 }}
    >
      <div style={{ height: height_draw, minHeight: 0, overflow: "hidden" }}>
        <MainDrawDock height={height_draw} />
      </div>
      <Resizer direction="row" onResize={handleHeightResize} />
      <div style={{ height: height_bottom, minHeight: 0, overflow: "hidden" }}>
        <MainBottomDock height={height_bottom} />
      </div>
    </div>
  );
}
