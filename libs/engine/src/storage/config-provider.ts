import { TEngineConfig } from '../types/config';

export abstract class ConfigProvider {
  abstract getLatestRevision(): number | Promise<number>;

  abstract load(version: number): TEngineConfig | Promise<TEngineConfig>;

  abstract save(config: TEngineConfig): void | Promise<void>;
}
