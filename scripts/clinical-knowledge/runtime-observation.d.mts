export const MAX_OBSERVATION_BYTES: number;
export type ObservationMetadata = {
  status: 'READY_FOR_REFERENCE_CHECKS' | 'INVALIDATES_REFERENCES' | 'UNAVAILABLE';
  reason: string | null;
  observedAt: string | null;
  snapshotHash: string | null;
};
export function loadRuntimeObservation(
  graph: unknown, registry: unknown, watchRegistry: unknown,
  options?: { path?: string | undefined; now?: string }
): {
  observations: Record<string, { rawSha256: string | null; available: boolean; checkedAt: string | null; currencyUnresolved: boolean }>;
  metadata: ObservationMetadata;
};
