#!/usr/bin/env bash
until ./opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P Password1 -Q "select 1" < /dev/null
do
  sleep 1
done
./opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P Password1 -i create_database.sql
