import EventEmitter from '../common/event-emitter';

import { TEngineConfig } from '../types/config';
import { TStorageEventTypes } from '../types/storage';

export abstract class BaseStorageProvider extends EventEmitter<TStorageEventTypes> {
  abstract getLatestConfigVersion(): number | Promise<number>;

  abstract loadConfig(version: number): TEngineConfig | Promise<TEngineConfig>;

  abstract saveConfig(config: TEngineConfig): void | Promise<void>;
}
