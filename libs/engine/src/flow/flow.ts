import FlowStage, { EFlowStageType } from './flow-stage';

type TFlowOptions = {
  id: string,
  name: string,
  stages: FlowStage[]
};

type TFlowInputOutputs = {
  [key: string]: any
};

export default class Flow {
  readonly id: string;
  readonly name: string;
  private stages: FlowStage[];

  constructor(options: TFlowOptions) {
    this.id = options.id;
    this.name = options.name;
    this.stages = options.stages;

    const entryStages = this.stages.filter(
      stage => stage.type === EFlowStageType.ENTRY
    );
    const exitStages = this.stages.filter(
      stage => stage.type === EFlowStageType.EXIT
    );

    if (entryStages.length !== 1 || exitStages.length !== 1) {
      throw new Error('Invalid number of entry / exit FlowStages defined');
    }
  }

  async execute(flowInputs: TFlowInputOutputs) {
    const sortedStages = this._sortStages(this.stages);
    const stageOutputs: TFlowInputOutputs = {};

    for (const stage of sortedStages) {
      stageOutputs[stage.id] = await stage.execute(
        stageOutputs,
        stage.type === EFlowStageType.ENTRY ? flowInputs : {}
      );
    }

    const exitStage = sortedStages.find(s => s.type === EFlowStageType.EXIT)!;

    return stageOutputs[exitStage.id];
  }

  private _sortStages(stages: FlowStage[]): FlowStage[] {
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
        throw new Error('Circular FlowStage reference detected');
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
