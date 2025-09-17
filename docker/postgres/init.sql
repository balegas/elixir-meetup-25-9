-- PostgreSQL initialization script for logical replication setup

-- Create the main database if it doesn't exist
SELECT 'CREATE DATABASE invoice_manager_dev'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'invoice_manager_dev')\gexec

-- Create test database
SELECT 'CREATE DATABASE invoice_manager_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'invoice_manager_test')\gexec

-- Connect to the main database
\c invoice_manager_dev;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a replication user (optional, for future use)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'replicator') THEN
        CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replicator_password';
    END IF;
END
$$;

-- Grant necessary permissions for logical replication
GRANT CONNECT ON DATABASE invoice_manager_dev TO replicator;
GRANT USAGE ON SCHEMA public TO replicator;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO replicator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO replicator;

-- Connect to test database and set up extensions there too
\c invoice_manager_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
