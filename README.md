# Tinylink - URL Shortener

A full-stack URL shortener built with Node.js, Express, PostgreSQL, React, and TailwindCSS.

## Features
- Create short links with optional custom codes.
- Redirect to original URLs.
- Track click counts and last clicked timestamps.
- Dashboard to manage links.
- Stats page for individual links.

## Prerequisites
- Node.js (v14+)
- PostgreSQL

## Setup

### 1. Database
Create a PostgreSQL database (e.g., `tinylink`).
The table schema will be automatically created when the server starts.

### 2. Server
```bash
cd server
npm install
npm run dev
```

### 3. Client
```bash
cd client
npm install
npm run dev
```

## API Endpoints
- `GET /healthz`: Health check
- `POST /api/links`: Create link
- `GET /api/links`: List links
- `GET /api/links/:code`: Get link stats
- `DELETE /api/links/:code`: Delete link
- `GET /:code`: Redirect
