import LeftDock from "./LeftDock";
import MainDock from "./MainDock";
import RightDock from "./RightDock";

export default function EditorLayout() {
  return (
    <div className="w-screen h-screen flex m-0 p-0">
      <LeftDock />
      <MainDock />
      <RightDock />
    </div>
  );
}
