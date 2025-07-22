# Express.js on Vercel (Refactored)

## Features
- Domain-Driven Design (DDD) architecture
- PostgreSQL database connection
- Sequelize ORM
- TypeScript support

## Project Structure

```
src/
  domain/
    entities/
    repositories/
  application/
    services/
  infrastructure/
    db/
    orm/
  presentation/
    controllers/
```

## Setup

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgres://user:password@localhost:5432/dbname
   ```

3. **Run migrations (if any):**
   ```sh
   npx sequelize-cli db:migrate
   ```

4. **Start the development server:**
   ```sh
   npx ts-node src/presentation/controllers/server.ts
   ```

## Notes
- Make sure PostgreSQL is running and accessible.
- Adjust the `DATABASE_URL` as needed for your environment.