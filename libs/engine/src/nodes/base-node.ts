import { EPrimitive, TComplexType } from '../constants/types';

type TNodeOption = string;

type TNodeOptions = {
  [key: string]: TNodeOption
};

type TNodeInputOutput = {
  title: string,
  type: EPrimitive | TComplexType<any, any>,
};

type TNodeInputsOutputs = {
  [key: string]: TNodeInputOutput
};

type TNodeConfig = {
  id: string,
  title: string,
  description?: string,
  options?: TNodeOptions,
  inputs: TNodeInputsOutputs,
  outputs: TNodeInputsOutputs,
};

export abstract class BaseNode<TInput, TOutput> {
  protected __config: TNodeConfig;

  constructor(options: TNodeConfig) {
    this.__config = options;
  }

  abstract execute(input: TInput): Promise<TOutput> | TOutput;

  toJSON() {
    const nodeOptions = this.__config;
    if (!nodeOptions) {
      throw new Error('Failed to serialize node without options');
    }

    throw new Error('TODO: Implement serialization');
  }
}
export default BaseNode;
