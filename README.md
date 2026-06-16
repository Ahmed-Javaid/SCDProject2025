# 🔐 NodeVault

A CLI-based record management system built with **Node.js** and **MongoDB**, containerised with Docker. NodeVault lets you add, list, update, delete, search, sort, and export named records — with automatic backups and real-time event logging on every write operation.

---

## 📋 Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [Option A — Docker Compose (Recommended)](#option-a--docker-compose-recommended)
  - [Option B — Local Development (MongoDB Atlas)](#option-b--local-development-mongodb-atlas)
- [Environment Variables](#environment-variables)
- [CLI Menu Reference](#cli-menu-reference)
- [Module Breakdown](#module-breakdown)
- [Auto-Backup System](#auto-backup-system)
- [Event System](#event-system)
- [Technologies Used](#technologies-used)

---

## ✨ Features

| Feature | Description |
|---|---|
| ➕ **Add Record** | Insert a named record with a generated ID and creation timestamp |
| 📄 **List Records** | View all stored records |
| ✏️ **Update Record** | Modify an existing record's name by ID |
| 🗑️ **Delete Record** | Remove a record by ID |
| 🔍 **Search Records** | Find records by ID or name (partial, case-insensitive) |
| 🔀 **Sort Records** | Sort by `name`, `id`, or `date` in ascending or descending order |
| 📤 **Export Data** | Dump all records to a formatted `export.txt` file |
| 📊 **Vault Statistics** | View total record count, longest name, and earliest/latest dates |
| 💾 **Auto Backup** | JSON snapshot saved to `/backups/` on every add or delete |
| 📡 **Event Logging** | Node.js `EventEmitter` logs every add, update, and delete to the console |

---

## 📁 Project Structure

```
SCDProject2025/
├── main.js                  # Entry point — CLI menu and user interaction
├── package.json             # Dependencies (mongodb, dotenv)
├── Dockerfile               # Node 18 Alpine Docker image
├── docker-compose.yml       # MongoDB + NodeVault multi-service setup
├── .env.example             # Template for environment variables
├── .gitignore
│
├── db/
│   ├── index.js             # Core CRUD logic — talks to MongoDB
│   ├── mongodb.js           # MongoDB connection management (singleton)
│   ├── record.js            # Record validation and ID generation
│   └── file.js              # Legacy file-based DB helper (vault.json)
│
├── events/
│   ├── index.js             # Shared EventEmitter instance
│   └── logger.js            # Event listeners for add/update/delete
│
└── data/
    └── vault.json           # Local JSON store (used by file.js)
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────┐
│           main.js               │
│   (CLI interface & menu loop)   │
└────────────────┬────────────────┘
                 │ calls
┌────────────────▼────────────────┐
│          db/index.js            │
│  (CRUD operations + backups)    │
└───────┬──────────────┬──────────┘
        │              │
┌───────▼──────┐  ┌────▼────────────┐
│ db/mongodb.js│  │  events/index.js │
│  (MongoDB    │  │  (EventEmitter)  │
│  connection) │  └────┬────────────┘
└───────┬──────┘       │ listened by
        │         ┌────▼────────────┐
        │         │ events/logger.js │
        │         │ (console logs)   │
        │         └─────────────────┘
┌───────▼──────────────────────────┐
│          MongoDB Database        │
│       collection: 'records'      │
└──────────────────────────────────┘
```

---

## 🛠️ Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) *(for containerised setup)*
- A MongoDB Atlas connection string *(for local development without Docker)*

---

## 🚀 Getting Started

### Option A — Docker Compose (Recommended)

This spins up both a **MongoDB 7** container and the **NodeVault** application container on a private bridge network.

**1. Clone the repository**
```bash
git clone https://github.com/Ahmed-Javaid/SCDProject2025.git
cd SCDProject2025
```

**2. Set up environment variables**
```bash
cp .env.example .env
# Edit .env and fill in your MONGO_USERNAME and MONGO_PASSWORD
```

**3. Start the services**
```bash
docker-compose up --build
```

**4. Attach to the running app container to use the CLI**
```bash
docker exec -it nodevault-compose node main.js
```

---

### Option B — Local Development (MongoDB Atlas)

**1. Install dependencies**
```bash
npm install
```

**2. Configure the environment**
```bash
cp .env.example .env
# Edit .env and set MONGODB_URI to your MongoDB Atlas connection string
```

**3. Run the app**
```bash
node main.js
```

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and populate the values:

```env
# Used by Docker Compose to create the MongoDB root user
MONGO_USERNAME=your_mongodb_username
MONGO_PASSWORD=your_mongodb_password

# Used for direct local connection (Option B)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority
```

> ⚠️ **Never commit your `.env` file.** It is excluded via `.gitignore`.

---

## 🖥️ CLI Menu Reference

When the app is running you will see:

```
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
Choose option:
```

| Option | Prompt(s) | Notes |
|--------|-----------|-------|
| `1` Add | `name` | Auto-generates a 6-digit ID and today's date |
| `2` List | — | Prints all records |
| `3` Update | `id`, `new name` | Finds by ID, updates name |
| `4` Delete | `id` | Removes by ID |
| `5` Search | `id` or `name`, keyword | Name search is case-insensitive regex |
| `6` Sort | field (`name`/`id`/`date`), order (`ascending`/`descending`) | |
| `7` Export | — | Writes `export.txt` to the project root |
| `8` Stats | — | Totals, longest name, date range |
| `9` Exit | — | Closes the MongoDB connection cleanly |

---

## 📦 Module Breakdown

### `main.js`
Entry point. Provides the interactive `readline`-based menu loop. Calls `db/*` functions and delegates to `exportData()` and `viewStatistics()` helpers for options 7 and 8.

### `db/index.js`
The core data-access layer. Implements all CRUD operations against MongoDB:
- **`addRecord`** — validates, inserts, triggers a backup, emits `recordAdded`
- **`listRecords`** — returns all documents
- **`updateRecord`** — `findOneAndUpdate` by ID, emits `recordUpdated`
- **`deleteRecord`** — find + delete + backup + emit `recordDeleted`
- **`searchRecords`** — exact ID match or regex name search
- **`sortRecords`** — maps `date` alias to `createdAt`, applies MongoDB sort
- **`createBackup`** — serialises the full collection to `/backups/backup_<timestamp>.json`

### `db/mongodb.js`
Singleton connection wrapper using the official `mongodb` driver. `connect()` is lazy (only opens once); `getCollection()` returns the `records` collection; `close()` tears down cleanly on exit.

### `db/record.js`
Pure utility functions:
- **`validateRecord`** — throws if `name` is missing
- **`generateId`** — returns a random 6-digit string (100000–999999)

### `db/file.js`
A legacy file-based persistence helper that reads/writes `data/vault.json`. Not used by the main MongoDB flow but available for local JSON storage.

### `events/index.js`
Exports a single shared `EventEmitter` instance used across the app.

### `events/logger.js`
Registers listeners on `recordAdded`, `recordUpdated`, and `recordDeleted` events. Prints a `[EVENT]` prefixed log line to the console for every mutation.

---

## 💾 Auto-Backup System

A JSON backup is created automatically **on every add and delete operation**. Backups are saved to:

```
backups/backup_YYYY-MM-DD_HH-MM-SS.json
```

The `backups/` directory is created at runtime if it doesn't exist. It is excluded from git via `.gitignore` to keep the repo clean.

---

## 📡 Event System

NodeVault uses Node.js's built-in `EventEmitter` to decouple persistence from logging:

```
db/index.js  ──emits──►  events/index.js (EventEmitter)
                                │
                    ◄──listens──┘
             events/logger.js  ──prints──►  console
```

This makes it straightforward to add new side-effects (e.g. writing to a log file, sending a webhook) without modifying the core CRUD logic — just add a new listener in `logger.js` or a separate module.

---

## 🧰 Technologies Used

| Technology | Role |
|---|---|
| **Node.js 18** | Runtime |
| **MongoDB 7** | Primary database |
| `mongodb` driver | Official Node.js MongoDB client |
| `dotenv` | Environment variable management |
| **Docker / Docker Compose** | Containerisation & orchestration |
| Node.js `readline` | Interactive CLI |
| Node.js `EventEmitter` | Internal event bus |
| Node.js `fs` | File exports and JSON backups |

---

## 📄 License

This project was created as part of a university Software Construction & Development course (SCD 2025).
