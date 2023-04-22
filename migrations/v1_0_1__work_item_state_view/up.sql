CREATE VIEW [work_item_state] AS
SELECT a.*
FROM [work_item_state_revision] a
LEFT JOIN [work_item_state_revision] b
  ON a.[work_item_id] = b.[work_item_id]
  AND a.[effective] < b.[effective]
WHERE b.[work_item_id] IS NULL;
