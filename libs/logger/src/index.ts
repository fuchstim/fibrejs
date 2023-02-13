class Logger {
  private prefix: string;

  constructor(prefix?: string) {
    this.prefix = prefix ?? '';
  }

  ns(...namespaces: string[]) { return this.namespace(...namespaces); }

  namespace(...namespaces: string[]) {
    return new Logger(
      [
        this.prefix,
        ...namespaces.map(ns => `[${ns}]`),
      ].join('').trim()
    );
  }

  log(...args: unknown[]) { this.info(...args); }

  error(...args: unknown[]) { this.writeLog('error', [ this.prefix, ...args, ]); }
  warn(...args: unknown[]) { this.writeLog('warn', [ this.prefix, ...args, ]); }
  info(...args: unknown[]) { this.writeLog('info', [ this.prefix, ...args, ]); }
  debug(...args: unknown[]) { this.writeLog('debug', [ this.prefix, ...args, ]); }

  private writeLog(level: 'debug' | 'info' | 'warn' | 'error', messageParts: unknown[]) {
    console[level].apply(console, [ `[${level}]`, ...messageParts, ]);
  }
}

export default Logger;
