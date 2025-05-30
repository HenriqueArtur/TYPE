import React from 'react';
import Sidebar from './Sidebar';
import MainArea from './MainArea';
import HierarchyPanel from './panels/HierarchyPanel';
import InspectorPanel from './panels/InspectorPanel';

export default function EditorLayout() {
  return (
    <div className="w-screen h-screen flex overflow-hidden text-sm font-mono">
      <Sidebar position="left" initialWidth={200}>
        <HierarchyPanel />
      </Sidebar>

      <MainArea />

      <Sidebar position="right" initialWidth={300}>
        <InspectorPanel />
      </Sidebar>
    </div>
  );
}
