import { Surreal } from "deps";
import type { Result } from "deps";

import type { Person } from "~/models/person.ts";

export async function create(db: Surreal, person: Person): Promise<Person> {
  return await db.create<Person>("person", person);
}

export async function update(db: Surreal, person: Person): Promise<Person> {
  return await db.update<Person>(person.id!, person);
}

export async function select(db: Surreal): Promise<Person[]> {
  return await db.select<Person>("person");
}

export async function byIdentifier(
  db: Surreal,
  identifier: string,
): Promise<Person | null> {
  const result = await db.query<Result<[Person]>[]>(
    "SELECT * FROM type::table($tb) WHERE identifier = $identifier",
    { tb: "person", identifier },
  );

  console.log(byIdentifier.name, JSON.stringify(result));

  return result[0]?.result?.[0] || null;
}

type MarketingGroupCount = { marketing: boolean; count: number };

export async function marketingGroupCount(
  db: Surreal,
): Promise<MarketingGroupCount[]> {
  const result = await db.query<Result<[MarketingGroupCount]>[]>(
    "SELECT marketing, count() FROM type::table($tb) GROUP BY marketing",
    {
      tb: "person",
    },
  );

  return result.at(0)?.result || [];
}
