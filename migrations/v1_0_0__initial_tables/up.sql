CREATE TABLE [continuation_token] (
  [id] INT NOT NULL IDENTITY PRIMARY KEY,
  [value] VARCHAR(255) NOT NULL,
  [version] DATETIME NOT NULL,
);

CREATE TABLE [work_item_type] (
  [id] INT NOT NULL IDENTITY PRIMARY KEY,
  [name] VARCHAR(255) NOT NULL UNIQUE,
);

CREATE TABLE [work_item] (
  [id] INT NOT NULL PRIMARY KEY,
  [title] VARCHAR(255) NOT NULL,
  [created] DATETIME NOT NULL,
  [work_item_type_id] INT NOT NULL REFERENCES [work_item_type]([id]),
);

CREATE TABLE [tag] (
  [id] INT NOT NULL IDENTITY PRIMARY KEY,
  [name] VARCHAR(255) NOT NULL UNIQUE,
);

CREATE TABLE [work_item_tag] (
  [work_item_id] INT NOT NULL REFERENCES [work_item]([id]),
  [tag_id] INT NOT NULL REFERENCES [tag]([id]),
  PRIMARY KEY ([work_item_id], [tag_id]),
);

CREATE TABLE [state_category] (
  [id] INT NOT NULL PRIMARY KEY,
  [name] VARCHAR(255) NOT NULL UNIQUE,
);

CREATE TABLE [state] (
  [id] INT NOT NULL IDENTITY PRIMARY KEY,
  [name] VARCHAR(255) NOT NULL UNIQUE,
  [state_category_id] INT NOT NULL REFERENCES [state_category](Id),
);

CREATE TABLE [work_item_state_revision] (
  [work_item_id] INT NOT NULL REFERENCES [work_item]([id]),
  [effective] DATETIME NOT NULL,
  [state_id] INT NOT NULL REFERENCES [state]([id]),
  PRIMARY KEY ([work_item_id], [effective]),
);

CREATE TABLE [column] (
  [id] INT NOT NULL IDENTITY PRIMARY KEY,
  [name] VARCHAR(255) NOT NULL,
  [done] BIT NOT NULL,
  UNIQUE ([name], [done]),
);

CREATE TABLE [work_item_column_revision] (
  [work_item_id] INT NOT NULL REFERENCES [work_item]([id]),
  [effective] DATETIME NOT NULL,
  [column_id] INT NOT NULL REFERENCES [column]([id]),
  PRIMARY KEY ([work_item_id], [effective]),
);

CREATE TABLE [work_item_block_revision] (
  [work_item_id] INT NOT NULL REFERENCES [work_item]([id]),
  [effective] DATETIME NOT NULL,
  [blocked] BIT NOT NULL,
  PRIMARY KEY ([work_item_id], [effective]),
);
