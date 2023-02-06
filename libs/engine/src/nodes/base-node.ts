import { EPrimitive, TComplexType } from '../constants/types';

type TNodeInputOutput = {
  name: string,
  type: EPrimitive | TComplexType<any, any>,
};

type TNodeInputsOutputs = {
  [key: string]: TNodeInputOutput
};

type TNodeConfig = {
  id: string,
  name: string,
  description?: string,
  inputs: TNodeInputsOutputs,
  outputs: TNodeInputsOutputs,
};

export abstract class BaseNode<TInput, TOutput> {
  readonly id: string;
  private name: string;
  private description?: string;
  private inputs: TNodeInputsOutputs;
  private outputs: TNodeInputsOutputs;

  constructor(options: TNodeConfig) {
    this.id = options.id;
    this.name = options.name;
    this.description = options.description;
    this.inputs = options.inputs;
    this.outputs = options.outputs;
  }

  abstract execute(input: TInput): Promise<TOutput> | TOutput;

  toJSON() {
    throw new Error('TODO: Implement serialization');
  }
}
export default BaseNode;
