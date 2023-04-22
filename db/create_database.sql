IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'dashboard_widget_app')
BEGIN
  CREATE DATABASE [dashboard_widget_app];
  ALTER DATABASE [dashboard_widget_app] SET ALLOW_SNAPSHOT_ISOLATION ON;
END;
GO
