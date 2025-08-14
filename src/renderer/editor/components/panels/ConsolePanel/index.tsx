import { InputSearch } from "../../utils/Input/Search";
import { mockLogs } from "./mock";
import type { LogMsg } from "./type";

export interface ConsolePanelProps {
  logs?: LogMsg[];
}

export default function ConsolePanel({ logs = mockLogs }: ConsolePanelProps) {
  return (
    <div className="text-zinc-100 h-full text-[14px] border-r border-zinc-700 flex flex-col">
      <div className="bg-content2 py-0 px-1 border-b border-zinc-700 font-bold text-[15px] tracking-wide flex items-center flex-row-reverse justify-between gap-2">
        <InputSearch />
      </div>
      <div className="flex-1 overflow-auto px-2 py-1 font-mono">
        {logs.map((log, idx) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <p key={idx}>
            [{new Date().toISOString().slice(0, 19).replace("T", " ")}] {log.severity}: {log.msg}
          </p>
        ))}
      </div>
    </div>
  );
}
