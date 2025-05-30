import React from "react";

const containerStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "250px 1fr 300px",
  gridTemplateRows: "1fr 200px",
  gridTemplateAreas: `
    "hierarchy game inspector"
    "project   log  inspector"
  `,
  height: "100vh",
  gap: "4px",
  background: "#222",
  color: "#fff",
};

const panelStyle: React.CSSProperties = {
  background: "#333",
  borderRadius: "4px",
  padding: "8px",
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
};

export default function UnityLayout() {
  return (
    <div style={containerStyle}>
      <div style={{ ...panelStyle, gridArea: "hierarchy" }}>
        <h3>Hierarchy</h3>
        {/* Hierarchy content goes here */}
      </div>
      <div style={{ ...panelStyle, gridArea: "game" }}>
        <h3>Game Window</h3>
        {/* Game window content goes here */}
      </div>
      <div style={{ ...panelStyle, gridArea: "inspector" }}>
        <h3>Inspector</h3>
        {/* Inspector content goes here */}
      </div>
      <div style={{ ...panelStyle, gridArea: "project" }}>
        <h3>Project</h3>
        {/* Project content goes here */}
      </div>
      <div style={{ ...panelStyle, gridArea: "log" }}>
        <h3>Log</h3>
        {/* Log content goes here */}
      </div>
    </div>
  );
}

