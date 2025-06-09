import { Divider } from "@heroui/react";
import LeftDock from "./LeftDock";
import MainDock from "./MainDock";
import RightDock from "./RightDock";
import { TopDock } from "./TopDock";

export default function EditorLayout() {
  return (
    <div className="w-screen h-screen flex flex-col m-0 p-0">
      <TopDock />
      <Divider />
      <div className="flex flex-1">
        <LeftDock />
        <MainDock />
        <RightDock />
      </div>
    </div>
  );
}
