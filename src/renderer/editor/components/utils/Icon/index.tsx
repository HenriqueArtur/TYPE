import { ICON_MAP, type IconSymbol } from "./Symbol";

export interface IconProps {
  type: IconType;
  symbol: IconSymbol;
  className?: string;
}

type IconType = "outlined" | "rounded" | "sharp";

type MaterialType =
  | "material-symbols-outlined"
  | "material-symbols-rounded"
  | "material-symbols-sharp";

const MATERIAL_TYPE: Record<IconType, MaterialType> = {
  outlined: "material-symbols-outlined",
  rounded: "material-symbols-outlined",
  sharp: "material-symbols-outlined",
};

export function Icon({ type, symbol, className }: IconProps) {
  return (
    <span className={`${MATERIAL_TYPE[type]}${className ? ` ${className}` : ""}`}>
      {ICON_MAP[symbol]}
    </span>
  );
}
