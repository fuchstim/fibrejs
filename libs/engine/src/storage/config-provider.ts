import { TEngineConfig } from '../types/config';

export abstract class ConfigProvider {
  abstract getLatestConfigVersion(): number | Promise<number>;

  abstract loadConfig(version: number): TEngineConfig | Promise<TEngineConfig>;

  abstract saveConfig(config: TEngineConfig): void | Promise<void>;
}
