import { TExecutorResult, TExecutorContext } from '../types/common';

export default abstract class Executor<TInput, TOutput, TContext extends TExecutorContext> {
  private executorType: string;

  constructor(type: string) {
    this.executorType = type;
  }

  async run(inputs: TInput, context: TContext): Promise<TExecutorResult<TOutput>> {
    context.logger.info(`Executing ${this.executorType}...`);

    const startTime = process.hrtime.bigint();

    const output = await Promise.resolve(this.execute(inputs, context))
      .catch(error => {
        context.logger.error(`Failed to execute ${this.executorType}: ${error.message}`, error.stack);

        throw new Error(`Failed to execute ${this.executorType}: ${error.message}`);
      });

    const endTime = process.hrtime.bigint();

    const executionTimeMs = Number((endTime - startTime) / BigInt(1_000_000));

    context.logger.info(`Executed ${this.executorType} in ${executionTimeMs}ms.`);

    return {
      executionTimeMs,
      output,
    };
  }

  protected abstract execute(inputs: TInput, context: TContext): Promise<TOutput> | TOutput;
}
