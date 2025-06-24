# 🔗 Distributed URL Shortener with PostgreSQL Sharding

This project implements a simple URL shortener service using:

- **Node.js + Express** for the API
- **PostgreSQL** with three shards
- **Consistent hashing** (`hashring`) for distributing URLs across shards

---

## 🧠 Features

- Generate short unique IDs (`urlId`) for long URLs
- Store and retrieve URLs across multiple PostgreSQL instances using sharding
- Distribute traffic with consistent hashing to ensure minimal rebalancing
- Simple REST API

---

## 📂 Project Structure

url\_shortener/
├── index.js                # Main API server
├── Dockerfile              # PostgreSQL shard image
├── init.sql                # SQL script to create table
├── node\_modules/
└── package.json

---

## ⚙️ Setup Instructions

### 1. 🔧 Build and Run PostgreSQL Shards (3 Containers)

Each container listens on a different port (`5434`, `5435`, `5436`) and shares the same schema.

```bash
# Build your custom image (contains init.sql)
docker build -t pgshard .

# Run three PostgreSQL shard containers
docker run --name pgshard1 -e POSTGRES_PASSWORD=postgres -p 5434:5432 -d pgshard
docker run --name pgshard2 -e POSTGRES_PASSWORD=postgres -p 5435:5432 -d pgshard
docker run --name pgshard3 -e POSTGRES_PASSWORD=postgres -p 5436:5432 -d pgshard
````

> 📝 Ensure `init.sql` contains:
>
> ```sql
> CREATE TABLE url_table (
>     id SERIAL PRIMARY KEY,
>     url TEXT,
>     url_id CHARACTER(5)
> );
> ```

---

### 2. 📦 Install Dependencies

```bash
npm install express pg hashring
```

---

### 3. 🚀 Start the Server

```bash
node index.js
```

The server will start at `http://localhost:8081`

---

## 📡 API Endpoints

### ➕ Create Short URL

```http
POST /?url=https://example.com
```

**Response:**

```json
{
  "urlId": "rhegB",
  "url": "https://example.com",
  "server": "5434"
}
```

---

### 🔍 Get Original URL

```http
GET /rhegB
```

**Response:**

```json
{
  "urlId": "rhegB",
  "url": "https://example.com",
  "server": "5434"
}
```

If not found: `404 Not Found`

---

## 🧠 How Sharding Works

- The system uses `sha256` hash of the input URL.
- The first 5 characters of the base64 hash become the `urlId`.
- That `urlId` is passed to a `HashRing` to determine the PostgreSQL shard.
- All reads/writes are routed to that specific shard.

---

## 🚀 Future Improvements

- Add URL expiration and cleanup
- Support custom aliases
- Add Redis caching for faster reads
- UI for managing short links
- Docker Compose for easier orchestration

---

## 🧑‍💻 Author

Adel Ashraf
📍 Alexandria, Egypt

---

## 📜 License

MIT License – use freely, learn a lot.
