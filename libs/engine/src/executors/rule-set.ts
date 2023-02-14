import Executor from '../common/executor';
import { TExecutorValidationResult } from '../types/common';
import { TRuleExecutorContext } from '../types/rule';
import { TRuleSetExecutorContext, ERulePriority } from '../types/rule-set';
import { TRuleSetEntry, TRuleSetOptions, TRuleSetInputs, TRuleSetExecutorResult } from '../types/rule-set';
import Rule from './rule';

const ORDERED_RULE_PRIORITIES = [
  ERulePriority.LOWEST,
  ERulePriority.LOW,
  ERulePriority.MEDIUM,
  ERulePriority.HIGH,
  ERulePriority.HIGHEST,
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
    const results = await Promise.all(
      this.entries.map(entry => this.executeEntry(entry, inputs, { ...context, ruleSet: this, }))
    );

    const orderedResults = results.sort(
      (a, b) => ORDERED_RULE_PRIORITIES.indexOf(b.priority) - ORDERED_RULE_PRIORITIES.indexOf(a.priority)
    );

    return {
      highestPriorityRuleResult: orderedResults[0] ?? null,
      ruleResults: orderedResults,
    };
  }

  override validateContext(context: TRuleSetExecutorContext): TExecutorValidationResult<TRuleSetExecutorContext> {
    const uniqueEntryNodeIds = Array.from(
      new Set(
        this.entries
          .map(({ ruleId, }) => this.getRuleFromContext(ruleId, context).entryStage?.node.id)
          .filter(Boolean)
      )
    );
    if (uniqueEntryNodeIds.length > 1) {
      return {
        valid: false,
        reason: `All rule set entries must share the same entry node (or have no entry node), but multiple node ids were found: (${uniqueEntryNodeIds.join(', ')})`,
        actual: context,
      };
    }

    const invalidEntries = this.entries
      .map(
        entry => {
          const validPriority = ORDERED_RULE_PRIORITIES.includes(entry.priority);
          if (!validPriority) {
            return {
              entry,
              result: { valid: false, reason: 'Invalid priority', },
            };
          }

          return {
            entry,
            result: this.getRuleFromContext(entry.ruleId, context).validateContext({ ...context, ruleSet: this, }),
          };
        }
      )
      .filter(r => r.result.valid === false);

    if (invalidEntries.length) {
      return {
        valid: false,
        reason: `Invalid entries: ${invalidEntries.map(e => `${e.entry.ruleId} - ${e.entry.priority} (${e.result.reason})`).join(', ')}`,
        actual: context,
      };
    }

    return {
      valid: true,
      reason: null,
      actual: context,
    };
  }

  private getRuleFromContext(ruleId: string, context: TRuleSetExecutorContext): Rule {
    const rule = context.rules.find(rule => rule.id === ruleId);
    if (!rule) { throw new Error(`Failed to find rule for id ${ruleId}`); }

    return rule;
  }

  private async executeEntry({ ruleId, priority, }: TRuleSetEntry, inputs: TRuleSetInputs, context: TRuleExecutorContext) {
    const result = await this.getRuleFromContext(ruleId, context).run(inputs, context);

    return { ruleId, priority, ...result, };
  }
}
