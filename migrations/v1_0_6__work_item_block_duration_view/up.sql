CREATE VIEW [work_item_block_duration] AS 
SELECT 
  *,
  DATEDIFF(
    minute,
    [effective],
    LEAD(
      [effective], 1, CURRENT_TIMESTAMP
    ) OVER (
      ORDER BY [effective]
    )
  ) AS Minutes
FROM [work_item_block_revision];
