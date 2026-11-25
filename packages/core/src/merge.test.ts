import { describe, it } from "vitest";

/*
 * GUIA
 * --------------------------------------------------------------------------
 * Para cada teste: monte uma ou mais Operation (veja o tipo em protocol.ts),
 * aplique com mergeRow e confira o resultado com expect().
 *
 * Dica: crie um helper `op(...)` no topo do arquivo para montar Operations
 * sem repetir todos os campos, como o helper `hlc` em hlc.test.ts.
 *
 * O último teste usa fast-check (instale com `pnpm add -D fast-check -w`).
 * Leia https://fast-check.dev/docs/introduction/ antes dele.
 */

describe("mergeRow", () => {
  it.todo("creates the row when it does not exist");
  it.todo("keeps both edits when two ops change different fields");
  it.todo("keeps the value with the higher HLC when two ops change the same field");
  it.todo("ignores patches after a tombstone (delete wins)");
  it.todo("is idempotent: applying the same op twice gives the same row");
  it.todo("property: any order of the same ops converges to the same row (fast-check)");
});
