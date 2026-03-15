import { useRef, useCallback } from 'react';
import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  QueryKey,
} from '@tanstack/react-query';
import type { MutationFunctionContext } from '@tanstack/query-core';

/**
 * Options for `useQueuedMutation`.
 * Extends React Query's `UseMutationOptions` and requires a `mutationKey`
 * (used for deduplication keying).
 */
export interface QueuedMutationOptions<TData, TError, TVariables, TOnMutateResult>
  extends UseMutationOptions<TData, TError, TVariables, TOnMutateResult> {
  mutationKey: QueryKey;
}

/**
 * `useQueuedMutation` — wraps React Query's `useMutation` to guarantee:
 *
 * 1. **Synchronous optimistic updates**: `onMutate` is called synchronously
 *    before the `mutationFn` promise is dispatched (Requirement 7.1, 7.2).
 *
 * 2. **Deduplication**: an in-flight set keyed by `JSON.stringify(variables)`
 *    prevents duplicate API calls for identical payloads while one is pending
 *    (Requirement 7.3).
 *
 * 3. **Rollback on failure**: `onError` is invoked with the original context
 *    returned by `onMutate` so the optimistic update can be rolled back
 *    (Requirement 7.4).
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4
 */
export function useQueuedMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options: QueuedMutationOptions<TData, TError, TVariables, TOnMutateResult>,
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> {
  const { mutationKey, mutationFn, onMutate, onError, onSuccess, onSettled, ...rest } = options;

  // Set of serialised variable payloads currently in-flight.
  const inFlight = useRef<Set<string>>(new Set());

  const wrappedMutationFn = useCallback(
    async (variables: TVariables, context: MutationFunctionContext): Promise<TData> => {
      const key = JSON.stringify(variables);

      // Deduplication: skip if an identical call is already in-flight (Requirement 7.3)
      if (inFlight.current.has(key)) {
        // Return a promise that never resolves so React Query doesn't treat
        // this as a completed mutation — the in-flight call will settle normally.
        return new Promise<TData>(() => {});
      }

      inFlight.current.add(key);
      try {
        if (!mutationFn) {
          throw new Error('useQueuedMutation: mutationFn is required');
        }
        const result = await mutationFn(variables, context);
        return result;
      } finally {
        inFlight.current.delete(key);
      }
    },
    [mutationFn],
  );

  const wrappedOnMutate = useCallback(
    (
      variables: TVariables,
      context: MutationFunctionContext,
    ): TOnMutateResult | Promise<TOnMutateResult> => {
      // Call onMutate synchronously before the API call is dispatched (Requirement 7.1, 7.2)
      if (onMutate) {
        return onMutate(variables, context);
      }
      return undefined as unknown as TOnMutateResult;
    },
    [onMutate],
  );

  const wrappedOnError = useCallback(
    (
      error: TError,
      variables: TVariables,
      onMutateResult: TOnMutateResult | undefined,
      context: MutationFunctionContext,
    ): void => {
      // Invoke onError with the original context for rollback (Requirement 7.4)
      if (onError) {
        onError(error, variables, onMutateResult, context);
      }
    },
    [onError],
  );

  return useMutation<TData, TError, TVariables, TOnMutateResult>({
    ...rest,
    mutationKey,
    mutationFn: wrappedMutationFn,
    onMutate: wrappedOnMutate,
    onError: wrappedOnError,
    onSuccess,
    onSettled,
  });
}
