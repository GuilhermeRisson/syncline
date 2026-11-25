import { describe, it } from "vitest";

// Week 4: real server + MySQL, clients A and B with in-memory SQLite and a fake
// transport that can be switched offline. Every scenario ends by asserting that
// A, B and the server hold exactly the same state.
describe("two offline clients", () => {
  it.todo("1. edits to different fields of the same task both survive");
  it.todo("2. same field, B edits later: B's value wins everywhere");
  it.todo("3. same as 2 but A syncs last: B still wins (arrival order does not matter)");
  it.todo("4. A deletes, B edits offline: row ends deleted everywhere");
  it.todo("5. push applied but response lost, client resends: no duplicates");
  it.todo("6. server down for 3 attempts: outbox intact, backoff grows, sync completes");
  it.todo("7. client clock 1h ahead: op rejected with a clear reason");
  it.todo("8. pull while a local edit is pending: local edit kept until push");
});
