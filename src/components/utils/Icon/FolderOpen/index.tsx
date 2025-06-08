import { Icon } from "..";

export function FolderOpenIcon({ className }: { className?: string }) {
  return <Icon type="outlined" symbol="folder" className={className ?? ""} />;
}
