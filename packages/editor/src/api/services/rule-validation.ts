import type Engine from '@fibrejs/engine';
import type { Types } from '@fibrejs/engine';

import { ERequestMethod, IService } from '../../types';

type TValidateRuleService = {
  [ERequestMethod.CREATE]: {
    'PAYLOAD': Types.Config.TRuleConfig,
    'RESULT': { valid: boolean }
  },
  [ERequestMethod.FIND]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.GET]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.PATCH]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.DELETE]: { 'PAYLOAD': never, 'RESULT': never },
};

export default class RuleValidationService implements IService<TValidateRuleService> {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  create(config: TValidateRuleService[ERequestMethod.CREATE]['PAYLOAD']) {
    const result = this.engine.validateRuleConfig(config);

    return result;
  }
}
