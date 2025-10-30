import { Middleware } from '@reduxjs/toolkit';
import { setNovelVariable } from './slices/novelSlice';
import { applyNumericOperation } from './lib/variableOperations';

const variableOperationsMiddleware: Middleware = (store) => (next) => (action: any) => {
  if (action && action.type === setNovelVariable.type && action.payload && Array.isArray(action.payload.variables)) {
    const state: any = store.getState();
    const banks: any[] = state.novel?.variableBanks || [];

    const mapped = action.payload.variables.map((v: any) => {
      const operation: 'SET' | 'ADD' | 'MULTIPLY' | 'DIVIDE' | undefined = v.operation;
      // If no operation or non-number, pass through unchanged
      if (!operation || typeof v.value !== 'number')
        return { variableId: v.variableId, bankId: v.bankId, value: v.value };

      const bank = banks.find((b: any) => b.id === v.bankId);
      const currentVar = bank?.variables.find((nv: any) => nv.id === v.variableId);
      const currentNumber =
        currentVar && currentVar.type === 'number' && typeof currentVar.value === 'number' ? currentVar.value : 0;
      const nextValue = applyNumericOperation(currentNumber, Number(v.value) || 0, operation);
      return { variableId: v.variableId, bankId: v.bankId, value: nextValue };
    });

    const newAction = { ...action, payload: { variables: mapped } };
    return next(newAction);
  }

  return next(action);
};

export default variableOperationsMiddleware;
