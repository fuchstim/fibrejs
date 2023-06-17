import { ZodSchema } from 'zod';
import { TValidationResult } from '../types/common';
import { FromZodErrorOptions, fromZodError } from 'zod-validation-error';
import zodToJsonSchema from 'zod-to-json-schema';

export function detectDuplicates(inputs: (string | { id: string })[]): string[] {
  const inputStrings = inputs.map(
    input => typeof input === 'string' ? input : input.id
  );

  return Array.from(
    new Set(
      inputStrings.filter(
        input => inputStrings.filter(i => i === input).length > 1
      )
    )
  );
}

export function validateAgainstSchema(schema: ZodSchema, data: unknown, options?: FromZodErrorOptions): TValidationResult {
  const parseResult = schema.safeParse(data);
  if (parseResult.success) {
    return { valid: true, reason: null, };
  }

  const { message: reason, } = fromZodError(parseResult.error, options);

  return { valid: false, reason, };
}

export function serializeSchema(schema: ZodSchema): string {
  return JSON.stringify(
    zodToJsonSchema(
      schema,
      { errorMessages: true, }
    )
  );
}
