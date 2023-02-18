import type Engine from '@fibrejs/engine';
import type { Types } from '@fibrejs/engine';

import { ERequestMethod, IService, TPreviewRuleServicePayload } from '../../types';

type TPreviewRuleService = {
  [ERequestMethod.CREATE]: {
    'PAYLOAD': TPreviewRuleServicePayload,
    'RESULT': Types.Common.TExecutorResult<Types.Rule.TRuleInputs, Types.Rule.TRuleOutputs>
  },
  [ERequestMethod.FIND]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.GET]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.PATCH]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.DELETE]: { 'PAYLOAD': never, 'RESULT': never },
};

export default class RulePreviewService implements IService<TPreviewRuleService> {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  async create({ config, inputs, }: TPreviewRuleService[ERequestMethod.CREATE]['PAYLOAD']) {
    const result = await this.engine.previewRule(config, inputs);

    return result;
  }
}
