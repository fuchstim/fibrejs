import { ERuleSeverity } from '../constants/rule-severities';
import { TRuleSetEntry, TRuleSetOptions, TRuleSetInputs, TRuleSetExecutionResult } from '../types/rule-set';

export default class RuleSet {
  readonly id: string;
  readonly name: string;
  readonly entries: TRuleSetEntry[];

  constructor(options: TRuleSetOptions) {
    this.id = options.id;
    this.name = options.name;
    this.entries = options.entries;
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
      this.entries.map(async ({ rule, severity, }) => {
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
