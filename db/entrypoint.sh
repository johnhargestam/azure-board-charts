#!/usr/bin/env bash
set -m
./opt/mssql/bin/sqlservr & ./create_database.sh
fg
