CREATE VIEW work_item_block_duration AS 
SELECT 
  *,
  EXTRACT(
    MINUTE FROM LEAD(revised, 1, CURRENT_TIMESTAMP) OVER (ORDER BY revised) - revised
  ) AS minutes
FROM work_item_block_revision;
