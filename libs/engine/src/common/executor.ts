import { TExecutorResult, TExecutorContext, TExecutorValidationResult } from '../types/common';

const MAX_CALL_STACK_SIZE = 100;

export default abstract class Executor<TInputs, TOutputs, TContext extends TExecutorContext> {
  private executorId: string;
  private executorType: string;

  constructor(id: string, type: string) {
    this.executorId = id;
    this.executorType = type;
  }

  protected abstract execute(inputs: TInputs, context: TContext): Promise<TOutputs> | TOutputs;

  async run(inputs: TInputs, parentContext: TContext): Promise<TExecutorResult<TInputs, TOutputs>> {
    const context = {
      ...parentContext,
      logger: parentContext.logger.ns(this.executorId),
      callStack: (parentContext.callStack ?? []).concat(this),
    };

    if (context.callStack.length > MAX_CALL_STACK_SIZE) {
      throw new Error(`Maximum executor call stack size (${100}) exceeded`);
    }

    context.logger.info(`Executing ${this.executorType}...`);

    const contextValidationResult = this.validateContext(context);
    if (!contextValidationResult.valid) {
      throw new Error(`Failed to execute ${this.executorType} ${this.executorId} with invalid context (${contextValidationResult.reason})`);
    }

    const inputValidationResult = this.validateInputs(inputs, context);
    if (!inputValidationResult.valid) {
      throw new Error(`Failed to execute ${this.executorType} ${this.executorId} with invalid inputs (${inputValidationResult.reason})`);
    }

    const startTime = process.hrtime.bigint();

    const outputs = await Promise.resolve(this.execute(inputs, context))
      .catch(error => {
        context.logger.error(`Failed to execute ${this.executorType} (${error.message})`, error.stack);

        throw new Error(`Failed to execute ${this.executorType} ${this.executorId} (${error.message})`);
      });

    const outputValidationResult = this.validateOutputs(outputs, context);
    if (!outputValidationResult.valid) {
      throw new Error(`${this.executorType} ${this.executorId} produced invalid outputs (${outputValidationResult.reason})`);
    }

    const endTime = process.hrtime.bigint();

    const executionTimeMs = Number((endTime - startTime) / BigInt(1_000_000));

    context.logger.info(`Executed ${this.executorType} in ${executionTimeMs}ms.`);

    return {
      executionTimeMs,
      inputs,
      outputs,
    };
  }

  validateContext(context: TContext): TExecutorValidationResult<TContext> {
    return { valid: true, reason: null, actual: context, };
  }

  validateInputs(inputs: TInputs, context: TContext): TExecutorValidationResult<TInputs> {
    return { valid: true, reason: null, actual: inputs, };
  }

  validateOutputs(outputs: TOutputs, context: TContext): TExecutorValidationResult<TOutputs> {
    return { valid: true, reason: null, actual: outputs, };
  }
}
