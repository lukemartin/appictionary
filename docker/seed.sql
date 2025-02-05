CREATE DATABASE zstart;
CREATE DATABASE zstart_cvr;
CREATE DATABASE zstart_cdb;

\c zstart;

CREATE TABLE "user" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL,
  "partner" BOOLEAN NOT NULL
);


INSERT INTO "user" (id, name, partner) VALUES ('ycD76wW4R2', 'Luke', true);
