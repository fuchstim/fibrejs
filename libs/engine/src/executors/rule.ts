import Executor from '../common/executor';
import { TExecutorValidationResult } from '../types/common';
import { ENodeType } from '../types/node';
import { TRuleOptions, TRuleInputs, TRuleOutputs, TRuleExecutorContext } from '../types/rule';
import { TRuleStageInputs, TRuleStageResults } from '../types/rule-stage';
import RuleStage from './rule-stage';

export default class Rule extends Executor<TRuleInputs, TRuleOutputs, TRuleExecutorContext> {
  readonly id: string;
  readonly name: string;
  readonly stages: RuleStage[];

  constructor(options: TRuleOptions) {
    super(options.id, 'rule');

    this.id = options.id;
    this.name = options.name;
    this.stages = this.sortStages(options.stages);

    const entryStages = this.stages.filter(stage => stage.node.type === ENodeType.ENTRY);
    const exitStages = this.stages.filter(stage => stage.node.type === ENodeType.EXIT);

    if (this.stages.length && (entryStages.length !== 1 || exitStages.length !== 1)) {
      throw new Error('Invalid number of entry / exit stages defined');
    }
  }

  get entryStage() {
    const entryStage = this.stages.find(stage => stage.node.type === ENodeType.ENTRY);
    if (!entryStage) { throw new Error(`Failed to find entry stage for rule ${this.id}`); }

    return entryStage;
  }

  get exitStage() {
    const exitStage = this.stages.find(stage => stage.node.type === ENodeType.EXIT);
    if (!exitStage) { throw new Error(`Failed to find exit stage for rule ${this.id}`); }

    return exitStage;
  }

  async execute(inputs: TRuleInputs, context: TRuleExecutorContext): Promise<TRuleOutputs> {
    const ruleStageResults: TRuleStageResults = {};

    for (const stage of this.stages) {
      const isEntryStage = stage.node.type === ENodeType.ENTRY;

      ruleStageResults[stage.id] = await stage.run(
        isEntryStage ? this.getEntryStageInputs(stage, inputs, context) : this.getRuleStageInputs(stage, ruleStageResults),
        { ...context, rule: this, }
      );
    }

    return {
      exitStageOutputs: ruleStageResults[this.exitStage.id].outputs,
      ruleStageResults,
    };
  }

  override validateContext(context: TRuleExecutorContext): TExecutorValidationResult<TRuleExecutorContext> {
    const invalidStages = this.stages
      .map(
        stage => ({ stage, result: stage.validateContext({ ...context, rule: this, }), })
      )
      .filter(r => r.result.valid === false);

    if (invalidStages.length) {
      return {
        valid: false,
        reason: `Invalid stages: ${invalidStages.map(e => `${e.stage.id} (${e.result.reason})`).join(', ')}`,
        actual: context,
      };
    }

    return {
      valid: true,
      reason: null,
      actual: context,
    };
  }

  private sortStages(stages: RuleStage[]): RuleStage[] {
    const stagesWithoutDependencies = stages.filter(
      stage => stage.dependsOn.length === 0
    );

    const sortedStageIds = stagesWithoutDependencies.map(s => s.id);
    while (sortedStageIds.length !== stages.length) {
      const availableStages = stages.filter(
        stage => (
          !sortedStageIds.includes(stage.id)
          && stage.dependsOn.every(
            stageId => sortedStageIds.includes(stageId)
          )
        )
      );

      if (!availableStages.length) {
        throw new Error('Invalid RuleStage dependencies detected');
      }

      sortedStageIds.push(
        ...availableStages.map(stage => stage.id)
      );
    }

    return sortedStageIds.map(
      stageId => stages.find(stage => stage.id === stageId)!
    );
  }

  private getEntryStageInputs(stage: RuleStage, ruleInputs: TRuleInputs, context: TRuleExecutorContext): TRuleStageInputs {
    const nodeInputs = stage.node.getMetadata(stage.createNodeContext(context)).inputs;

    return nodeInputs.reduce(
      (acc, input) => ({
        ...acc,
        [input.id]: this.getOutputById(ruleInputs, input.id),
      }),
      {}
    );
  }

  private getRuleStageInputs(stage: RuleStage, previousResults: TRuleStageResults): TRuleStageInputs {
    return stage.inputs.reduce(
      (acc, { ruleStageId, inputId, outputId, }) => ({
        ...acc,
        [inputId]: this.getOutputById(previousResults[ruleStageId].outputs, outputId),
      }),
      {}
    );
  }

  private getOutputById(outputs: Record<string, any>, id: string): any {
    const pathParts = id.split('.');
    const value = pathParts.reduce(
      (acc, pathPart) => acc?.[pathPart],
      outputs
    );

    return value;
  }
}
