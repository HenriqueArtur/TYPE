import React, { useRef, useState } from 'react';
import Resizer from './Resizer';

interface SidebarProps {
  position: 'left' | 'right';
  initialWidth?: number;
  children: React.ReactNode;
}

export default function Sidebar({ position, initialWidth = 200, children }: SidebarProps) {
  const [width, setWidth] = useState(initialWidth);
  const isLeft = position === 'left';

  return (
    <>
      {isLeft && <Resizer onResize={delta => setWidth(width + delta)} />}
      <div className="bg-gray-900 text-white p-2" style={{ width }}>{children}</div>
      {!isLeft && <Resizer onResize={delta => setWidth(width - delta)} />}
    </>
  );
}
