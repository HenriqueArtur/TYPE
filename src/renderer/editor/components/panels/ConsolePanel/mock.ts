import type { LogMsg } from "./type";

export const mockLogs: LogMsg[] = [
  {
    severity: "INFO",
    msg: "Application started successfully.",
  },
  {
    severity: "WARN",
    msg: "Low disk space warning.",
  },
  {
    severity: "ERRO",
    msg: "Failed to connect to database.",
  },
  {
    severity: "INFO",
    msg: "User logged in.",
  },
  {
    severity: "DEBG",
    msg: "Fetching user profile data.",
  },
  {
    severity: "INFO",
    msg: "User profile loaded.",
  },
  {
    severity: "WARN",
    msg: "API response delayed.",
  },
  {
    severity: "ERRO",
    msg: "Timeout while fetching notifications.",
  },
  {
    severity: "INFO",
    msg: "Notifications loaded.",
  },
  {
    severity: "DEBG",
    msg: "Rendering dashboard widgets.",
  },
];
