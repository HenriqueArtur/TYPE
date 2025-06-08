import { Input } from "@heroui/react";
import { Icon } from "../../Icon";

export function InputSearch() {
  return (
    <Input
      type="search"
      variant="bordered"
      size="sm"
      maxLength={120}
      placeholder="Search..."
      startContent={<Icon type={"outlined"} symbol={"search"} className="text-[20px]!" />}
      className="bg-content2 w-80 m-1"
    />
  );
}
