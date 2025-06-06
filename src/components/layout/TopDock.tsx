import { Button } from "@heroui/react";

export function TopDock() {
  return (
    <div className="flex items-center text-white justify-between px-2 relative">
      <TopDockButtonGroup>
        <TopDockButton icon="save" />
      </TopDockButtonGroup>
      <TopDockButtonGroup className="absolute left-1/2 -translate-x-1/2">
        <TopDockButton icon="play_arrow" />
        <TopDockButton icon="pause" />
      </TopDockButtonGroup>
      <TopDockButtonGroup>
        <TopDockButton icon="dock_to_left" />
        <TopDockButton icon="dock_to_right" />
        <TopDockButton icon="dock_to_bottom" />
        <TopDockButton icon="settings" />
      </TopDockButtonGroup>
    </div>
  );
}

function TopDockButtonGroup({
  children,
  className,
}: { children?: React.ReactNode; className?: string }) {
  return <div className={`flex items-center gap-1 ${className}`}>{children}</div>;
}

function TopDockButton({ icon }: { icon: string }) {
  return (
    <Button isIconOnly variant="light" size="sm" aria-label="Dock to Bottom">
      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
        {icon}
      </span>
    </Button>
  );
}
