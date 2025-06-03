import { useEffect, useRef } from "react";

interface ResizerProps {
  onResize: (delta: number) => void;
  direction?: "col" | "row";
}

export default function Resizer({ onResize, direction = "col" }: ResizerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const startPos = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const pos = direction === "col" ? e.clientX : e.clientY;
      const delta = pos - startPos.current;
      startPos.current = pos;
      onResize(delta);
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseDown = (e: MouseEvent) => {
      startPos.current = direction === "col" ? e.clientX : e.clientY;
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    const el = ref.current;
    el?.addEventListener("mousedown", handleMouseDown);

    return () => {
      el?.removeEventListener("mousedown", handleMouseDown);
    };
  }, [onResize, direction]);

  return (
    <div
      ref={ref}
      className={
        direction === "col"
          ? "w-[2px] h-full cursor-col-resize bg-divider"
          : "h-[2px] w-full cursor-row-resize bg-divider"
      }
    />
  );
}
