/*
 * Follow RFC5424
 * @link https://datatracker.ietf.org/doc/html/rfc5424#section-6.2.1
 */
export type LogSeverity =
  | "EMERGENCY"
  | "ALERT"
  | "CRITICAL"
  | "ERROR"
  | "WARNING"
  | "NOTICE"
  | "INFORMATIONAL"
  | "DEBUG";

export type LogSeverityShort =
  | "EMER"
  | "ALRT"
  | "CRIT"
  | "ERRO"
  | "WARN"
  | "NOTI"
  | "INFO"
  | "DEBG";

export interface LogMsg {
  severity: LogSeverityShort;
  msg: string;
}
