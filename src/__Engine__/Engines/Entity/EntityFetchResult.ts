export type EntityFetchResult<T extends Record<string, unknown>> =
  | { entityId: string; components: T }
  | undefined;
