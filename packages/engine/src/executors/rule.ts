import Executor from '../common/executor';
import { TValidationResult } from '../types/common';
import { ENodeType } from '../types/node';
import { TRuleOptions, TRuleInputs, TRuleOutputs, TRuleExecutorContext } from '../types/rule';
import { TRuleStageExecutorContext, TRuleStageResults } from '../types/rule-stage';
import RuleStage from './rule-stage';

export default class Rule extends Executor<TRuleInputs, TRuleOutputs, TRuleExecutorContext> {
  readonly id: string;
  readonly name: string;
  readonly sortedStages: RuleStage[][];

  constructor(options: TRuleOptions) {
    super(options.id, 'rule');

    this.id = options.id;
    this.name = options.name;
    this.sortedStages = this.sortStages(options.stages);

    const entryStages = this.stages.filter(stage => stage.node.type === ENodeType.ENTRY);
    const exitStages = this.stages.filter(stage => stage.node.type === ENodeType.EXIT);

    if (entryStages.length > 1 || exitStages.length > 1) {
      throw new Error('Invalid number of entry / exit stages defined');
    }
  }

  get stages() {
    return this.sortedStages.flat();
  }

  get entryStage() {
    return this.stages.find(stage => stage.node.type === ENodeType.ENTRY);
  }

  get exitStage() {
    return this.stages.find(stage => stage.node.type === ENodeType.EXIT);
  }

  createRuleStageContext(context: TRuleExecutorContext): TRuleStageExecutorContext {
    return {
      ...context,
      rule: this,
    };
  }

  async execute(ruleInputs: TRuleInputs, context: TRuleExecutorContext): Promise<TRuleOutputs> {
    const ruleStageResults: TRuleStageResults = {};

    for (const stages of this.sortedStages) {
      const stageExecutionPromises = stages.map(async stage => {
        const stageInputs = this.getStageInputs(stage, ruleInputs, ruleStageResults);

        const { outputs: ruleStageResult, } = await stage.run(
          stageInputs,
          this.createRuleStageContext(context)
        );

        ruleStageResults[stage.id] = ruleStageResult;
      });

      await Promise.all(stageExecutionPromises);
    }

    if (context.isPreview) {
      return {
        exitStageOutputs: this.exitStage ? ruleStageResults[this.exitStage.id].outputs : {},
        stageResults: ruleStageResults,
      };
    }

    return {
      exitStageOutputs: this.exitStage ? ruleStageResults[this.exitStage.id].outputs : {},
      stageResults: ruleStageResults,
    };
  }

  override validateContext(context: TRuleExecutorContext): TValidationResult {
    const invalidStages = this.stages
      .map(
        stage => ({
          stage,
          result: stage.validateContext(this.createRuleStageContext(context)),
        })
      )
      .filter(r => r.result.valid === false);

    if (invalidStages.length) {
      return {
        valid: false,
        reason: `Invalid stages: ${invalidStages.map(e => `${e.stage.id} (${e.result.reason})`).join(', ')}`,
      };
    }

    return {
      valid: true,
      reason: null,
    };
  }

  override validateInputs(inputs: TRuleInputs, context: TRuleExecutorContext): TValidationResult {
    if (!this.entryStage) {
      return {
        valid: true,
        reason: null,
      };
    }

    return this.entryStage.node.validateInputs(
      inputs,
      this.entryStage.createNodeContext(context)
    );
  }

  private sortStages(stages: RuleStage[]): RuleStage[][] {
    const stagesWithoutDependencies = stages.filter(
      stage => stage.dependsOn.length === 0
    );

    const sortedStageIds = [ stagesWithoutDependencies.map(s => s.id), ];
    while (sortedStageIds.flat().length !== stages.length) {
      const flatSortedStageIds = sortedStageIds.flat();

      const availableStages = stages.filter(
        stage => (
          !flatSortedStageIds.includes(stage.id)
          && stage.dependsOn.every(
            stageId => flatSortedStageIds.includes(stageId)
          )
        )
      );

      if (!availableStages.length) {
        throw new Error('Invalid rule stage dependencies detected');
      }

      sortedStageIds.push(
        availableStages.map(stage => stage.id)
      );
    }

    return sortedStageIds.map(
      stageIds => stages.filter(stage => stageIds.includes(stage.id))
    );
  }

  private getStageInputs(stage: RuleStage, ruleInputs: TRuleInputs, previousStageResults: TRuleStageResults) {
    if (stage.node.type === ENodeType.ENTRY) {
      return ruleInputs;
    }

    return stage.inputs.reduce(
      (acc, { ruleStageId, inputId, outputId, }) => ({
        ...acc,
        [inputId]: this.getOutputById(previousStageResults[ruleStageId].outputs, outputId),
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
