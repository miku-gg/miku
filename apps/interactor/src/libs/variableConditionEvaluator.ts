import { NovelV3 } from '@mikugg/bot-utils';

/**
 * Evaluates a single variable condition against an actual value
 * @param condition The variable condition to evaluate
 * @param actualValue The actual value of the variable
 * @returns true if the condition is met, false otherwise
 */
export function evaluateVariableCondition(
  condition: NovelV3.VariableCondition,
  actualValue: string | number | boolean,
): boolean {
  const { operator, value: expectedValue } = condition;

  let result: boolean;

  switch (operator) {
    case 'EQUAL':
      result = actualValue === expectedValue;
      return result;

    case 'NOT_EQUAL':
      result = actualValue !== expectedValue;
      return result;

    case 'LESS_THAN':
      // Only valid for numbers
      if (typeof actualValue === 'number' && typeof expectedValue === 'number') {
        result = actualValue < expectedValue;
        return result;
      }
      return false;

    case 'GREATER_THAN':
      // Only valid for numbers
      if (typeof actualValue === 'number' && typeof expectedValue === 'number') {
        result = actualValue > expectedValue;
        return result;
      }
      return false;

    default:
      return false;
  }
}

/**
 * Evaluates all variable conditions for an objective
 * @param variableConditions Array of variable conditions to evaluate
 * @param variableBanks Array of variable banks to check against
 * @returns true if ALL conditions pass (AND operator), true if no conditions exist
 */
export function evaluateVariableConditions(
  variableConditions: NovelV3.VariableCondition[],
  variableBanks: NovelV3.NovelVariableBank[],
): boolean {
  // If no variable conditions exist, return true (no additional requirements)
  if (!variableConditions || variableConditions.length === 0) {
    return true;
  }

  // Filter out conditions with no variable selected (empty variableId)
  const validConditions = variableConditions.filter((condition) => condition.variableId);

  // If no valid conditions after filtering, return true
  if (validConditions.length === 0) {
    return true;
  }

  // Check each condition - ALL must pass (AND operator)
  for (let i = 0; i < validConditions.length; i++) {
    const condition = validConditions[i];

    // Find the bank
    const bankId = condition.bankId || 'global-bank';
    const bank = variableBanks.find((b) => b.id === bankId);

    if (!bank) {
      return false; // Bank not found
    }

    // Find variable in the bank
    const variable = bank.variables.find((v) => v.id === condition.variableId);

    if (!variable) {
      return false; // Variable not found
    }

    // Evaluate the condition
    const conditionPassed = evaluateVariableCondition(condition, variable.value);

    // If any condition fails, the whole evaluation fails (AND operator)
    if (!conditionPassed) {
      return false;
    }
  }

  // All conditions passed
  return true;
}
