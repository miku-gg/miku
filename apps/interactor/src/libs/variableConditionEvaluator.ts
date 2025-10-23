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
 * @param globalVariables Array of global variables to check against
 * @param sceneVariables Array of scene variables to check against
 * @param characterVariables Array of character variables to check against
 * @returns true if ALL conditions pass (AND operator), true if no conditions exist
 */
export function evaluateVariableConditions(
  variableConditions: NovelV3.VariableCondition[],
  globalVariables: NovelV3.NovelVariable[],
  sceneVariables: NovelV3.NovelVariable[] = [],
  characterVariables: NovelV3.NovelVariable[] = [],
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

    // Resolve variable based on scope
    let variable: NovelV3.NovelVariable | undefined;

    switch (condition.scope) {
      case 'global':
        variable = globalVariables.find((v) => v.id === condition.variableId);
        break;
      case 'scene':
        variable = sceneVariables.find((v) => v.id === condition.variableId);
        break;
      case 'character':
        variable = characterVariables.find((v) => v.id === condition.variableId);
        break;
      default:
        // Fallback to global for backwards compatibility
        variable = globalVariables.find((v) => v.id === condition.variableId);
    }

    // If variable not found, condition fails
    if (!variable) {
      return false;
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
