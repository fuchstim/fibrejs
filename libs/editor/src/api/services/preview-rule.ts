import type Engine from '@tripwire/engine';
import type { Types } from '@tripwire/engine';

import { ERequestMethod, IService } from '../../types';

type TPreviewRuleService = {
  [ERequestMethod.CREATE]: {
    'PAYLOAD': {
      config: Types.Config.TRuleConfig,
      inputs: Record<string, unknown>
    },
    'RESULT': Types.Common.TExecutorResult<Types.Rule.TRuleOutputs>
  },
  [ERequestMethod.FIND]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.GET]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.PATCH]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.DELETE]: { 'PAYLOAD': never, 'RESULT': never },
};

export default class PreviewRuleService implements IService<TPreviewRuleService> {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  async create({ config, inputs, }: TPreviewRuleService[ERequestMethod.CREATE]['PAYLOAD']) {
    const result = await this.engine.executeRuleConfig(config, inputs);

    return result;
  }
}
