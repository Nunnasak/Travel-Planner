import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";

const DEFAULT_TEST_DATABASE_URL =
  "postgresql://travel_user:travel_password@localhost:5432/travel_planner_test?schema=public";

export function getTestDatabaseUrl(): string {
  const url = process.env.TEST_DATABASE_URL || DEFAULT_TEST_DATABASE_URL;
  const dbName = new URL(url).pathname.replace(/^\//, "");

  if (!dbName.endsWith("_test")) {
    throw new Error(
      `Refusing to run integration tests against database "${dbName}". ` +
        `TEST_DATABASE_URL must point to a database whose name ends in "_test".`,
    );
  }

  return url;
}

function getTestSchema(): string {
  return new URL(getTestDatabaseUrl()).searchParams.get("schema") || "public";
}

export function createTestPrisma(): PrismaClient {
  const adapter = new PrismaPg(
    { connectionString: getTestDatabaseUrl() },
    { schema: getTestSchema() },
  );
  return new PrismaClient({ adapter });
}

export async function resetDb(prisma: PrismaClient): Promise<void> {
  const schema = getTestSchema();
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = ${schema} AND tablename <> '_prisma_migrations'
  `;
  if (rows.length === 0) return;

  const tables = rows.map(({ tablename }) => `"${schema}"."${tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
}
