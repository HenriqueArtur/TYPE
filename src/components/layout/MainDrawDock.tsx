import Dock from "./Dock";

interface MainDrawDockProps {
  never?: never;
}

export default function MainDrawDock(_props: MainDrawDockProps) {
  return (
    <>
      <Dock panels={["GAME", "SCENE"]} default_panel={"GAME"} />
    </>
  );
}
