import winston from 'winston';

export class Logger {
  private prefix: string;
  private _winston: winston.Logger;

  constructor(prefix?: string) {
    this.prefix = prefix ?? '';

    this._winston = winston.createLogger({
      level: 'info',
      transports: [
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
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

  log(...args: unknown[]) { return this.info(...args); }

  error(...args: unknown[]) { this._winston.error([ this.prefix, ...args, ].join(' ')); }
  warn(...args: unknown[]) { this._winston.warn([ this.prefix, ...args, ].join(' ')); }
  info(...args: unknown[]) { this._winston.info([ this.prefix, ...args, ].join(' ')); }
  verbose(...args: unknown[]) { this._winston.verbose([ this.prefix, ...args, ].join(' ')); }
  debug(...args: unknown[]) { this._winston.debug([ this.prefix, ...args, ].join(' ')); }
  silly(...args: unknown[]) { this._winston.silly([ this.prefix, ...args, ].join(' ')); }
}

export default new Logger();
