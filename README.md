# Express.js on Vercel (Simplified)

## Features
- Express.js serverless functions on Vercel
- Direct PostgreSQL database connection using `@vercel/postgres`
- TypeScript support

## Project Structure

```
api/
  index.ts      # Main serverless function handler
src/
  application/
    services/   # Business logic
  domain/
    entities/   # Data structures
```

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure environment variables in Vercel:**
   Create a `DATABASE_URL` environment variable in your Vercel project settings with the connection string from your Railway "Public URL".

## Notes
- This project is optimized to run on Vercel and uses the `@vercel/postgres` library for database access.
- Ensure your Railway database is accessible from public connections.