CREATE DATABASE zstart;
CREATE DATABASE zstart_cvr;
CREATE DATABASE zstart_cdb;

\c zstart;

CREATE TABLE player (
    id VARCHAR PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT
);

INSERT INTO "player" (id, name, image) VALUES ('u1', 'luke', 'https://ca.slack-edge.com/TKB36QP5Y-U07RSQ6A2P6-6bda5ea08b60-512');
INSERT INTO "player" (id, name, image) VALUES ('u2', 'kat', 'https://ca.slack-edge.com/TKB36QP5Y-U048Z3PLJ2X-c0385f70757d-512');
INSERT INTO "player" (id, name, image) VALUES ('u3', 'adam', 'https://ca.slack-edge.com/TKB36QP5Y-U031Q9NFU2J-62c34da7af4c-512');
INSERT INTO "player" (id, name, image) VALUES ('u4', 'dot', 'https://ca.slack-edge.com/TKB36QP5Y-U06PEDX7XEG-1fec451b2ae3-512');
INSERT INTO "player" (id, name, image) VALUES ('u5', 'marco', 'https://ca.slack-edge.com/TKB36QP5Y-U02DQQ0E5DZ-cde975c0873b-512');
INSERT INTO "player" (id, name, image) VALUES ('u6', 'gosia', 'https://ca.slack-edge.com/TKB36QP5Y-U04K4RBFD7W-93392c14e268-512');
INSERT INTO "player" (id, name, image) VALUES ('u7', 'sam', 'https://ca.slack-edge.com/TKB36QP5Y-U011GHC94KW-7c01105491d4-512');
INSERT INTO "player" (id, name, image) VALUES ('u8', 'pete', 'https://ca.slack-edge.com/TKB36QP5Y-UKB3M2RA7-e1929026b7f7-512');
INSERT INTO "player" (id, name, image) VALUES ('u9', 'marlon', 'https://ca.slack-edge.com/TKB36QP5Y-U01S2V4994H-bdfef8546b71-512');


CREATE TABLE game (
    id VARCHAR PRIMARY KEY,
    winner_id VARCHAR NULL REFERENCES player(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('drafting', 'in progress', 'complete')) NOT NULL,
    date_started TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE game_player (
    game_id VARCHAR NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    player_id VARCHAR NOT NULL REFERENCES player(id) ON DELETE CASCADE,
    PRIMARY KEY (game_id, player_id)
);

CREATE TABLE round (
    id VARCHAR PRIMARY KEY,
    game_id VARCHAR NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('drafting', 'in progress', 'complete')) NOT NULL,
	artist_id VARCHAR REFERENCES player(id) ON DELETE SET NULL,
    winner_id VARCHAR NULL REFERENCES player(id) ON DELETE SET NULL,
    answer TEXT NOT NULL,
    drawing TEXT NOT NULL
);
