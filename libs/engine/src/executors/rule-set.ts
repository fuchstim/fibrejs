import Executor from '../common/executor';
import { TExecutorValidationResult } from '../types/common';
import { TRuleExecutorContext } from '../types/rule';
import { TRuleSetExecutorContext, ERuleSeverity } from '../types/rule-set';
import { TRuleSetEntry, TRuleSetOptions, TRuleSetInputs, TRuleSetExecutorResult } from '../types/rule-set';
import Rule from './rule';

const ORDERED_RULE_SEVERITIES = [
  ERuleSeverity.INFO,
  ERuleSeverity.LOW,
  ERuleSeverity.MEDIUM,
  ERuleSeverity.HIGH,
  ERuleSeverity.VERY_HIGH,
  ERuleSeverity.CRITICAL,
];

export default class RuleSet extends Executor<TRuleSetInputs, TRuleSetExecutorResult, TRuleSetExecutorContext> {
  readonly id: string;
  readonly name: string;
  readonly entries: TRuleSetEntry[];

  constructor(options: TRuleSetOptions) {
    super(options.id, 'rule-set');

    this.id = options.id;
    this.name = options.name;
    this.entries = options.entries;
  }

  async execute(inputs: TRuleSetInputs, context: TRuleSetExecutorContext): Promise<TRuleSetExecutorResult> {
    const ruleContext = { ...context, ruleSet: this, };

    const results = await Promise.all(
      this.entries.map(entry => this.executeEntry(entry, inputs, ruleContext))
    );

    const highestSeverityResult = results
      .filter(r => r.result.output.triggered)
      .sort((a, b) => ORDERED_RULE_SEVERITIES.indexOf(a.severity) - ORDERED_RULE_SEVERITIES.indexOf(b.severity))
      .pop();

    return {
      severity: highestSeverityResult?.severity ?? null,
      triggered: !!highestSeverityResult,
      ruleResults: results,
    };
  }

  override validateContext(context: TRuleSetExecutorContext): TExecutorValidationResult<TRuleSetExecutorContext> {
    const invalidEntries = this.entries
      .map(
        ({ ruleId, }) => ({
          ruleId,
          result: this.getRuleFromContext(context, ruleId).validateContext({ ...context, ruleSet: this, }),
        })
      )
      .filter(r => r.result.valid === false);

    if (invalidEntries.length) {
      return {
        valid: false,
        reason: `Invalid entries: ${invalidEntries.map(e => `${e.ruleId} (${e.result.reason})`).join(', ')}`,
        actual: context,
      };
    }

    return {
      valid: true,
      reason: null,
      actual: context,
    };
  }

  private getRuleFromContext(context: TRuleSetExecutorContext, ruleId: string): Rule {
    const rule = context.rules.find(rule => rule.id === ruleId);
    if (!rule) { throw new Error(`Failed to find rule for id ${ruleId}`); }

    return rule;
  }

  private async executeEntry({ ruleId, severity, }: TRuleSetEntry, inputs: TRuleSetInputs, context: TRuleExecutorContext) {
    const result = await this.getRuleFromContext(context, ruleId).run(inputs, context);

    return { ruleId, severity, result, };
  }
}
