import { TRuleOptions, TRuleInputs, TRuleOutput, TStageOutputs } from '../types/rule';
import { ERuleStageType } from '../types/rule-stage';
import RuleStage from './rule-stage';

export default class Rule {
  readonly id: string;
  readonly name: string;
  readonly stages: RuleStage[];

  constructor(options: TRuleOptions) {
    this.id = options.id;
    this.name = options.name;
    this.stages = this._sortStages(options.stages);

    const entryStages = this.stages.filter(
      stage => stage.type === ERuleStageType.ENTRY
    );
    const exitStages = this.stages.filter(
      stage => stage.type === ERuleStageType.EXIT
    );

    if (entryStages.length !== 1 || exitStages.length !== 1) {
      throw new Error('Invalid number of entry / exit RuleStages defined');
    }
  }

  get entryStage() {
    const entryStage = this.stages.find(
      stage => stage.type === ERuleStageType.ENTRY
    );
    if (!entryStage) { throw new Error(`Failed to find entry stage for rule ${this.id}`); }

    return entryStage;
  }

  get exitStage() {
    const exitStage = this.stages.find(
      stage => stage.type === ERuleStageType.EXIT
    );
    if (!exitStage) { throw new Error(`Failed to find exit stage for rule ${this.id}`); }

    return exitStage;
  }

  async execute(ruleInputs: TRuleInputs): Promise<TRuleOutput> {
    const stageOutputs: TStageOutputs = {};

    for (const stage of this.stages) {
      stageOutputs[stage.id] = await stage.execute(
        stageOutputs,
        stage.type === ERuleStageType.ENTRY ? ruleInputs : {}
      );
    }

    return {
      triggered: Boolean(stageOutputs[this.exitStage.id].result.value),
    };
  }

  private _sortStages(stages: RuleStage[]): RuleStage[] {
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
}
