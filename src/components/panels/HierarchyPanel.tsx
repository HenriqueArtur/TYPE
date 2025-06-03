import GenericPanel from "./Panel";

export default function HierarchyPanel() {
  return (
    <GenericPanel
      tabs={[
        {
          key: "hierarchy",
          title: "Hierarchy",
          content: (
            <div>
              <h2>Hierarchy</h2>
            </div>
          ),
        },
        {
          key: "scenes",
          title: "Scenes",
          content: (
            <div>
              <h2>Scenes</h2>
            </div>
          ),
        },
      ]}
      defaultTabKey="hierarchy"
    />
  );
}
