export type VariableOperation = 'SET' | 'ADD' | 'MULTIPLY' | 'DIVIDE';

export function applyNumericOperation(
  currentValue: number,
  incomingValue: number,
  operation?: VariableOperation,
): number {
  const op = operation || 'SET';
  if (op === 'ADD') return currentValue + incomingValue;
  if (op === 'MULTIPLY') return currentValue * incomingValue;
  if (op === 'DIVIDE') return incomingValue === 0 ? 0 : currentValue / incomingValue;
  return incomingValue; // SET
}


