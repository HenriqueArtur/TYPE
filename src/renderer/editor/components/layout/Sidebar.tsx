import type { ReactNode } from "react";
import Resizer from "../utils/Resizer";
import useResizable from "../utils/Resizer/useResizable";

interface SidebarProps {
  position: "left" | "right";
  initialWidth?: number;
  children: ReactNode;
}

export default function Sidebar({ position, initialWidth = 200, children }: SidebarProps) {
  const isLeft = position === "left";
  const [width, handleWidthResize] = useResizable({
    initial: initialWidth,
    min: 80,
    max: 600,
    signal: isLeft ? "+" : "-",
  });

  return (
    <>
      {!isLeft && <Resizer direction="col" onResize={handleWidthResize} />}
      <div className="p-0 " style={{ width }}>
        {children}
      </div>
      {isLeft && <Resizer direction="col" onResize={handleWidthResize} />}
    </>
  );
}
