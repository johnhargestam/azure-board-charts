IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AzureDashboardCharts')
BEGIN
  CREATE DATABASE AzureDashboardCharts;
END;
GO
