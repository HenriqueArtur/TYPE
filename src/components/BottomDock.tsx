import React, { useState, useRef } from 'react';
import Resizer from './Resizer';

interface BottomDockProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialHeight?: number;
}

export default function BottomDock({ leftPanel, rightPanel, initialHeight = 200 }: BottomDockProps) {
  const [height, setHeight] = useState(initialHeight);
  const heightRef = useRef(initialHeight);

  const handleResize = (delta: number) => {
    heightRef.current -= delta; // inverse because dragging upward is positive Y
    if (heightRef.current < 80) heightRef.current = 80;
    if (heightRef.current > 600) heightRef.current = 600;
    setHeight(heightRef.current);
  };

  return (
    <>
      <Resizer direction="row" onResize={handleResize} />
      <div className="flex" style={{ height }}>
        <div className="flex-1 bg-gray-700 text-white p-2 overflow-auto">{leftPanel}</div>
        <div className="w-0.5 bg-gray-600" />
        <div className="w-[300px] bg-gray-600 text-white p-2 overflow-auto">{rightPanel}</div>
      </div>
    </>
  );
}
