#!/bin/bash
set -e
set -u

function create_user_and_database() {
    local database=$1
    echo "  Creating database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

create_user_and_database "auth_db" || true
create_user_and_database "product_db" || true
create_user_and_database "order_db" || true
create_user_and_database "config_db" || true
create_user_and_database "worker_db" || true
create_user_and_database "customer_db" || true
