export const spendApprovalListeners = new Map<string, { resolve: () => void; reject: () => void }>();

export function addApprovalListener(id: string, resolve: () => void, reject: () => void): void {
  spendApprovalListeners.set(id, { resolve, reject });
}

export function resolveApproval(id: string): void {
  const listener = spendApprovalListeners.get(id);
  if (listener) {
    listener.resolve();
    spendApprovalListeners.delete(id);
  }
}

export function rejectApproval(id: string): void {
  const listener = spendApprovalListeners.get(id);
  if (listener) {
    listener.reject();
    spendApprovalListeners.delete(id);
  }
}
