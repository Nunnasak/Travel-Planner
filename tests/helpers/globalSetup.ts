import { execSync } from "node:child_process";
import { getTestDatabaseUrl } from "./testDb";

export default function setup(): void {
  const url = getTestDatabaseUrl();

  execSync("npx prisma db push --accept-data-loss", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
