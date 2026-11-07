import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const DEFAULT_TEST_DATABASE_URL =
  "postgresql://travel_user:travel_password@localhost:5432/travel_planner_test?schema=public";

/**
 * Returns the connection URL for the test database.
 * Refuses any database whose name does not end in `_test`, because the
 * integration tests reset the schema and truncate every table.
 */
export function getTestDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL ?? DEFAULT_TEST_DATABASE_URL;
  const dbName = new URL(url).pathname.replace(/^\//, "");

  if (!dbName.endsWith("_test")) {
    throw new Error(
      `Refusing to run integration tests against database "${dbName}". ` +
        `TEST_DATABASE_URL must point to a database whose name ends in "_test".`,
    );
  }

  return url;
}

export function createTestPrisma(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: getTestDatabaseUrl() });
  return new PrismaClient({ adapter });
}

const TABLES = [
  "ScheduleItem",
  "ScheduleMember",
  "Schedule",
  "Location",
  "City",
  "Province",
  "User",
];

export async function resetDb(prisma: PrismaClient): Promise<void> {
  const tableList = TABLES.map((table) => `"${table}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`);
}
