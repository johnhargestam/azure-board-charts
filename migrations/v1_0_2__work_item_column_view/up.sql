CREATE VIEW work_item_board_column AS
SELECT a.*
FROM work_item_board_column_revision a
LEFT JOIN work_item_board_column_revision b
  ON a.work_item_id = b.work_item_id
  AND a.revised < b.revised
WHERE b.work_item_id IS NULL;
