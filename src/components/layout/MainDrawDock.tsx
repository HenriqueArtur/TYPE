import GamePanel from "../panels/GamePanel";

interface MainDrawDockProps {
  height: number;
}

export default function MainDrawDock({ height }: MainDrawDockProps) {
  return <GamePanel height={height} />;
}
