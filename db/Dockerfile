FROM mcr.microsoft.com/mssql/server:2019-latest

COPY create_database.sql create_database.sql
COPY create_database.sh create_database.sh
COPY entrypoint.sh entrypoint.sh

CMD /bin/bash ./entrypoint.sh
