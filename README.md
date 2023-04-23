# Azure Board Charts

## Development

- Run the database from docker-compose.yml
- Run `yarn serve`

### Database migrations

Create folders in the `migrations` folder, with `up.sql` and `down.sql` files.

Commands:

- `yarn knex migrate:list` - list all migrations
- `yarn knex migrate:up` - apply next migration
- `yarn knex migrate:down` - rollback last migration
- `yarn knex migrate:latest` - apply all migrations
- `yarn knex migrate:rollback` - rollback all migrations

## Production

- Create an .env file with these keys
  ```env
  DB_URI=<DATABASE_SERVER_URI>
  DB_USER=<DATABASE_USERNAME>
  DB_PASSWORD=<DATABASE_PASSWORD>
  ```
- ...
