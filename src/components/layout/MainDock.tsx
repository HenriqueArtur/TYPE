import MainBottomDock from "./MainBottomDock";
import MainDrawDock from "./MainDrawDock";

export default function MainDock() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden">{/* <MainDrawDock /> */}</div>
      <MainBottomDock />
    </div>
  );
}
