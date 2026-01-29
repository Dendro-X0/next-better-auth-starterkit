import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { config } from "dotenv";
import path from "path";

console.log("Migration script started.");

// Corrected to load .env from the project root
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading environment variables from: ${envPath}`);

const result = config({ path: envPath });

if (result.error) {
  console.error(`Error loading ${envPath} file:`, result.error);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL environment variable not found.");
  console.log(`Please ensure ${envPath} file exists and contains the DATABASE_URL.`);
  process.exit(1);
}

console.log("DATABASE_URL loaded successfully.");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

const main = async () => {
  try {
    console.log("Starting migration...");
    await migrate(db, { migrationsFolder: "drizzle" });
    console.log("Migration completed successfully.");
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    await pool.end();
    process.exit(1);
  }
};

main();
