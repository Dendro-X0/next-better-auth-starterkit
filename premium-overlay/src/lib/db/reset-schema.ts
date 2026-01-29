import { db } from "./index";
import { sql } from "drizzle-orm";

/**
 * Reset and recreate database schema to match Better Auth expectations
 * This script will drop all tables and recreate them with the correct structure
 */
export async function resetSchema() {
  console.log("🔄 Resetting database schema...");

  try {
    // Drop all tables in the correct order (respecting foreign key constraints)
    await db.execute(sql`DROP TABLE IF EXISTS "verification" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "account" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "session" CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS "user" CASCADE`);

    console.log("✅ Dropped existing tables");

    // Create user table with all required fields for Better Auth + plugins
    await db.execute(sql`
      CREATE TABLE "user" (
        "id" text PRIMARY KEY,
        "name" text NOT NULL,
        "email" text NOT NULL UNIQUE,
        "email_verified" boolean DEFAULT false NOT NULL,
        "image" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "two_factor_enabled" boolean DEFAULT false NOT NULL,
        "two_factor_secret" text,
        "two_factor_backup_codes" text,
        "username" text UNIQUE
      )
    `);

    // Create session table
    await db.execute(sql`
      CREATE TABLE "session" (
        "id" text PRIMARY KEY,
        "expires_at" timestamp NOT NULL,
        "token" text NOT NULL UNIQUE,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL,
        "ip_address" text,
        "user_agent" text,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
      )
    `);

    // Create account table
    await db.execute(sql`
      CREATE TABLE "account" (
        "id" text PRIMARY KEY,
        "account_id" text NOT NULL,
        "provider_id" text NOT NULL,
        "password" text,
        "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "access_token" text,
        "refresh_token" text,
        "id_token" text,
        "access_token_expires_at" timestamp,
        "refresh_token_expires_at" timestamp,
        "scope" text,
        "created_at" timestamp NOT NULL,
        "updated_at" timestamp NOT NULL
      )
    `);

    // Create verification table
    await db.execute(sql`
      CREATE TABLE "verification" (
        "id" text PRIMARY KEY,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `);

    console.log("✅ Created new tables with correct schema");
    console.log("🎉 Database schema reset complete!");

  } catch (error) {
    console.error("❌ Error resetting schema:", error);
    throw error;
  }
}

// Run the reset if this file is executed directly
if (require.main === module) {
  resetSchema()
    .then(() => {
      console.log("Schema reset completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Schema reset failed:", error);
      process.exit(1);
    });
}
