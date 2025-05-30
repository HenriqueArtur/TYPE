import React, { useState, useRef } from "react";

export default function ResizableGrid() {
  const [colWidths, setColWidths] = useState([200, 200]);
  const [rowHeights, setRowHeights] = useState([150, 150]);

  const resizing = useRef<{ type: 'col' | 'row', index: number } | null>(null);

  const onMouseMove = (e: MouseEvent) => {
    if (!resizing.current) return;

    if (resizing.current.type === 'col') {
      const { index } = resizing.current;
      const newWidths = [...colWidths];
      newWidths[index] = e.clientX - document.getElementById("grid")!.offsetLeft;
      setColWidths(newWidths);
    } else if (resizing.current.type === 'row') {
      const { index } = resizing.current;
      const newHeights = [...rowHeights];
      newHeights[index] = e.clientY - document.getElementById("grid")!.offsetTop;
      setRowHeights(newHeights);
    }
  };

  const onMouseUp = () => {
    resizing.current = null;
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("mouseup", onMouseUp);
  };

  const startResizing = (type: 'col' | 'row', index: number) => (e: React.MouseEvent) => {
    resizing.current = { type, index };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div id="grid" className="relative border border-gray-400 inline-block">
      <div className="flex">
        {colWidths.map((width, i) => (
          <React.Fragment key={i}>
            <div
              className="flex flex-col border border-gray-300"
              style={{ width }}
            >
              {rowHeights.map((height, j) => (
                <div
                  key={j}
                  className="border border-gray-200 bg-white"
                  style={{ height }}
                >
                  Cell {i},{j}
                </div>
              ))}
            </div>
            {i < colWidths.length - 1 && (
              <div
                className="w-1 cursor-col-resize bg-blue-300"
                onMouseDown={startResizing('col', i)}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {rowHeights.map((height, i) =>
        i < rowHeights.length - 1 ? (
          <div
            key={i}
            className="absolute left-0 right-0 h-1 cursor-row-resize bg-blue-300"
            style={{
              top: rowHeights.slice(0, i + 1).reduce((a, b) => a + b, 0),
            }}
            onMouseDown={startResizing('row', i)}
          />
        ) : null
      )}
    </div>
  );
}
