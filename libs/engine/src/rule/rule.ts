import RuleStage, { ERuleStageType } from './rule-stage';

type TRuleOptions = {
  id: string,
  name: string,
  stages: RuleStage[]
};

type TRuleInputs = {
  [key: string]: any
};
type TRuleOutput = {
  triggered: boolean
};

type TStageOutputs = TRuleInputs;

export default class Rule {
  readonly id: string;
  readonly name: string;
  readonly stages: RuleStage[];

  constructor(options: TRuleOptions) {
    this.id = options.id;
    this.name = options.name;
    this.stages = options.stages;

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

  async execute(ruleInputs: TRuleInputs): Promise<TRuleOutput> {
    const sortedStages = this._sortStages(this.stages);
    const stageOutputs: TStageOutputs = {};

    for (const stage of sortedStages) {
      stageOutputs[stage.id] = await stage.execute(
        stageOutputs,
        stage.type === ERuleStageType.ENTRY ? ruleInputs : {}
      );
    }

    const exitStage = sortedStages.find(s => s.type === ERuleStageType.EXIT)!;

    return {
      triggered: Boolean(stageOutputs[exitStage.id].result),
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
