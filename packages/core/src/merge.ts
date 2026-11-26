import type { Operation, SyncedRow } from "./protocol.js";
import { compare, parse, type Hlc } from "./hlc.js";

/**
 * Apply an operation to the current row (or undefined if the row does not exist yet).
 * Field-level last-write-wins by HLC; a tombstone is final ("delete wins").
 */
export function mergeRow(current: SyncedRow | undefined, op: Operation): SyncedRow {

  if(current === undefined){
    return { id: op.rowId, values: { ...op.patch }, clocks: { ...op.clocks }, deleted: !!op.delete };
  }

  if(current.deleted){
    return current
  }

  if(op.delete){
    return { ...current, deleted: true };
  }

  const values = { ...current.values };
  const clocks = { ...current.clocks };
  
 for (const campo of Object.keys(op.patch)) {
    const novo = op.clocks[campo];
    const atual = clocks[campo];

    if (novo === undefined) {
      throw new Error(`Operação sem HLC para o campo "${campo}"`);
    }

    if (atual === undefined || compare(parse(novo), parse(atual)) > 0) {
      values[campo] = op.patch[campo];
      clocks[campo] = novo;
    }
  }
  return { ...current, values, clocks };

}
