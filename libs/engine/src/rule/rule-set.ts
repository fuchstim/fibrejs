import { ERuleSeverity } from '../constants/rule-severities';
import Rule from './rule';

export type TRuleWithSeverity = {
  rule: Rule,
  severity: ERuleSeverity,
};

export type TRuleSetOptions = {
  id: string,
  name: string,
  rules: TRuleWithSeverity[],
};

export type TRuleSetInputs = {
  [key: string]: any
};

export type TRuleSetExecutionResult = {
  triggered: boolean,
  severity: ERuleSeverity | null,
};

export default class RuleSet {
  readonly id: string;
  readonly name: string;
  readonly rules: TRuleWithSeverity[];

  constructor(options: TRuleSetOptions) {
    this.id = options.id;
    this.name = options.name;
    this.rules = options.rules;
  }

  async execute(inputs: TRuleSetInputs): Promise<TRuleSetExecutionResult> {
    const orderedRuleSeverities = [
      ERuleSeverity.INFO,
      ERuleSeverity.LOW,
      ERuleSeverity.MEDIUM,
      ERuleSeverity.HIGH,
      ERuleSeverity.VERY_HIGH,
      ERuleSeverity.CRITICAL,
    ];

    const ruleResults = await Promise.all(
      this.rules.map(async ({ rule, severity, }) => {
        const { triggered, } = await rule.execute(inputs);

        return { severity, triggered, };
      })
    );

    const highestSeverityResult = ruleResults
      .filter(({ triggered, }) => triggered)
      .sort((a, b) => orderedRuleSeverities.indexOf(a.severity) - orderedRuleSeverities.indexOf(b.severity))
      .pop();

    return {
      severity: highestSeverityResult?.severity ?? null,
      triggered: ruleResults.some(result => result.triggered),
    };
  }
}
