import React from 'react';
import GamePanel from './panels/GamePanel';
import BottomDock from './BottomDock';
import ProjectPanel from './panels/ProjectPanel';
import ConsolePanel from './panels/ConsolePanel';

export default function MainArea() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 bg-gray-800 text-white p-2 overflow-auto">
        <GamePanel />
      </div>
      <BottomDock leftPanel={<ProjectPanel />} rightPanel={<ConsolePanel />} />
    </div>
  );
}
