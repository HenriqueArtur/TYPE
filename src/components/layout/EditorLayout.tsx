import { Button } from "@heroui/react";
import LeftDock from "./LeftDock";
import MainDock from "./MainDock";
import RightDock from "./RightDock";

export default function EditorLayout() {
  return (
    <div className="w-screen h-screen flex flex-col m-0 p-0">
      <div className="flex items-center text-white shadow">
        <Button variant="light" radius="none" size="sm">
          💾 Save
        </Button>
        <Button variant="light" radius="none" size="sm">
          ▶ Play
        </Button>
        <Button variant="light" radius="none" size="sm">
          ⏸ Pause
        </Button>
      </div>
      <div className="h-[2px] w-full bg-divider" />
      <div className="flex flex-1">
        <LeftDock />
        <MainDock />
        <RightDock />
      </div>
    </div>
  );
}
