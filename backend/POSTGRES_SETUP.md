# PostgreSQL Setup Guide for Textura Web App

This guide helps you set up PostgreSQL correctly for the Textura web application.

## 1. Install PostgreSQL

### On Windows:
1. Download the PostgreSQL installer from the [official website](https://www.postgresql.org/download/windows/).
2. Run the installer and follow the setup wizard.
3. Remember the password you set for the `postgres` user.
4. Choose the default port (5432) when asked.
5. Complete the installation.

## 2. Create the Database

After installation, create the database for Textura:

### Using pgAdmin (GUI):
1. Open pgAdmin (installed with PostgreSQL)
2. Connect to the PostgreSQL server
3. Right-click on "Databases" and select "Create" > "Database"
4. Enter "textura_db" as the name and click "Save"

### Using Command Line:
```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE textura_db;

# Verify the database was created
\l

# Exit psql
\q
```

## 3. Configure Environment Variables

Update your `.env` file with the correct PostgreSQL credentials:

```
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password
DB_NAME=textura_db
DB_PORT=5432
```

## 4. Test the Connection

Run the database connection test:

```bash
npm run check-db
```

If successful, you should see: "✅ Database connection established successfully!"

## 5. Run Migrations

After confirming the connection works, run the database migrations:

```bash
npm run migrate
```

## 6. Troubleshooting

If you encounter connection issues:

1. **Authentication failed**: Double-check your password in the `.env` file
2. **Database does not exist**: Make sure you created `textura_db`
3. **Connection refused**: Ensure PostgreSQL service is running
4. **Role does not exist**: Verify the user exists in PostgreSQL (default is "postgres")

For Windows users, you can check if PostgreSQL is running:
1. Open Services (search for "services" in Windows)
2. Find "PostgreSQL" service
3. Ensure its status is "Running"
