import type Engine from '@fibre/engine';
import type { Types } from '@fibre/engine';

import { ERequestMethod, IService } from '../../types';

type TValidateRuleSetService = {
  [ERequestMethod.CREATE]: {
    'PAYLOAD': Types.Config.TRuleSetConfig,
    'RESULT': { valid: boolean }
  },
  [ERequestMethod.FIND]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.GET]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.PATCH]: { 'PAYLOAD': never, 'RESULT': never },
  [ERequestMethod.DELETE]: { 'PAYLOAD': never, 'RESULT': never },
};

export default class RuleSetValidationService implements IService<TValidateRuleSetService> {
  private engine: Engine;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  create(config: TValidateRuleSetService[ERequestMethod.CREATE]['PAYLOAD']) {
    const result = this.engine.validateRuleSetConfig(config);

    return result;
  }
}
