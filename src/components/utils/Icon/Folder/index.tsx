import { Icon } from "..";

export function FolderIcon({ className }: { className?: string }) {
  return <Icon type="outlined" symbol="folder" className={className ?? ""} />;
}
