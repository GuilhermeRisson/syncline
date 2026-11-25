import { describe, it } from "vitest";

describe("sync router (needs MySQL, see .env.example)", () => {
  it.todo("push applies ops and returns their opIds in acks");
  it.todo("pushing the same batch twice changes nothing the second time");
  it.todo("rejects ops whose HLC is too far ahead of the server clock");
  it.todo("pull returns changes in _seq order with nextCursor and hasMore");
});
