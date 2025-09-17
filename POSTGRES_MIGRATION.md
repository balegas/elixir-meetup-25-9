# PostgreSQL Migration Guide

This guide will help you migrate your Phoenix application from SQLite to PostgreSQL with logical replication support.

## Prerequisites

- Docker and Docker Compose installed
- Elixir and Phoenix installed
- Your existing SQLite database file

## Step 1: Start PostgreSQL with Docker Compose

Start the PostgreSQL 17 database with logical replication enabled:

```bash
docker-compose up -d postgres
```

This will:

- Start PostgreSQL 17 with logical replication configured
- Create `invoice_manager_dev` and `invoice_manager_test` databases
- Enable necessary extensions (uuid-ossp, pgcrypto)
- Set up a replication user for future use
- Expose PostgreSQL on port 54321 (mapped from internal port 5432)

Optionally, start pgAdmin for database management:

```bash
docker-compose up -d pgadmin
```

Access pgAdmin at http://localhost:5050 (admin@example.com / admin)

## Step 2: Update Dependencies

The `mix.exs` file has been updated to use `postgrex` instead of `ecto_sqlite3`. Install the new dependencies:

```bash
mix deps.get
```

## Step 3: Update Configuration

All configuration files have been updated:

### Development (`config/dev.exs`)

- Uses PostgreSQL connection to localhost:54321
- Database: `invoice_manager_dev`
- Credentials: postgres/postgres

### Test (`config/test.exs`)

- Uses PostgreSQL connection to localhost:54321
- Database: `invoice_manager_test` (with partition support)
- Credentials: postgres/postgres

### Production (`config/runtime.exs`)

- Uses `DATABASE_URL` environment variable
- Supports IPv6 with `ECTO_IPV6` environment variable

## Step 4: Run Database Migrations

Create and migrate the PostgreSQL database:

```bash
# Create the database
mix ecto.create

# Run migrations
mix ecto.migrate
```

## Step 5: Migrate Data from SQLite (Optional)

If you have existing data in SQLite, use the migration script:

```bash
# Migrate data
./scripts/migrate_sqlite_to_postgres.exs

# Verify migration
./scripts/migrate_sqlite_to_postgres.exs verify
```

## Step 6: Test the Application

Start your Phoenix application:

```bash
mix phx.server
```

The application should now be running with PostgreSQL!

## PostgreSQL Features

### Logical Replication

The PostgreSQL instance is configured with logical replication enabled:

- `wal_level = logical`
- `max_wal_senders = 10`
- `max_replication_slots = 10`
- `max_logical_replication_workers = 10`

### Extensions Enabled

- `uuid-ossp`: UUID generation functions
- `pgcrypto`: Cryptographic functions

### Replication User

A `replicator` user has been created for logical replication with appropriate permissions.

## Environment Variables

For production, set these environment variables:

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/database
SECRET_KEY_BASE=your_secret_key_here

# Optional
POOL_SIZE=10
ECTO_IPV6=false
PHX_HOST=your-domain.com
PORT=4000
```

## Logical Replication Setup

To set up logical replication between databases:

1. **Create Publication** (on source database):

```sql
CREATE PUBLICATION invoice_pub FOR ALL TABLES;
```

2. **Create Subscription** (on target database):

```sql
CREATE SUBSCRIPTION invoice_sub
CONNECTION 'host=source_host dbname=source_db user=replicator password=replicator_password'
PUBLICATION invoice_pub;
```

3. **Monitor Replication**:

```sql
-- Check replication slots
SELECT * FROM pg_replication_slots;

-- Check subscription status
SELECT * FROM pg_subscription;

-- Check replication lag
SELECT * FROM pg_stat_replication;
```

## Troubleshooting

### Connection Issues

1. Ensure PostgreSQL is running:

```bash
docker-compose ps postgres
```

2. Check PostgreSQL logs:

```bash
docker-compose logs postgres
```

3. Test connection manually:

```bash
psql -h localhost -p 54321 -U postgres -d invoice_manager_dev
```

### Migration Issues

1. If migration fails, check the logs in the script
2. Ensure both databases are accessible
3. Verify data types compatibility

### Performance Tuning

The PostgreSQL configuration includes optimized settings for development. For production, consider adjusting:

- `shared_buffers`
- `effective_cache_size`
- `work_mem`
- `maintenance_work_mem`

## Backup and Restore

### Backup

```bash
docker-compose exec postgres pg_dump -U postgres invoice_manager_dev > backup.sql
```

### Restore

```bash
docker-compose exec -T postgres psql -U postgres invoice_manager_dev < backup.sql
```

## Stopping Services

To stop all services:

```bash
docker-compose down
```

To stop and remove volumes (⚠️ **This will delete all data**):

```bash
docker-compose down -v
```
