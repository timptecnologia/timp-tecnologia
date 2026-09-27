import { redact, redactString } from "./redact"

/**
 * Logger central (JSON estruturado, uma linha por evento).
 * Todo contexto passa por `redact` antes de sair. Use sempre este logger —
 * nunca `console.log` com objetos de request/sessão.
 */

export type LogLevel = "debug" | "info" | "warn" | "error"
const ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 }

export type LogContext = Record<string, unknown>
export type LogSink = (level: LogLevel, line: string) => void

const defaultSink: LogSink = (level, line) => {
  if (level === "error") console.error(line)
  else if (level === "warn") console.warn(line)
  else console.log(line)
}

export interface Logger {
  debug(message: string, context?: LogContext): void
  info(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
  error(message: string, context?: LogContext): void
  child(bindings: LogContext): Logger
}

export interface LoggerOptions {
  level?: LogLevel
  sink?: LogSink
  bindings?: LogContext
  now?: () => Date
}

function resolveLevel(): LogLevel {
  const raw = typeof process !== "undefined" ? process.env.LOG_LEVEL : undefined
  return raw === "debug" || raw === "info" || raw === "warn" || raw === "error" ? raw : "info"
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const level = options.level ?? resolveLevel()
  const sink = options.sink ?? defaultSink
  const bindings = options.bindings ?? {}
  const now = options.now ?? (() => new Date())

  function emit(lvl: LogLevel, message: string, context?: LogContext) {
    if (ORDER[lvl] < ORDER[level]) return
    const entry = {
      ts: now().toISOString(),
      level: lvl,
      msg: redactString(message),
      ...(redact({ ...bindings, ...context }) as Record<string, unknown>),
    }
    let line: string
    try {
      line = JSON.stringify(entry)
    } catch {
      line = JSON.stringify({ ts: entry.ts, level: lvl, msg: entry.msg, note: "context not serializable" })
    }
    sink(lvl, line)
  }

  return {
    debug: (m, c) => emit("debug", m, c),
    info: (m, c) => emit("info", m, c),
    warn: (m, c) => emit("warn", m, c),
    error: (m, c) => emit("error", m, c),
    child: (extra) => createLogger({ level, sink, now, bindings: { ...bindings, ...extra } }),
  }
}

export const logger = createLogger()
