# RustFS Object Storage: Complete Integration Guide

This guide explains how to integrate **RustFS** (a lightweight, high-performance S3-compatible object storage service written in Rust) into a modern **Next.js / Bun / PostgreSQL** stack. It covers configuration, client-side implementation, and container networking for both **Development** and **Production** environments.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Step-by-Step Client Setup (`storage.ts`)](#2-step-by-step-client-setup-storagets)
3. [Development Environment Setup](#3-development-environment-setup)
   - [Option A: Hybrid Dev (App on Host, Services in Docker) — _Recommended_](#option-a-hybrid-dev-app-on-host-services-in-docker--recommended)
   - [Option B: Full Docker Dev (App & Services in Docker)](#option-b-full-docker-dev-app--services-in-docker)
4. [Production Environment Setup](#4-production-environment-setup)
5. [How Connection Networking Works](#5-how-connection-networking-works)
6. [Testing the Connection](#6-testing-the-connection)
7. [Important Gotchas & Best Practices](#7-important-gotchas--best-practices)

---

## 1. Architecture Overview

RustFS serves as a local S3 alternative, enabling you to use the standard AWS S3 SDK without paying for AWS or exposing your development uploads to the public cloud.

```
┌────────────────────────────────────────────────────────┐
│ Host / Docker Network                                  │
│                                                        │
│  [Next.js App Client] -- S3 Protocol (HTTP) --> [RustFS]
│         │                                         │    │
│         │-- DB Protocol -> [PostgreSQL]           │    │
│                                                   v    │
│                              [.data/ Local Directory]  │
└────────────────────────────────────────────────────────┘
```

Because RustFS is fully S3-compatible, your application uses the standard `@aws-sdk/client-s3` library. The same code works seamlessly in both development (pointing to local RustFS) and production (pointing to production RustFS, MinIO, or AWS S3) simply by changing environment variables.

---

## 2. Step-by-Step Client Setup (`storage.ts`)

First, install the S3 client package in your target project:

```bash
bun add @aws-sdk/client-s3
```

Then, create a helper module `src/lib/storage.ts` to manage your storage client and automatically ensure the upload bucket exists:

```typescript
import { S3Client, CreateBucketCommand, HeadBucketCommand } from '@aws-sdk/client-s3';

// Initialize the S3Client configured for RustFS
export const s3Client = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT || 'http://localhost:9000',
  region: process.env.STORAGE_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY || 'pimp-dev-access-key',
    secretAccessKey: process.env.STORAGE_SECRET_KEY || 'pimp-dev-secret-key',
  },
  // CRITICAL: Path-style addressing is mandatory for self-hosted S3 backends like RustFS.
  // By default, SDK tries to request http://<bucket-name>.localhost:9000, which will fail.
  // With forcePathStyle: true, requests are correctly sent to http://localhost:9000/<bucket-name>.
  forcePathStyle: true,
});

export const BUCKET_NAME = process.env.STORAGE_BUCKET || 'my-app-uploads';

/**
 * Verifies that the required S3 bucket exists, and creates it if it doesn't.
 * Run this during application startup or right before handling an upload.
 */
export async function ensureBucketExists() {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
  } catch (error) {
    const s3Error = error as { name?: string; $metadata?: { httpStatusCode?: number } };

    // Check if the error is a 404 (Not Found)
    if (s3Error.name === 'NotFound' || s3Error.$metadata?.httpStatusCode === 404) {
      console.log(`Bucket "${BUCKET_NAME}" not found. Creating bucket...`);
      try {
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`Bucket "${BUCKET_NAME}" created successfully.`);
      } catch (createError) {
        console.error('Failed to create S3 bucket:', createError);
      }
    } else {
      console.error('Error checking S3 bucket existence:', error);
    }
  }
}
```

---

## 3. Development Environment Setup

For local development, you need your PostgreSQL database and the RustFS storage engine running. You can configure this in your project using two main strategies.

### Option A: Hybrid Dev (App on Host, Services in Docker) — _Recommended_

This is the standard, most performant way to build Next.js apps. The Next.js process runs natively on your machine via Bun for superfast Hot Module Replacement (HMR) and debugging, while the database and storage run in Docker.

#### 1. `.env.local` (Local environment variables)

Save this in your root folder. Since Next.js runs on the host machine, it accesses both services via `localhost`.

```env
# Next.js Port and URLs
PORT=3000
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=uOvjw4vT+zn5XPTlI1AyIvax/4stsvubb9AT56SAoUQ=

# Database connection pointing to exposed Docker port (5433)
DATABASE_URL=postgres://myuser:mypassword@localhost:5433/mydb

# Storage client pointing to local exposed RustFS port (9000)
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=my-dev-access-key
STORAGE_SECRET_KEY=my-dev-secret-key
STORAGE_BUCKET=my-app-uploads
```

#### 2. `compose.yaml` (Docker Compose for Dev Services)

This sets up PostgreSQL and RustFS, mapping the container ports to your host ports.

```yaml
name: myapp-dev

services:
  # 1. Database Service
  db:
    image: postgres:18-alpine3.23
    container_name: myapp-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
    ports:
      - '5433:5432' # Bind PostgreSQL container port 5432 to host port 5433
    volumes:
      - postgres_dev_data:/var/lib/postgresql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U myuser -d mydb']
      interval: 5s
      timeout: 5s
      retries: 5

  # 2. RustFS Storage Service
  rustfs:
    image: rustfs/rustfs:latest
    container_name: myapp-storage
    restart: unless-stopped
    ports:
      - '9000:9000' # S3 Client API port
      - '9001:9001' # Optional: Console UI port (if provided by storage engine)
    environment:
      - RUSTFS_ACCESS_KEY=my-dev-access-key
      - RUSTFS_SECRET_KEY=my-dev-secret-key
    volumes:
      # Mount a local directory to make it easy to inspect, backup or clear uploaded files on the host
      - ./.data:/data

volumes:
  postgres_dev_data:
```

Launch the stack with:

```bash
docker compose up -d
```

Then start Next.js on your machine:

```bash
bun run dev
```

---

### Option B: Full Docker Dev (App & Services in Docker)

If you prefer to run _everything_ inside Docker containers (including your Next.js frontend code), you must use **Docker internal DNS names** for container-to-container communication.

#### 1. `.env.local` inside Docker container

Since Next.js runs inside the Docker network, it communicates with other containers using their service names (`db` and `rustfs`) instead of `localhost`.

```env
DATABASE_URL=postgres://myuser:mypassword@db:5432/mydb
STORAGE_ENDPOINT=http://rustfs:9000
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=my-dev-access-key
STORAGE_SECRET_KEY=my-dev-secret-key
STORAGE_BUCKET=my-app-uploads
```

#### 2. `compose.dev-full.yaml`

This runs the full suite including code mounting so modifications update in real-time.

```yaml
name: myapp-full-dev

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: myapp-app
    restart: unless-stopped
    ports:
      - '3000:3000'
    volumes:
      - .:/app
      - /app/node_modules # Prevent host node_modules overriding container node_modules
    depends_on:
      db:
        condition: service_healthy
    environment:
      - DATABASE_URL=postgres://myuser:mypassword@db:5432/mydb
      - STORAGE_ENDPOINT=http://rustfs:9000
      - STORAGE_REGION=us-east-1
      - STORAGE_ACCESS_KEY=my-dev-access-key
      - STORAGE_SECRET_KEY=my-dev-secret-key
      - STORAGE_BUCKET=my-app-uploads
      - BETTER_AUTH_SECRET=uOvjw4vT+zn5XPTlI1AyIvax/4stsvubb9AT56SAoUQ=
      - BETTER_AUTH_URL=http://localhost:3000

  db:
    image: postgres:18-alpine3.23
    container_name: myapp-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
    volumes:
      - postgres_dev_data:/var/lib/postgresql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U myuser -d mydb']
      interval: 5s
      timeout: 5s
      retries: 5

  rustfs:
    image: rustfs/rustfs:latest
    container_name: myapp-storage
    restart: unless-stopped
    ports:
      - '9000:9000'
    environment:
      - RUSTFS_ACCESS_KEY=my-dev-access-key
      - RUSTFS_SECRET_KEY=my-dev-secret-key
    volumes:
      - ./.data:/data

volumes:
  postgres_dev_data:
```

#### 3. `Dockerfile.dev`

Use a lightweight development image that executes `bun run dev` with hot-reloading:

```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install
COPY . .
EXPOSE 3000
CMD ["bun", "run", "dev"]
```

---

## 4. Production Environment Setup

In production, Next.js runs in its compiled, standalone form. The services run inside a dedicated production compose network.

### `compose.prod.yaml`

```yaml
name: myapp-prod

services:
  # 1. Next.js Standalone Production App
  app:
    image: ${IMAGE_NAME:-ghcr.io/username/myapp-app:latest}
    container_name: myapp-app-prod
    restart: always
    ports:
      # Bind to localhost ONLY. Always place Next.js behind a reverse proxy (like Nginx, Caddy or Traefik)
      - '127.0.0.1:3000:3000'
    depends_on:
      db:
        condition: service_healthy
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      # Point to RustFS container via internal Docker DNS
      - STORAGE_ENDPOINT=http://rustfs:9000
      - STORAGE_REGION=${STORAGE_REGION:-us-east-1}
      - STORAGE_ACCESS_KEY=${STORAGE_ACCESS_KEY}
      - STORAGE_SECRET_KEY=${STORAGE_SECRET_KEY}
      - STORAGE_BUCKET=${STORAGE_BUCKET}
      - PORT=3000
    command: ['bun', 'server.js']

  # 2. Production PostgreSQL Database
  db:
    image: postgres:18-alpine3.23
    container_name: myapp-db-prod
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 5s
      timeout: 5s
      retries: 5

  # 3. Production RustFS Engine
  rustfs:
    image: rustfs/rustfs:latest
    container_name: myapp-storage-prod
    restart: always
    ports:
      # Bind API internally to localhost so external users cannot access storage engine bypasses,
      # or omit ports entirely if app container is the only one requesting it.
      - '127.0.0.1:9000:9000'
    environment:
      - RUSTFS_ACCESS_KEY=${STORAGE_ACCESS_KEY}
      - RUSTFS_SECRET_KEY=${STORAGE_SECRET_KEY}
    volumes:
      # Use a production-grade Docker volume for maximum IO performance and safe persistence
      - rustfs_prod_data:/data

volumes:
  postgres_prod_data:
  rustfs_prod_data:
```

### Production Environment Variables (`.env.production`)

Ensure you supply these variables dynamically using a secure server configuration or a secret vault:

```env
DATABASE_URL=postgres://prod_user:super_secure_db_pass@db:5432/prod_db
POSTGRES_DB=prod_db
POSTGRES_USER=prod_user
POSTGRES_PASSWORD=super_secure_db_pass

BETTER_AUTH_SECRET=a_very_long_secure_random_string_32_chars_or_more
BETTER_AUTH_URL=https://myapp.com

# Notice: Next.js connects internally to RustFS inside the Docker network.
STORAGE_ENDPOINT=http://rustfs:9000
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=prod_storage_admin_key
STORAGE_SECRET_KEY=prod_storage_secure_secret_key
STORAGE_BUCKET=myapp-prod-uploads
```

---

## 5. How Connection Networking Works

Understanding the networking flow is key to preventing common runtime bugs such as `ECONNREFUSED` or bucket initialization failures.

```
+-----------------------------------------------------------------------------------+
| PHYSICAL HOST (Your Laptop or Production Server)                                  |
|                                                                                   |
|  [ Option A: Next.js App (Local Process) ]                                        |
|        |                                                                          |
|        +-- connects via localhost:9000 ---> [ RustFS Container (Ports 9000:9000) ]|
|                                                    |                              |
|                                             Maps volumes to ./.data               |
|                                                    v                              |
|                                             [ Host folder ./.data ]               |
+-----------------------------------------------------------------------------------+

+-----------------------------------------------------------------------------------+
| DOCKER BRIDGE NETWORK (Option B / Production Compose Stack)                        |
|                                                                                   |
|  [ app Service Container ]                                                        |
|        |                                                                          |
|        +-- connects via http://rustfs:9000 --> [ rustfs Service Container ]       |
|                                                    |                              |
|                                             [ postgres Service Container ]        |
+-----------------------------------------------------------------------------------+
```

### The Rule of DNS Resolution in Containers

1. **Local Host Networking (Hybrid)**:
   When Next.js runs natively on your machine (`bun run dev`), it is outside of the Docker Bridge Network. It must refer to `localhost:5433` and `localhost:9000` because Docker forwards those host ports directly into the corresponding containers.
2. **Container-to-Container (Full Docker / Prod)**:
   When Next.js is running inside a Docker container (like the `app` service in production), it is part of the bridge network. Inside Docker, `localhost` refers to the **`app` container itself**, not the host. To talk to other containers, Docker provides built-in DNS resolving:
   - To connect to PostgreSQL: `db:5432`
   - To connect to RustFS: `rustfs:9000`

---

## 6. Testing the Connection

To confirm your RustFS client works perfectly, implement a simple endpoint in your app to upload test payloads. Here is a sample Next.js API Route handler (`src/app/api/storage-test/route.ts`):

```typescript
import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, ensureBucketExists } from '@/lib/storage';

export async function GET() {
  try {
    // 1. Ensure the bucket is created
    await ensureBucketExists();

    // 2. Put a test file in storage
    const testFilename = `test-${Date.now()}.txt`;
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: testFilename,
      Body: 'RustFS storage is connected and running perfectly!',
      ContentType: 'text/plain',
    });

    await s3Client.send(command);

    return NextResponse.json({
      success: true,
      message: `Successfully connected to RustFS and uploaded ${testFilename}`,
    });
  } catch (error) {
    console.error('Storage test failed:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
```

Visit `http://localhost:3000/api/storage-test` in your browser. If successful, you will see the `.txt` file appear in your local `./.data` directory!

---

## 7. Important Gotchas & Best Practices

### ⚠️ Crucial Gotcha: Path Style Addressing (`forcePathStyle: true`)

Standard AWS S3 operates on a **virtual-host style** (e.g., `https://my-bucket.s3.amazonaws.com`). Self-hosted S3 clones (like RustFS, MinIO, or LocalStack) do not support automatic subdomain routing on your local environment out of the box.
**You must set `forcePathStyle: true`** in your S3 client configuration, which structures requests as `http://localhost:9000/my-bucket` instead.

### 🔒 Restricting Exposed Ports in Production

In production, do not bind the database or RustFS to `0.0.0.0` (all interfaces).
Always use `127.0.0.1:9000:9000` or remove the `ports:` definition completely from `rustfs` and `db` if only the Next.js app needs to access them. This prevents direct access from malicious internet traffic and keeps your storage behind the safety of Next.js backend API routes or an authorized reverse-proxy.

### 📁 `.gitignore` Dev Data

Make sure your development storage volume folder isn't accidentally committed to Git:

```gitignore
# RustFS local storage folder
.data/
```

### ⚡ CORS Configuration

If you plan to allow direct frontend uploads to RustFS (via presigned URLs), configure the CORS policy in RustFS so browsers don't block the requests. Alternatively (and most securely), proxy all file uploads through Next.js API endpoints (`src/app/api/deliverables/upload/route.ts`), which completely avoids CORS overhead and lets you enforce authorization (e.g., via Better Auth) easily.
