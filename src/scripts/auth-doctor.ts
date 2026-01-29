import fs from "fs";
import path from "path";
import { config as loadDotEnv } from "dotenv";
import { Pool } from "pg";

type CheckStatus = "pass" | "warn" | "fail";

type DoctorCheckResult = {
  readonly name: string;
  readonly status: CheckStatus;
  readonly messages: readonly string[];
};

type DrizzleJournalEntry = {
  readonly idx: number;
  readonly version: string;
  readonly when: number;
  readonly tag: string;
  readonly breakpoints: boolean;
};

type DrizzleJournal = {
  readonly version: string;
  readonly dialect: string;
  readonly entries: readonly DrizzleJournalEntry[];
};

type CliOptions = {
  readonly skipDb: boolean;
};

const DEFAULTS = {
  databaseUrl: "postgresql://postgres:postgres@localhost:5432/postgres",
  betterAuthSecret: "dev-better-auth-secret",
  googleClientId: "test-google-client-id",
  googleClientSecret: "test-google-client-secret",
  githubClientId: "test-github-client-id",
  githubClientSecret: "test-github-client-secret",
  nextPublicAppUrl: "http://localhost:3000",
} as const;

const parseCliOptions = (args: readonly string[]): CliOptions => {
  const skipDb: boolean = args.includes("--skip-db");
  return { skipDb };
};

const fileExists = (filePath: string): boolean => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const readUtf8 = (filePath: string): string => {
  return fs.readFileSync(filePath, { encoding: "utf8" });
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const isDrizzleJournalEntry = (value: unknown): value is DrizzleJournalEntry => {
  if (!isRecord(value)) return false;
  return (
    typeof value.idx === "number" &&
    typeof value.version === "string" &&
    typeof value.when === "number" &&
    typeof value.tag === "string" &&
    typeof value.breakpoints === "boolean"
  );
};

const isDrizzleJournal = (value: unknown): value is DrizzleJournal => {
  if (!isRecord(value)) return false;
  const entriesUnknown: unknown = value.entries;
  if (!Array.isArray(entriesUnknown)) return false;
  const entries: unknown[] = entriesUnknown;
  return (
    typeof value.version === "string" &&
    typeof value.dialect === "string" &&
    entries.every((entry: unknown) => isDrizzleJournalEntry(entry))
  );
};

const listFilesRecursively = (params: {
  readonly directoryPath: string;
  readonly extensions: readonly string[];
}): readonly string[] => {
  const entries: fs.Dirent[] = fs.readdirSync(params.directoryPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath: string = path.join(params.directoryPath, entry.name);
    if (entry.isDirectory()) {
      const nestedFiles: readonly string[] = listFilesRecursively({ directoryPath: fullPath, extensions: params.extensions });
      files.push(...nestedFiles);
      continue;
    }
    const ext: string = path.extname(entry.name).toLowerCase();
    if (params.extensions.includes(ext)) files.push(fullPath);
  }
  return files;
};

const runEnvCheck = (): DoctorCheckResult => {
  const messages: string[] = [];
  const required: readonly string[] = ["DATABASE_URL", "BETTER_AUTH_SECRET", "NEXT_PUBLIC_APP_URL"];
  const missing: string[] = required.filter((key: string) => !process.env[key] || String(process.env[key]).trim().length === 0);
  if (missing.length > 0) {
    messages.push(`Missing required env var(s): ${missing.join(", ")}`);
  }
  const databaseUrl: string = process.env.DATABASE_URL ?? "";
  const betterAuthSecret: string = process.env.BETTER_AUTH_SECRET ?? "";
  const nextPublicAppUrl: string = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (databaseUrl === DEFAULTS.databaseUrl) messages.push("DATABASE_URL is using the default placeholder value.");
  if (betterAuthSecret === DEFAULTS.betterAuthSecret) messages.push("BETTER_AUTH_SECRET is using the default placeholder value.");
  if (nextPublicAppUrl === DEFAULTS.nextPublicAppUrl) messages.push("NEXT_PUBLIC_APP_URL is using the default placeholder value.");
  const googleClientId: string = process.env.GOOGLE_CLIENT_ID ?? "";
  const googleClientSecret: string = process.env.GOOGLE_CLIENT_SECRET ?? "";
  if (googleClientId === DEFAULTS.googleClientId || googleClientSecret === DEFAULTS.googleClientSecret) {
    messages.push("Google OAuth credentials look like placeholders.");
  }
  const githubClientId: string = process.env.GITHUB_CLIENT_ID ?? "";
  const githubClientSecret: string = process.env.GITHUB_CLIENT_SECRET ?? "";
  if (githubClientId === DEFAULTS.githubClientId || githubClientSecret === DEFAULTS.githubClientSecret) {
    messages.push("GitHub OAuth credentials look like placeholders.");
  }
  const mailProviderRaw: string = (process.env.MAIL_PROVIDER ?? "RESEND").toUpperCase();
  const mailProvider: "RESEND" | "SMTP" | "UNKNOWN" = mailProviderRaw === "SMTP" ? "SMTP" : mailProviderRaw === "RESEND" ? "RESEND" : "UNKNOWN";
  if (mailProvider === "UNKNOWN") {
    messages.push(`MAIL_PROVIDER is not a supported value: ${mailProviderRaw}`);
  }
  if (mailProvider === "RESEND") {
    const resendApiKey: string | undefined = process.env.RESEND_API_KEY;
    const emailFrom: string | undefined = process.env.EMAIL_FROM;
    if (!resendApiKey || resendApiKey.trim().length === 0) messages.push("RESEND_API_KEY is not set (email flows will fail in production).");
    if (!emailFrom || emailFrom.trim().length === 0) messages.push("EMAIL_FROM is not set (email flows will fail in production).");
  }
  if (mailProvider === "SMTP") {
    const smtpHost: string = process.env.SMTP_HOST ?? "";
    const smtpPort: string = process.env.SMTP_PORT ?? "";
    if (smtpHost.trim().length === 0) messages.push("SMTP_HOST is not set.");
    if (smtpPort.trim().length === 0) messages.push("SMTP_PORT is not set.");
  }
  const status: CheckStatus = missing.length > 0 || mailProvider === "UNKNOWN" ? "fail" : messages.length > 0 ? "warn" : "pass";
  return { name: "Env vars", status, messages };
};

const runDbConnectivityCheck = async (): Promise<DoctorCheckResult> => {
  const databaseUrl: string | undefined = process.env.DATABASE_URL;
  if (!databaseUrl || databaseUrl.trim().length === 0) {
    return { name: "DB connectivity", status: "fail", messages: ["DATABASE_URL is not set."] };
  }
  const pool: Pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.query("select 1 as ok");
    await pool.end();
    return { name: "DB connectivity", status: "pass", messages: [] };
  } catch (err: unknown) {
    await pool.end();
    const message: string = err instanceof Error ? err.message : "Unknown error";
    return { name: "DB connectivity", status: "fail", messages: [message] };
  }
};

const runMigrationsCheck = (): DoctorCheckResult => {
  const messages: string[] = [];
  const journalPath: string = path.join(process.cwd(), "drizzle", "meta", "_journal.json");
  if (!fileExists(journalPath)) {
    return { name: "Migrations", status: "fail", messages: ["Missing drizzle/meta/_journal.json"] };
  }
  const raw: string = readUtf8(journalPath);
  const parsed: unknown = JSON.parse(raw) as unknown;
  if (!isDrizzleJournal(parsed)) {
    return { name: "Migrations", status: "fail", messages: ["drizzle/meta/_journal.json has an unexpected shape."] };
  }
  const journal: DrizzleJournal = parsed;
  if (journal.dialect !== "postgresql") messages.push(`Expected dialect "postgresql" but got "${journal.dialect}".`);
  if (journal.entries.length === 0) messages.push("No migration entries found in drizzle/meta/_journal.json.");
  const drizzleDir: string = path.join(process.cwd(), "drizzle");
  const existingSqlFiles: Set<string> = new Set(fs.readdirSync(drizzleDir).filter((name: string) => name.endsWith(".sql")));
  const missingSqlFiles: string[] = [];
  for (const entry of journal.entries) {
    const sqlFileName: string = `${entry.tag}.sql`;
    if (!existingSqlFiles.has(sqlFileName)) missingSqlFiles.push(sqlFileName);
  }
  if (missingSqlFiles.length > 0) {
    messages.push(`Journal references missing migration file(s): ${missingSqlFiles.join(", ")}`);
  }
  const status: CheckStatus = missingSqlFiles.length > 0 ? "fail" : messages.length > 0 ? "warn" : "pass";
  return { name: "Migrations", status, messages };
};

const runPremiumBoundaryCheck = (): DoctorCheckResult => {
  const srcDir: string = path.join(process.cwd(), "src");
  if (!fileExists(srcDir)) {
    return { name: "Premium overlay boundary", status: "warn", messages: ["src/ directory not found (skipping boundary scan)."] };
  }
  const files: readonly string[] = listFilesRecursively({ directoryPath: srcDir, extensions: [".ts", ".tsx", ".js", ".jsx"] });
  const offenders: string[] = [];
  for (const filePath of files) {
    const relPath: string = path.relative(process.cwd(), filePath);
    const scriptsPrefix: string = path.join("src", "scripts") + path.sep;
    if (relPath.startsWith(scriptsPrefix)) continue;
    const content: string = readUtf8(filePath);
    if (content.includes("premium-overlay")) offenders.push(relPath);
  }
  if (offenders.length > 0) {
    return { name: "Premium overlay boundary", status: "fail", messages: [`Found premium-overlay references in src/: ${offenders.join(", ")}`] };
  }
  return { name: "Premium overlay boundary", status: "pass", messages: [] };
};

const printResult = (result: DoctorCheckResult): void => {
  const label: string = result.status.toUpperCase();
  const header: string = `[${label}] ${result.name}`;
  console.log(header);
  for (const message of result.messages) console.log(`- ${message}`);
};

const main = async (): Promise<void> => {
  const opts: CliOptions = parseCliOptions(process.argv.slice(2));
  loadDotEnv({ path: path.join(process.cwd(), ".env") });
  console.log("auth:doctor");
  const results: DoctorCheckResult[] = [];
  results.push(runEnvCheck());
  results.push(runMigrationsCheck());
  results.push(runPremiumBoundaryCheck());
  if (!opts.skipDb) results.push(await runDbConnectivityCheck());
  for (const result of results) printResult(result);
  const hasFail: boolean = results.some((r: DoctorCheckResult) => r.status === "fail");
  if (hasFail) process.exitCode = 1;
};

void main();
