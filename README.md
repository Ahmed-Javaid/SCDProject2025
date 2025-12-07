**NodeVault**

A command-line password vault application built with Node.js and MongoDB.

**Features:**

* Add, list, update, and delete password records
* Search records by ID or name
* Sort records by name, ID, or creation date
* Export data to text file
* Automatic JSON backups
* MongoDB integration for persistent storage
* Docker containerization with Docker Compose

**Prerequisites:**

* Node.js 16 or higher
* Docker and Docker Compose
* MongoDB (local or Atlas)

**Installation – Running Locally:**

1. Clone the repository and install dependencies:

   ```
   git clone https://github.com/LaibaImran1500/SCDProject25.git
   cd SCDProject25
   npm install
   ```
2. Create a `.env` file based on `.env.example` and add your MongoDB connection string
3. Run the application:

   ```
   node main.js
   ```

**Using Docker Compose:**

1. Clone the repository:

   ```
   git clone https://github.com/LaibaImran1500/SCDProject25.git
   cd SCDProject25
   ```
2. Copy the environment file:

   ```
   cp .env.example .env
   ```
3. Edit `.env` and set your MongoDB credentials: MONGO_USERNAME, MONGO_PASSWORD
4. Start the containers:

   ```
   docker compose up -d
   ```
5. Run the application:

   ```
   docker compose exec nodevault node main.js
   ```
6. Stop the containers:

   ```
   docker compose down
   ```

**Docker Setup:**

* MongoDB: Database container with persistent storage
* NodeVault: Application container built from Dockerfile
* Containers communicate via a custom bridge network
* MongoDB data stored in a named volume for persistence

**Environment Variables:**

* `MONGO_USERNAME` – MongoDB username
* `MONGO_PASSWORD` – MongoDB password
* `MONGODB_URI` – Full MongoDB connection string (for local development)

**Project Structure:**

```
SCDProject25/
├── db/                    # Database modules
├── events/                # Event logging
├── main.js                # Application entry point
├── Dockerfile             # Container image definition
├── docker-compose.yml     # Service orchestration
└── .env.example           # Environment template
```

**Usage Menu:**

1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit

**Docker Commands:**

* Start services: `docker compose up -d`
* View logs: `docker compose logs -f`
* Stop services: `docker compose down`
* Rebuild images: `docker compose up -d --build`
