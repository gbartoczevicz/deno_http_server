import { Hono, serve, Status, STATUS_TEXT, Surreal } from "deps";

import * as PersonDB from "~/db/person.ts";
import * as PersonAdapter from "~/adapter/person.ts";

const db = new Surreal("http://127.0.0.1:8000/rpc");

await db.signin({
  user: "root",
  pass: "root",
});

await db.use("test", "test");

const app = new Hono();

app.get("/persons", async (c) => {
  const persons = (await PersonDB.select(db)).map(
    PersonAdapter.internalToExternal,
  );

  const marketingGroupCount = await PersonDB.marketingGroupCount(db);

  return c.json(
    { persons, marketingGroupCount },
    Status.OK,
  );
});

app.post(
  "/persons",
  PersonAdapter.validatorMiddlewareToInternal(),
  async (c) => {
    await PersonDB.create(db, {
      ...c.req.valid().person,
      identifier: Math.random().toString(36).substring(2, 10),
    });

    return c.text(STATUS_TEXT[Status.Created], Status.Created);
  },
);

app.get("/persons/:identifier", async (c) => {
  const identifier = c.req.param("identifier");

  const person = await PersonDB.byIdentifier(db, identifier);

  if (!person) {
    return c.text(STATUS_TEXT[Status.NotFound], Status.NotFound);
  }

  return c.json(PersonAdapter.internalToExternal(person), Status.OK);
});

app.put(
  "/persons/:identifier",
  PersonAdapter.validatorMiddlewareToInternal(),
  async (c) => {
    const identifier = c.req.param("identifier");

    const person = await PersonDB.byIdentifier(db, identifier);

    if (!person) {
      return c.text(STATUS_TEXT[Status.NotFound], Status.NotFound);
    }

    await PersonDB.update(db, {
      ...c.req.valid().person,
      id: person.id!,
      identifier,
    });

    return c.json(STATUS_TEXT[Status.OK], Status.OK);
  },
);

const abortController = new AbortController();

abortController.signal.addEventListener("abort", (_) => {
  console.log("Aborting");

  db.close();

  Deno.exit();
});

serve(app.fetch, {
  port: 3333,
  onListen: (params) => console.log("Server Started", params),
  signal: abortController.signal,
});
