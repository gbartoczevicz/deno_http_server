import { validator } from "deps";

import { Person } from "~/models/person.ts";

export function internalToExternal(person: Person): Omit<Person, "id"> {
  const { id: _id, ...delegate } = person;

  return delegate;
}

export function validatorMiddlewareToInternal() {
  return validator((v) => ({
    person: {
      title: v.json("title"),
      name: {
        first: v.json("name.first").isRequired(),
        last: v.json("name.last").isRequired(),
      },
      marketing: v.json("marketing").asBoolean(),
    },
  }));
}
