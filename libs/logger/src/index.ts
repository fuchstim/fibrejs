import {
  Logger as Winston,
  LoggerOptions as WinstonLoggerOptions,
  transports as WinstonTransports
} from 'winston';

class Logger {
  private prefix: string;
  private loggerOptions: WinstonLoggerOptions;
  private _winston: Winston;

  constructor(prefix?: string, loggerOptions?: WinstonLoggerOptions) {
    this.prefix = prefix ?? '';
    this.loggerOptions = loggerOptions ?? {};

    this._winston = new Winston(loggerOptions);
    this._winston.transports = [
      new WinstonTransports.Console(),
    ];
  }

  ns(...namespaces: string[]) { return this.namespace(...namespaces); }

  namespace(...namespaces: string[]) {
    return new Logger(
      [
        this.prefix,
        ...namespaces.map(ns => `[${ns}]`),
      ].join('').trim(),
      this.loggerOptions
    );
  }

  log(...args: unknown[]) { return this.info(...args); }

  error(...args: unknown[]) { return this._winston.error(this.prefix, ...args); }
  warn(...args: unknown[]) { return this._winston.warn(this.prefix, ...args); }
  info(...args: unknown[]) { return this._winston.info(this.prefix, ...args); }
  verbose(...args: unknown[]) { return this._winston.verbose(this.prefix, ...args); }
  debug(...args: unknown[]) { return this._winston.debug(this.prefix, ...args); }
  silly(...args: unknown[]) { return this._winston.silly(this.prefix, ...args); }
}

export default new Logger();
