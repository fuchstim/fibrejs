import { ERuleSeverity } from '../constants/severities';
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

type TRuleSetInputs = {
  [key: string]: any
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

  async execute(inputs: TRuleSetInputs): Promise<ERuleSeverity> {
    const orderedRuleSeverities = [
      ERuleSeverity.NONE,
      ERuleSeverity.LOW,
      ERuleSeverity.MEDIUM,
      ERuleSeverity.HIGH,
      ERuleSeverity.VERY_HIGH,
      ERuleSeverity.CRITICAL,
    ];

    const ruleResults = await Promise.all(
      this.rules.map(async ({ rule, severity, }) => {
        const { result, } = await rule.execute(inputs);

        return { severity, result, };
      })
    );

    const highestSeverityResult = ruleResults
      .filter(({ result, }) => result === true)
      .sort((a, b) => orderedRuleSeverities.indexOf(a.severity) - orderedRuleSeverities.indexOf(b.severity))
      .pop();

    return highestSeverityResult?.severity ?? ERuleSeverity.NONE;
  }
}
