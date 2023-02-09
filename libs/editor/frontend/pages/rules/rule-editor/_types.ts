import type { Types } from '@tripwire/engine';

export type TRuleStageWithNode = Types.Config.TRuleStageConfig & { node: Types.Serializer.TSerializedNode };
