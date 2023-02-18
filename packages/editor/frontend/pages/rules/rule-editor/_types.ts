import type { Types } from '@fibrejs/engine';

export type TRuleStageWithNode = Types.Config.TRuleStageConfig & { ruleId?: string, node: Types.Serializer.TSerializedNode };

export type TPreviewValues = {
  executionTimeMs: number,
  inputs: Record<string, unknown>,
  outputs: Record<string, unknown>
};
