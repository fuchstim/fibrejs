import type Engine from '@tripwire/engine';
import type { Types } from '@tripwire/engine';

import { ERequestMethod, IService } from '../../types';

type TPreviewRuleService = {
  [ERequestMethod.CREATE]: {
    'PAYLOAD': Types.Config.TRuleConfig,
    'RESULT': { valid: boolean }
  },
  [ERequestMethod.FIND]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.GET]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.PATCH]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.DELETE]: { 'PAYLOAD': never, 'RESULT': never },
};

export default class RuleValidationService implements IService<TPreviewRuleService> {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  create(config: TPreviewRuleService[ERequestMethod.CREATE]['PAYLOAD']) {
    const result = this.engine.validateRuleConfig(config);

    return result;
  }
}
