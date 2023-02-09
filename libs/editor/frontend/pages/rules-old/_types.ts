import type { Config, Serializer } from '@tripwire/engine';

export type TRuleStageWithNode = Config.TRuleStageConfig & { node: Serializer.TSerializedNode };
