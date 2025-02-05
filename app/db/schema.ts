// These data structures define your client-side schema.
// They must be equal to or a subset of the server-side schema.
// Note the "relationships" field, which defines first-class
// relationships between tables.
// See https://github.com/rocicorp/mono/blob/main/apps/zbugs/src/domain/schema.ts
// for more complex examples, including many-to-many.

import {
  createSchema,
  definePermissions,
  type ExpressionBuilder,
  type Row,
  NOBODY_CAN,
  ANYONE_CAN,
  table,
  string,
  boolean,
  number,
  relationships,
} from '@rocicorp/zero';

const user = table('user')
  .columns({
    id: string(),
    name: string(),
    partner: boolean(),
  })
  .primaryKey('id');

export const schema = createSchema(1, {
  tables: [user],
  relationships: [],
});

export type Schema = typeof schema;
export type User = Row<typeof schema.tables.user>;

// The contents of your decoded JWT.
type AuthData = {
  sub: string | null;
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  return {};
});
