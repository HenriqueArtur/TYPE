import { Button } from "@heroui/react";
import { Icon } from "../../Icon";
import type { IconSymbol } from "../../Icon/Symbol";

export interface InputButtonIconProps {
  size?: "sm" | "md" | "lg";
  aria_label: string;
  symbol: IconSymbol;
}

export function InputButtonIcon({ size, aria_label, symbol }: InputButtonIconProps) {
  return (
    <Button isIconOnly variant="light" size={size ?? "sm"} aria-label={aria_label}>
      <Icon type="outlined" symbol={symbol} />
    </Button>
  );
}
