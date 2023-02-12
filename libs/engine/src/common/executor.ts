import { TExecutorResult, TExecutorContext, TExecutorValidationResult } from '../types/common';

export default abstract class Executor<TInput, TOutput, TContext extends TExecutorContext> {
  private executorId: string;
  private executorType: string;

  constructor(id: string, type: string) {
    this.executorId = id;
    this.executorType = type;
  }

  protected abstract execute(input: TInput, context: TContext): Promise<TOutput> | TOutput;

  async run(input: TInput, parentContext: TContext): Promise<TExecutorResult<TOutput>> {
    const context = {
      ...parentContext,
      logger: parentContext.logger.ns(this.executorId),
    };

    context.logger.info(`Executing ${this.executorType}...`);

    const inputValidationResult = this.validateInput(input, context);
    if (!inputValidationResult.valid) {
      throw new Error(`Failed to execute ${this.executorType} ${this.executorId} with invalid input`);
    }

    const startTime = process.hrtime.bigint();

    const output = await Promise.resolve(this.execute(input, context))
      .catch(error => {
        context.logger.error(`Failed to execute ${this.executorType}: ${error.message}`, error.stack);

        throw new Error(`Failed to execute ${this.executorType} ${this.executorId}: ${error.message}`);
      });

    const outputValidationResult = this.validateOutput(output, context);
    if (!outputValidationResult.valid) {
      throw new Error(`${this.executorType} ${this.executorId} produced invalid output`);
    }

    const endTime = process.hrtime.bigint();

    const executionTimeMs = Number((endTime - startTime) / BigInt(1_000_000));

    context.logger.info(`Executed ${this.executorType} in ${executionTimeMs}ms.`);

    return {
      executionTimeMs,
      output,
    };
  }

  validateContext(context: TContext): TExecutorValidationResult<TContext> {
    return { valid: true, actual: context, };
  }

  validateInput(input: TInput, context: TContext): TExecutorValidationResult<TInput> {
    return { valid: true, actual: input, };
  }

  validateOutput(output: TOutput, context: TContext): TExecutorValidationResult<TOutput> {
    return { valid: true, actual: output, };
  }
}
