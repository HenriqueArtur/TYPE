import GenericPanel from "./Panel";

export default function InspectorPanel() {
  return (
    <GenericPanel
      tabs={[
        {
          key: "inspector",
          title: "Inspector",
          content: (
            <div>
              <h2>Inspector</h2>
            </div>
          ),
        },
      ]}
      defaultTabKey="inspector"
    />
  );
}
