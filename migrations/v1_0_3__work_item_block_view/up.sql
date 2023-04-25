CREATE VIEW work_item_block AS
SELECT a.*
FROM work_item_block_revision a
LEFT JOIN work_item_block_revision b
  ON a.work_item_id = b.work_item_id
  AND a.revised < b.revised
WHERE b.work_item_id IS NULL;
