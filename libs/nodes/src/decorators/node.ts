/* eslint-disable @typescript-eslint/no-explicit-any */
import { EReflectMetaKey } from '../constants/reflect';
import { EPrimitive, TComplexType } from '../constants/types';

export type TNodeInputOutput = {
  title: string,
  type: EPrimitive | TComplexType<any, any>,
};

type TNodeInputsOutputs = {
  [key: string]: TNodeInputOutput
};

export interface INodeOptions {
  id: string,
  title: string,
  description?: string,
  inputs: TNodeInputsOutputs,
  outputs: TNodeInputsOutputs,
}

export abstract class ANode<TInput, TOutput> {
  abstract executor(input: TInput): TOutput;

  toJSON() {
    const nodeOptions = Reflect.get(this.constructor, EReflectMetaKey.NODE_OPTIONS) as INodeOptions | undefined;
    if (!nodeOptions) {
      throw new Error('Failed to serialize node without options');
    }

    throw new Error('TODO: Implement serialization');
  }
}

export function Node<TNodeInput, TNodeOutput>(nodeOptions: INodeOptions) {
  return function<TTarget extends new (...args: unknown[]) => ANode<TNodeInput, TNodeOutput>> (target: TTarget) {
    Reflect.defineProperty(
      target,
      EReflectMetaKey.NODE_OPTIONS,
      { value: nodeOptions, }
    );
  };
}
