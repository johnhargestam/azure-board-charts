#!/usr/bin/env bash
./opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P Password1 -i create_database.sql
echo 'Database AzureDashboardCharts created.'
