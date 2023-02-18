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
