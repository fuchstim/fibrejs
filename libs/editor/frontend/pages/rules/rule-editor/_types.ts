import type { Types } from '@tripwire/engine';

export type TRuleStageWithNode = Types.Config.TRuleStageConfig & { ruleId?: string, node: Types.Serializer.TSerializedNode };
