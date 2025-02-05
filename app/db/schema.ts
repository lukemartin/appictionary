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
  enumeration,
} from '@rocicorp/zero';

const player = table('player')
  .columns({
    id: string(),
    name: string(),
    image: string(),
  })
  .primaryKey('id');

const game = table('game')
  .columns({
    id: string(),
    winner_id: string().optional(),
    status: enumeration<'drafting' | 'in progress' | 'complete'>(),
    date_started: number(),
  })
  .primaryKey('id');

const game_player = table('game_player')
  .columns({
    game_id: string(),
    player_id: string(),
  })
  .primaryKey('game_id', 'player_id');

const round = table('round')
  .columns({
    id: string(),
    game_id: string(),
    status: enumeration<'drafting' | 'in progress' | 'complete'>(),
    artist_id: string(),
    winner_id: string().optional(),
    answer: string(),
    drawing: string(),
  })
  .primaryKey('id');

const gameRelationships = relationships(game, ({ one, many }) => ({
  players: many(
    {
      sourceField: ['id'],
      destSchema: game_player,
      destField: ['game_id'],
    },
    {
      sourceField: ['player_id'],
      destSchema: player,
      destField: ['id'],
    }
  ),
  winner: one({
    sourceField: ['winner_id'],
    destSchema: player,
    destField: ['id'],
  }),
  rounds: many({
    sourceField: ['id'],
    destSchema: round,
    destField: ['game_id'],
  }),
}));

const roundRelationships = relationships(round, ({ one }) => ({
  game: one({
    sourceField: ['game_id'],
    destSchema: game,
    destField: ['id'],
  }),
  winner: one({
    sourceField: ['winner_id'],
    destSchema: player,
    destField: ['id'],
  }),
  artist: one({
    sourceField: ['artist_id'],
    destSchema: player,
    destField: ['id'],
  }),
}));

const playerRelationships = relationships(player, ({ one, many }) => ({
  games: many(
    {
      sourceField: ['id'],
      destSchema: game_player,
      destField: ['player_id'],
    },
    {
      sourceField: ['game_id'],
      destSchema: game,
      destField: ['id'],
    }
  ),
}));

export const schema = createSchema(1, {
  tables: [player, game, game_player, round],
  relationships: [gameRelationships, roundRelationships, playerRelationships],
});

export type Schema = typeof schema;
export type Player = Row<typeof schema.tables.player>;
export type Game = Row<typeof schema.tables.game>;
export type GamePlayer = Row<typeof schema.tables.game_player>;
export type Round = Row<typeof schema.tables.round>;

// The contents of your decoded JWT.
type AuthData = {
  sub: string | null;
};

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  return {};
});
