
/** Serialized hybrid logical clock: "<physical ms>:<counter>:<nodeId>". */
export type HlcString = string;

/** Field name -> HLC of the last write to that field. */
export type FieldClocks = Record<string, HlcString>;

/** Plain column values of a synced row (no control columns). */
export type RowValues = Record<string, unknown>;

/** A synced row as stored on both sides. */
export interface SyncedRow {
  id: string;
  values: RowValues;
  clocks: FieldClocks;
  deleted: boolean;
}

/** One local change, queued in the client outbox and sent on push. */
export interface Operation {
  opId: string;
  table: string;
  rowId: string;
  /** Only the fields that changed. */
  patch: RowValues;
  /** HLC for each field in `patch`. */
  clocks: FieldClocks;
  /** True when the operation is a delete (tombstone). */
  delete?: boolean;
}

export interface PushRequest {
  clientId: string;
  ops: Operation[];
}

export interface RejectedOperation {
  opId: string;
  reason: "clock_too_far_ahead" | "unknown_table" | "invalid_patch";
}

export interface PushResponse {
  acks: string[];
  rejected: RejectedOperation[];
  /** Server wall clock in ms, used by the client to update its HLC. */
  serverTime: number;
}

export interface Change {
  table: string;
  row: SyncedRow;
}

export interface PullResponse {
  changes: Change[];
  nextCursor: number;
  hasMore: boolean;
}
