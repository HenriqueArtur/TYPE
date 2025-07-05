import { Tab, Tabs } from "@heroui/react";
import { type Key, type ReactNode, useState } from "react";

type TabItem = {
  key: string;
  title: string;
  content: ReactNode;
};

type GenericPanelProps = {
  tabs: TabItem[];
  defaultTabKey?: string;
  height?: number;
};

export default function GenericPanel({ tabs, defaultTabKey, height }: GenericPanelProps) {
  const [selected, setSelected] = useState<string>(defaultTabKey ?? tabs[0]?.key);

  const selectedTab = tabs.find((tab) => tab.key === selected);

  return (
    <div className="pt-1" style={{ height: height ? height : "100%" }}>
      <Tabs
        key="generic-panel"
        aria-label="Generic Panel"
        variant="solid"
        size="sm"
        selectedKey={selected}
        onSelectionChange={(key: Key) => setSelected(key as string)}
        classNames={{
          base: "p-0 m-0",
          tabList: "rounded-none pb-[0px]",
          cursor: "dark:bg-content1 bg-content1 shadow-none rounded-t-sm rounded-b-none p-0 m-0",
        }}
      >
        {tabs.map((tab) => (
          <Tab key={tab.key} title={tab.title} />
        ))}
      </Tabs>
      <div className="bg-content1 p-0 m-0">{selectedTab?.content}</div>
    </div>
  );
}
