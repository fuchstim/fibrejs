import BaseNode from '../nodes/base-node';

export enum EFlowStageType {
  ENTRY = 'ENTRY',
  MIDDLE = 'MIDDLE',
  EXIT = 'EXIT',
}

export type TFlowStageInput = {
  flowStageId: string,
  outputKey: string,
  inputKey: string,
};

export type TFlowStageOptions = {
  id: string,
  type: EFlowStageType,
  node: BaseNode<any, any>,
  inputs?: TFlowStageInput[]
};

export type TPreviousStageOutputs = {
  [stageId: string]: any
};

export default class FlowStage {
  readonly id: string;
  readonly type: EFlowStageType;
  private node: BaseNode<any, any>;
  private inputs?: TFlowStageInput[];
  private executed = false;

  constructor(options: TFlowStageOptions) {
    this.id = options.id;
    this.type = options.type;
    this.node = options.node;
    this.inputs = options.inputs;
  }

  get dependsOn() {
    return this.inputs?.map(input => input.flowStageId) ?? [];
  }

  async execute(previousOutputs: TPreviousStageOutputs, additionalNodeInputs = {}): Promise<any> {
    if (this.executed) {
      throw new Error('Cannot execute FlowStage that was already executed');
    }

    const nodeInputs = this.inputs?.reduce(
      (acc, { flowStageId, inputKey, outputKey, }) => ({
        ...acc,
        [inputKey]: previousOutputs[flowStageId][outputKey],
      }),
      additionalNodeInputs
    );

    const result = await this.node.execute(nodeInputs);
    this.executed = true;

    return result;
  }
}
