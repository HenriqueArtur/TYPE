import { InputButtonIcon } from "../../utils/Input/ButtonIcon";
import { InputSearch } from "../../utils/Input/Search";

export function ProjectPanelHeader() {
  return (
    <div className="bg-content2 py-0 px-1 border-b border-zinc-700 font-bold text-[15px] tracking-wide flex items-center justify-between gap-2">
      <InputButtonIcon symbol="add" aria_label="Add new file" />
      <InputSearch />
    </div>
  );
}
