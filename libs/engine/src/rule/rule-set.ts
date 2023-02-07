import { ERuleSeverity } from '../constants/rule-severities';
import { TRuleContext } from '../types/rule';
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

  async execute(inputs: TRuleSetInputs, context: TRuleContext): Promise<TRuleSetExecutionResult> {
    const orderedRuleSeverities = [
      ERuleSeverity.INFO,
      ERuleSeverity.LOW,
      ERuleSeverity.MEDIUM,
      ERuleSeverity.HIGH,
      ERuleSeverity.VERY_HIGH,
      ERuleSeverity.CRITICAL,
    ];

    const ruleResults = await Promise.all(
      this.entries.map(async ({ ruleId, severity, }) => {
        const rule = context.rules.find(
          rule => rule.id === ruleId
        );
        if (!rule) { throw new Error(`Failed to find rule for id ${ruleId}`); }

        const { triggered, } = await rule.execute(inputs, context);

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
