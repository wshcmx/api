import { wshcmx } from "../index";

export function write(message: unknown, type = "INFO", logCode = "common_log") {
  if (IsEmptyValue(message)) {
    write("Log message is empty", "WARNING");
    return;
  }

  logCode = `wshcmx_${logCode}`;
  EnableLog(logCode, true);
  const payload = `[${StrUpperCase(type)}] ${wshcmx.utils.type.isObject(message) ? tools.object_to_text(message, "json") : message}`;
  LogEvent(logCode, payload);

  if (wshcmx.config.stderr) {
    // eslint-disable-next-line no-alert
    alert(payload);
  }
}

export function info(message: unknown, logCode?: string) {
  return write(message, "INFO", logCode);
}

export function error(message: unknown, logCode: string) {
  return write(message, "ERROR", logCode);
}

export function warning(message: unknown, logCode: string) {
  return write(message, "WARNING", logCode);
}
