import { useCallback, useRef, useState } from "react";

interface UseResizableOptions {
  initial: number;
  min: number;
  max: number;
  signal?: "-" | "+";
}

export default function useResizable({
  initial,
  min,
  max,
  signal = "-",
}: UseResizableOptions): [number, (delta: number) => void] {
  const [size, setSize] = useState(initial);
  const sizeRef = useRef(initial);

  const handleResize = useCallback(
    (delta: number) => {
      sizeRef.current += signal === "+" ? delta : -delta;
      if (sizeRef.current < min) sizeRef.current = min;
      if (sizeRef.current > max) sizeRef.current = max;
      setSize(sizeRef.current);
    },
    [min, max, signal],
  );

  return [size, handleResize];
}
