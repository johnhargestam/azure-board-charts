CREATE TABLE continuation_token (
  id SERIAL PRIMARY KEY,
  value VARCHAR(255) NOT NULL,
  received TIMESTAMP NOT NULL
);

CREATE TYPE work_item_type AS ENUM (
  'Bug',
  'Product Backlog Item',
  'Feature',
  'Epic'
);

CREATE TABLE work_item (
  id INTEGER NOT NULL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  created TIMESTAMP NOT NULL,
  type work_item_type NOT NULL
);

CREATE TABLE tag (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE work_item_tag (
  work_item_id INTEGER NOT NULL REFERENCES work_item(id),
  tag_id INTEGER NOT NULL REFERENCES tag(id),
  PRIMARY KEY (work_item_id, tag_id)
);

CREATE TYPE state_category AS ENUM (
  'Proposed',
  'InProgress',
  'Completed',
  'Removed'
);

CREATE TABLE state (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  category state_category NOT NULL
);

CREATE TABLE board (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL
);

CREATE TYPE board_column_type AS ENUM (
  'incoming',
  'inProgress',
  'outgoing'
);

CREATE TABLE board_column (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  done BIT NOT NULL,
  column_type board_column_type NOT NULL,
  item_limit INTEGER NULL,
  sequence INTEGER NOT NULL,
  board_id UUID NOT NULL REFERENCES board(id),
  UNIQUE (name, done)
);

CREATE TABLE board_column_state_mapping (
  board_column_id INTEGER NOT NULL REFERENCES board_column(id),
  state_id INTEGER NOT NULL REFERENCES state(id),
  work_item_type work_item_type NOT NULL
);

CREATE TABLE work_item_state_revision (
  work_item_id INTEGER NOT NULL REFERENCES work_item(id),
  revised TIMESTAMP NOT NULL,
  state_id INTEGER NOT NULL REFERENCES state(id),
  PRIMARY KEY (work_item_id, revised)
);

CREATE TABLE work_item_board_column_revision (
  work_item_id INTEGER NOT NULL REFERENCES work_item(id),
  revised TIMESTAMP NOT NULL,
  board_column_id INTEGER NOT NULL REFERENCES board_column(id),
  PRIMARY KEY (work_item_id, revised)
);

CREATE TABLE work_item_block_revision (
  work_item_id INTEGER NOT NULL REFERENCES work_item(id),
  revised TIMESTAMP NOT NULL,
  blocked BIT NOT NULL,
  PRIMARY KEY (work_item_id, revised)
);
