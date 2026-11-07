import { execSync } from "node:child_process";
import { getTestDatabaseUrl } from "./testDb";

/**
 * Creates the test database if it does not exist and syncs it to the Prisma
 * schema. Uses `db push` because the project has no migrations yet; switch to
 * `prisma migrate deploy` once `prisma/migrations` exists.
 */
export default function setup(): void {
  const url = getTestDatabaseUrl();

  // No --force-reset: each test truncates the tables itself (see resetDb).
  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
