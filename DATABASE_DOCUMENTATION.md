# Database Documentation - Harken v2

## Overview

The Harken v2 project uses **MySQL** as its primary database with **Sequelize ORM** for data modeling and operations. The database contains 123 tables supporting a comprehensive real estate appraisal platform.

## Database Technology Stack

### Core Components
- **Database**: MySQL 5.7
- **ORM**: Sequelize v6.37.3
- **Driver**: mysql2 v3.11.3
- **Schema**: 123 Sequelize models
- **Migrations**: Managed via `sequelize-cli`

### Connection Configuration

The database connection is configured in `packages/backend/src/config/db.ts`:

```typescript
const sequelize = new Sequelize(DATABASE, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    dialectOptions: {},
    port: DB_PORT,
    logging: false,
    pool: {
        max: 10,
        min: 1,
        acquire: 30000,
        idle: 10000,
    },
});
```

## Environment Configuration

Database connection parameters are managed through environment variables defined in `packages/backend/src/env.ts`:

```typescript
export const DATABASE = process.env.DATABASE;
export const DB_USERNAME = process.env.DB_USERNAME;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = Number(process.env.DB_PORT);
```

## Hosting by Environment

### Development Environment

**Local Docker Setup**
- **Image**: MySQL 5.7
- **Container**: `db`
- **Host**: localhost
- **Port**: 6033 (mapped from container port 3306)
- **Database Name**: `harkendev`
- **Root Password**: admin

**Docker Compose Configuration** (`packages/backend/docker-compose.yml`):
```yaml
services:
  db:
    image: mysql:5.7
    container_name: db
    environment:
      MYSQL_ROOT_PASSWORD: admin
      MYSQL_DATABASE: harkendev
    ports:
      - '6033:3306'
    volumes:
      - dbdata:/var/lib/mysql
```

**Database Management**
- **phpMyAdmin**: Available on port 8080
- **Upload Limits**: 500MB for large file imports
- **Memory Limit**: 900MB

### Test Environment

**Configuration** (`packages/backend/config/config.json`):
```json
{
  "test": {
    "username": "root",
    "password": "",
    "database": "harkendev",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

### Production Environment

**Configuration** (`packages/backend/config/config.json`):
```json
{
  "production": {
    "username": "root",
    "password": "",
    "database": "database_production",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

**Note**: Production environment uses environment variables for actual credentials and hosting details for security purposes.

## Database Schema Overview

The database contains **123 tables** organized into several functional areas:

### Core Tables
- **Users & Authentication**: `users`, `tokens`, `accounts`
- **Companies & Clients**: `company`, `clients`
- **Properties**: `properties`, `property_units`, `zoning`
- **Appraisals**: `appraisals`, `appraisal_files`, `appraisal_approaches`
- **Templates**: `template`, `template_configuration`, `template_scenarios`
- **Comparables**: `comps`, `res_comps`, `eval_*_comps`

### Key Model Files
All Sequelize models are located in `packages/backend/src/models/` and include:
- User management models
- Property and zoning models
- Appraisal workflow models
- Template and section models
- Comparable property models
- Evaluation approach models

## Connection Pool Settings

The database uses connection pooling for optimal performance:

```typescript
pool: {
    max: 10,        // Maximum connections
    min: 1,         // Minimum connections
    acquire: 30000, // Maximum time to get connection (30s)
    idle: 10000,    // Maximum idle time (10s)
}
```

## Development Setup

### Prerequisites
- Docker and Docker Compose
- Node.js 18+
- MySQL client (optional)

### Starting the Database
```bash
cd packages/backend
docker-compose up -d db
```

### Accessing phpMyAdmin
- URL: http://localhost:8080
- Server: db
- Username: root
- Password: admin

### Running Migrations
```bash
cd packages/backend
npx sequelize-cli db:migrate
```

## Cloud Integration

The project integrates with **AWS S3** for file storage, suggesting the production database may also be hosted on AWS infrastructure (likely RDS), though specific hosting details are managed through environment variables for security.

### AWS Components
- **S3**: File and image storage
- **Region**: Configurable via `S3_REGION`
- **Bucket**: Configurable via `S3_BUCKET`

## Security Considerations

- Database credentials are managed via environment variables
- Connection pooling prevents connection exhaustion
- JWT-based authentication with bcrypt password hashing
- Role-based authorization (SUPER_ADMINISTRATOR, ADMINISTRATOR, USER, DEV)

## Backup and Maintenance

- **Development**: Docker volumes persist data (`dbdata`)
- **Production**: Backup strategy should be implemented based on hosting provider
- **Migrations**: Version-controlled schema changes via Sequelize CLI

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Development database runs on port 6033 to avoid conflicts
2. **Connection Timeouts**: Pool settings handle connection management
3. **Memory Limits**: phpMyAdmin configured with 900MB memory limit for large operations

### Useful Commands
```bash
# Check database status
docker-compose ps

# View database logs
docker-compose logs db

# Connect to MySQL directly
mysql -h 127.0.0.1 -P 6033 -u root -p harkendev
```

---

*Last Updated: November 2025*
*Database Schema: 123 tables*
*Technology: MySQL 5.7 + Sequelize ORM*






