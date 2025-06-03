import type React from "react";
import GenericPanel from "../panels/Panel";
import Resizer from "../utils/Resizer";
import useResizable from "../utils/Resizer/useResizable";

interface BottomDockProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialHeight?: number;
  initialWidth?: number;
}

export default function BottomDock({ initialHeight = 200 }: BottomDockProps) {
  const [height, handleHeightResize] = useResizable({
    initial: initialHeight,
    min: 80,
    max: 600,
  });

  return (
    <>
      <Resizer direction="row" onResize={handleHeightResize} />
      <GenericPanel
        tabs={[
          {
            key: "project",
            title: "Project",
            content: (
              <div>
                <h2>Project</h2>
              </div>
            ),
          },
          {
            key: "console",
            title: "Console",
            content: (
              <div>
                <h2>Console</h2>
              </div>
            ),
          },
        ]}
        defaultTabKey="project"
        height={height}
      />
    </>
  );
}
