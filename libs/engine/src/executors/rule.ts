import Executor from '../common/executor';
import { TExecutorResult, TExecutorValidationResult } from '../types/common';
import { ENodeType } from '../types/node';
import { TRuleOptions, TRuleInputs, TRuleOutputs, TRuleExecutorContext } from '../types/rule';
import { ERuleStageReservedId, TRuleStageResults } from '../types/rule-stage';
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

  async execute(ruleInputs: TRuleInputs, context: TRuleExecutorContext): Promise<TRuleOutputs> {
    const ruleStageResults: TRuleStageResults = {
      [ERuleStageReservedId.ENTRY]: this.wrapRuleInputs(ruleInputs, context),
    };

    for (const stage of this.stages) {
      ruleStageResults[stage.id] = await stage.run(
        ruleStageResults,
        { ...context, rule: this, }
      );
    }

    ruleStageResults[ERuleStageReservedId.EXIT] = ruleStageResults[this.exitStage.id];

    return ruleStageResults;
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

  override validateInputs(inputs: TRuleInputs, context: TRuleExecutorContext): TExecutorValidationResult<TRuleInputs> {
    const nodeContext = this.entryStage.createNodeContext(context);

    const { inputs: requiredInputs, } = this.entryStage.node.getMetadata(nodeContext);

    const invalidInputs = requiredInputs
      .map(requiredInput => {
        if (!inputs[requiredInput.id]) {
          return { input: requiredInput, valid: false, reason: 'Missing', };
        }

        try {
          requiredInput.type.validate(
            requiredInput.type.wrap(inputs[requiredInput.id])
          );

          return { input: requiredInput, valid: true, };
        } catch (e) {
          const { message, } = e as Error;

          return { input: requiredInput, valid: false, reason: `Invalid (${message})`, };
        }
      })
      .filter(r => !r.valid);

    if (invalidInputs.length) {
      return {
        valid: false,
        reason: `One or more inputs is invalid: ${invalidInputs.map(i => `${i.input.id} (${i.reason})`).join(', ')}`,
        actual: inputs,
      };
    }

    return {
      valid: true,
      reason: null,
      actual: inputs,
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

  private wrapRuleInputs(ruleInputs: TRuleInputs, context: TRuleExecutorContext): TExecutorResult<any> {
    const nodeContext = this.entryStage.createNodeContext(context);

    const wrappedInputs = this.entryStage.node
      .getMetadata(nodeContext)
      .inputs
      .reduce(
        (acc, input) => ({
          ...acc,
          [input.id]: input.type.wrap(ruleInputs[input.id]),
        }),
        {}
      );

    return {
      executionTimeMs: 0,
      outputs: wrappedInputs,
    };
  }
}
