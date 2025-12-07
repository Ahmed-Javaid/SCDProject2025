# NodeVault - Secure Password Management System

A command-line password management system built with Node.js and MongoDB, featuring Docker containerization for easy deployment.

## 🚀 Features

- **CRUD Operations**: Add, list, update, and delete password records
- **Advanced Search**: Search records by ID or name
- **Flexible Sorting**: Sort by name, ID, or creation date (ascending/descending)
- **Data Export**: Export all records to a text file
- **Automatic Backups**: Timestamped JSON backups
- **Vault Statistics**: View record counts and metadata
- **MongoDB Integration**: Persistent storage with MongoDB
- **Docker Support**: Containerized deployment with Docker Compose

## 📋 Prerequisites

- Node.js 16+ (for local development)
- Docker & Docker Compose (for containerized deployment)
- MongoDB Atlas account (or local MongoDB instance)

## 🛠️ Installation

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/LaibaImran1500/SCDProject25.git
   cd SCDProject25
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your MongoDB connection string
   ```

4. **Run the application**
   ```bash
   node main.js
   ```

### Docker Compose Deployment (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/LaibaImran1500/SCDProject25.git
   cd SCDProject25
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and set MongoDB credentials:
   # MONGO_USERNAME=your_username
   # MONGO_PASSWORD=your_password
   ```

3. **Start services**
   ```bash
   docker compose up -d
   ```

4. **Access the application**
   ```bash
   docker compose exec nodevault node main.js
   ```

5. **View logs**
   ```bash
   docker compose logs -f
   ```

6. **Stop services**
   ```bash
   docker compose down
   ```

## 🐳 Docker Compose Architecture

The application uses Docker Compose to orchestrate two services:

### Services

- **MongoDB**: Official `mongo:7.0` image
  - Port: `27017`
  - Volume: `mongodb-data` for persistence
  - Network: Custom bridge network with static IP
  - Healthcheck: Ensures database is ready before app starts

- **NodeVault**: Custom Node.js application
  - Based on `node:18-alpine`
  - Depends on MongoDB service
  - Environment variables from `.env` file
  - Auto-restart on failure

### Network Configuration

- **Custom bridge network**: `nodevault-network`
  - Subnet: `172.21.0.0/16`
  - Gateway: `172.21.0.1`
  - MongoDB: `172.21.0.10`
  - NodeVault: `172.21.0.20`

### Volume Management

- **mongodb-data**: Named volume for MongoDB persistence
  - Survives container restarts
  - Data persists across deployments

## 📦 Building Docker Image

```bash
# Build the image
docker build -t nodevault:v1.0 .

# Run manually (without Compose)
docker run -it --rm \
  -e MONGODB_URI="your_mongodb_connection_string" \
  nodevault:v1.0 node main.js
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_USERNAME` | MongoDB admin username | Yes (for Compose) |
| `MONGO_PASSWORD` | MongoDB admin password | Yes (for Compose) |
| `MONGODB_URI` | MongoDB connection string | Yes (for local dev) |
| `NODE_ENV` | Environment (production/development) | No |

## 📁 Project Structure

```
SCDProject25/
├── db/                     # Database modules
│   ├── index.js           # Database operations (CRUD, search, sort)
│   ├── mongodb.js         # MongoDB connection handler
│   ├── file.js            # File-based storage (legacy)
│   └── record.js          # Record model
├── events/                # Event handling
│   ├── index.js          # Event emitters
│   └── logger.js         # Logging functionality
├── backups/              # Automatic backup storage (gitignored)
├── data/                 # Local data files (gitignored)
├── main.js               # Application entry point
├── package.json          # Node.js dependencies
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Multi-container orchestration
├── .dockerignore         # Docker build exclusions
├── .env.example          # Environment variable template
└── .gitignore            # Git exclusions

```

## 🎯 Usage

### Menu Options

1. **Add Record**: Create a new password record
2. **List Records**: Display all stored records
3. **Update Record**: Modify an existing record
4. **Delete Record**: Remove a record
5. **Search Records**: Find records by ID or name
6. **Sort Records**: Sort by name, ID, or date (asc/desc)
7. **Export Data**: Export all records to `export.txt`
8. **View Statistics**: Display vault metadata
9. **Exit**: Close the application

### Docker Compose Commands

```bash
# Start services in background
docker compose up -d

# View service status
docker compose ps

# View logs (all services)
docker compose logs -f

# View logs (specific service)
docker compose logs -f mongodb
docker compose logs -f nodevault

# Execute commands in container
docker compose exec nodevault node main.js
docker compose exec mongodb mongosh -u admin -p yourpassword

# Restart services
docker compose restart

# Stop services (keeps volumes)
docker compose down

# Stop services and remove volumes (data loss!)
docker compose down -v

# Rebuild and restart
docker compose up -d --build
```

## 🔒 Security Notes

- **Never commit `.env` file** - Contains sensitive credentials
- **Use `.env.example`** - Template for environment variables
- **MongoDB credentials** - Change default passwords in production
- **Network isolation** - Containers communicate on private network
- **Volume encryption** - Consider encrypting volumes in production

## 🚀 Deployment Comparison

### Manual Deployment (70 minutes)
```bash
docker network create --driver bridge --subnet 172.20.0.0/16 nodevault-prod-network
docker volume create mongodb-data
docker run -d --name mongodb-prod --network nodevault-prod-network ...
docker run -d --name nodevault-prod --network nodevault-prod-network ...
```

### Docker Compose (5 seconds)
```bash
docker compose up -d
```

**Time Saved:** 99.9% reduction in deployment time!

## 📊 Statistics

- **Initial Setup Time**: 25 minutes (one-time)
- **Deployment Time**: 5 seconds
- **Configuration Files**: 1 (docker-compose.yml)
- **Commands Required**: 1 (docker compose up -d)

## 🐛 Troubleshooting

### Services Won't Start
```bash
docker compose logs
```

### Port Conflicts
Edit `docker-compose.yml` and change MongoDB port:
```yaml
ports:
  - "27018:27017"  # Use different host port
```

### Data Not Persisting
Ensure you're not using `-v` flag when stopping:
```bash
docker compose down     # ✅ Keeps volumes
docker compose down -v  # ❌ Deletes volumes
```

### Connection Errors
Check MongoDB is healthy:
```bash
docker compose ps
# STATUS should show "Up (healthy)" for mongodb
```

## 📄 License

This project is part of an academic assignment for Software Configuration & Deployment course.

## 👥 Author

- **Student ID**: i222530
- **Institution**: FAST-NUCES
- **Course**: Software Configuration & Deployment

## 🙏 Acknowledgments

- Node.js community for excellent packages
- MongoDB for reliable database solution
- Docker for containerization platform
- GitHub for version control and collaboration
