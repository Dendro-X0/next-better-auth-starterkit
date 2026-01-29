import fs from "fs";
import path from "path";
import { config as loadDotEnv } from "dotenv";

type CheckStatus = "pass" | "warn" | "fail";

type InstallStatus = "copied" | "skipped" | "overwritten";

type InstallFileResult = {
  readonly from: string;
  readonly to: string;
  readonly status: InstallStatus;
};

type InstallConflict = {
  readonly from: string;
  readonly to: string;
};

type InstallResult = {
  readonly copied: readonly InstallFileResult[];
  readonly conflicts: readonly InstallConflict[];
  readonly warnings: readonly string[];
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
  readonly overlayPath: string;
  readonly dryRun: boolean;
  readonly force: boolean;
};

type EnvCheckResult = {
  readonly status: CheckStatus;
  readonly messages: readonly string[];
};

const DEFAULTS = {
  overlayPath: path.join(process.cwd(), "premium-overlay"),
} as const;

const parseCliOptions = (args: readonly string[]): CliOptions => {
  const overlayFlagPrefix: string = "--overlay-path=";
  const overlayArg: string | undefined = args.find((arg: string) => arg.startsWith(overlayFlagPrefix));
  const overlayPath: string = overlayArg ? overlayArg.slice(overlayFlagPrefix.length) : DEFAULTS.overlayPath;
  const dryRun: boolean = args.includes("--dry-run");
  const force: boolean = args.includes("--force");
  return { overlayPath, dryRun, force };
};

const fileExists = (filePath: string): boolean => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const ensureDirExists = (dirPath: string, dryRun: boolean): void => {
  if (fileExists(dirPath)) return;
  if (dryRun) return;
  fs.mkdirSync(dirPath, { recursive: true });
};

const readUtf8 = (filePath: string): string => {
  return fs.readFileSync(filePath, { encoding: "utf8" });
};

const writeUtf8 = (params: { readonly filePath: string; readonly content: string; readonly dryRun: boolean }): void => {
  if (params.dryRun) return;
  fs.writeFileSync(params.filePath, params.content, { encoding: "utf8" });
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

const listFilesRecursively = (directoryPath: string): readonly string[] => {
  const entries: fs.Dirent[] = fs.readdirSync(directoryPath, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath: string = path.join(directoryPath, entry.name);
    if (entry.isDirectory()) {
      const nested: readonly string[] = listFilesRecursively(fullPath);
      files.push(...nested);
      continue;
    }
    files.push(fullPath);
  }
  return files;
};

const copyFileIdempotent = (params: {
  readonly from: string;
  readonly to: string;
  readonly dryRun: boolean;
  readonly force: boolean;
}): InstallFileResult | InstallConflict => {
  const targetDir: string = path.dirname(params.to);
  ensureDirExists(targetDir, params.dryRun);
  if (!fileExists(params.to)) {
    if (!params.dryRun) fs.copyFileSync(params.from, params.to);
    return { from: params.from, to: params.to, status: "copied" };
  }
  const fromContent: string = readUtf8(params.from);
  const toContent: string = readUtf8(params.to);
  if (fromContent === toContent) {
    return { from: params.from, to: params.to, status: "skipped" };
  }
  if (params.force) {
    if (!params.dryRun) fs.copyFileSync(params.from, params.to);
    return { from: params.from, to: params.to, status: "overwritten" };
  }
  return { from: params.from, to: params.to };
};

const isInstallFileResult = (value: InstallFileResult | InstallConflict): value is InstallFileResult => {
  return (value as InstallFileResult).status !== undefined;
};

const envCheck = (): EnvCheckResult => {
  const required: readonly string[] = ["DATABASE_URL", "BETTER_AUTH_SECRET", "NEXT_PUBLIC_APP_URL"];
  const missing: string[] = required.filter((key: string) => !process.env[key] || String(process.env[key]).trim().length === 0);
  const messages: string[] = [];
  if (missing.length > 0) messages.push(`Missing required env var(s): ${missing.join(", ")}`);
  const status: CheckStatus = missing.length > 0 ? "warn" : "pass";
  return { status, messages };
};

const readJson = (filePath: string): unknown => {
  const raw: string = readUtf8(filePath);
  return JSON.parse(raw) as unknown;
};

const patchDrizzleJournal = (params: {
  readonly overlayPatchDir: string;
  readonly targetDrizzleDir: string;
  readonly dryRun: boolean;
}): readonly string[] => {
  const messages: string[] = [];
  const journalPath: string = path.join(params.targetDrizzleDir, "meta", "_journal.json");
  if (!fileExists(journalPath)) {
    messages.push("Missing drizzle/meta/_journal.json (cannot patch Drizzle journal).");
    return messages;
  }
  const journalUnknown: unknown = readJson(journalPath);
  if (!isDrizzleJournal(journalUnknown)) {
    messages.push("drizzle/meta/_journal.json has an unexpected shape (cannot patch Drizzle journal).");
    return messages;
  }
  const journal: DrizzleJournal = journalUnknown;
  const patchEntriesFilePaths: readonly string[] = [
    path.join(params.overlayPatchDir, "journal-entry.json"),
    path.join(params.overlayPatchDir, "journal-entry-0006.json"),
    path.join(params.overlayPatchDir, "journal-entry-0007.json"),
  ];
  const patchEntries: DrizzleJournalEntry[] = [];
  for (const patchPath of patchEntriesFilePaths) {
    if (!fileExists(patchPath)) {
      messages.push(`Missing patch file: ${path.relative(process.cwd(), patchPath)}`);
      continue;
    }
    const patchUnknown: unknown = readJson(patchPath);
    if (!isDrizzleJournalEntry(patchUnknown)) {
      messages.push(`Patch file has unexpected shape: ${path.relative(process.cwd(), patchPath)}`);
      continue;
    }
    patchEntries.push(patchUnknown);
  }
  const existingTags: Set<string> = new Set(journal.entries.map((e: DrizzleJournalEntry) => e.tag));
  const currentMaxIdx: number = journal.entries.reduce((acc: number, entry: DrizzleJournalEntry) => Math.max(acc, entry.idx), -1);
  let nextIdx: number = currentMaxIdx + 1;
  const newEntries: DrizzleJournalEntry[] = [...journal.entries];
  for (const patchEntry of patchEntries) {
    if (existingTags.has(patchEntry.tag)) continue;
    const entry: DrizzleJournalEntry = {
      idx: nextIdx,
      version: journal.version,
      when: patchEntry.when,
      tag: patchEntry.tag,
      breakpoints: patchEntry.breakpoints,
    };
    nextIdx += 1;
    newEntries.push(entry);
    const verb: string = params.dryRun ? "Would append" : "Appended";
    messages.push(`${verb} Drizzle journal entry: ${patchEntry.tag}`);
  }
  if (newEntries.length === journal.entries.length) return messages;
  const updated: DrizzleJournal = { version: journal.version, dialect: journal.dialect, entries: newEntries };
  const content: string = `${JSON.stringify(updated, null, 2)}\n`;
  writeUtf8({ filePath: journalPath, content, dryRun: params.dryRun });
  return messages;
};

const runInstall = (opts: CliOptions): InstallResult => {
  const overlayRoot: string = path.resolve(opts.overlayPath);
  const overlaySrcDir: string = path.join(overlayRoot, "src");
  const overlayRootDir: string = path.join(overlayRoot, "root");
  const overlayPatchDir: string = path.join(overlayRoot, "drizzle-patch");
  const targetSrcDir: string = path.join(process.cwd(), "src");
  const targetDrizzleDir: string = path.join(process.cwd(), "drizzle");
  const targetRootDir: string = process.cwd();
  const warnings: string[] = [];
  if (!fileExists(overlaySrcDir)) warnings.push(`Overlay src not found: ${overlaySrcDir}`);
  if (!fileExists(overlayPatchDir)) warnings.push(`Overlay drizzle-patch not found: ${overlayPatchDir}`);
  if (!fileExists(targetSrcDir)) warnings.push(`Target src not found: ${targetSrcDir}`);
  if (!fileExists(targetDrizzleDir)) warnings.push(`Target drizzle not found: ${targetDrizzleDir}`);
  const copied: InstallFileResult[] = [];
  const conflicts: InstallConflict[] = [];
  if (fileExists(overlaySrcDir) && fileExists(targetSrcDir)) {
    const srcFiles: readonly string[] = listFilesRecursively(overlaySrcDir);
    for (const from of srcFiles) {
      const rel: string = path.relative(overlaySrcDir, from);
      const to: string = path.join(targetSrcDir, rel);
      const result: InstallFileResult | InstallConflict = copyFileIdempotent({ from, to, dryRun: opts.dryRun, force: opts.force });
      if (isInstallFileResult(result)) copied.push(result);
      else conflicts.push(result);
    }
  }
  if (fileExists(overlayRootDir)) {
    const rootFiles: readonly string[] = listFilesRecursively(overlayRootDir);
    for (const from of rootFiles) {
      const rel: string = path.relative(overlayRootDir, from);
      const to: string = path.join(targetRootDir, rel);
      const result: InstallFileResult | InstallConflict = copyFileIdempotent({ from, to, dryRun: opts.dryRun, force: opts.force });
      if (isInstallFileResult(result)) copied.push(result);
      else conflicts.push(result);
    }
  }
  if (fileExists(overlayPatchDir) && fileExists(targetDrizzleDir)) {
    const patchFiles: readonly string[] = listFilesRecursively(overlayPatchDir).filter((p: string) => p.endsWith(".sql"));
    for (const from of patchFiles) {
      const fileName: string = path.basename(from);
      const to: string = path.join(targetDrizzleDir, fileName);
      const result: InstallFileResult | InstallConflict = copyFileIdempotent({ from, to, dryRun: opts.dryRun, force: opts.force });
      if (isInstallFileResult(result)) copied.push(result);
      else conflicts.push(result);
    }
    const patchMessages: readonly string[] = patchDrizzleJournal({ overlayPatchDir, targetDrizzleDir, dryRun: opts.dryRun });
    warnings.push(...patchMessages);
  }
  return { copied, conflicts, warnings };
};

const printInstallSummary = (result: InstallResult): void => {
  const copiedCount: number = result.copied.filter((r: InstallFileResult) => r.status === "copied").length;
  const overwrittenCount: number = result.copied.filter((r: InstallFileResult) => r.status === "overwritten").length;
  const skippedCount: number = result.copied.filter((r: InstallFileResult) => r.status === "skipped").length;
  console.log(`Files: copied=${copiedCount} overwritten=${overwrittenCount} skipped=${skippedCount}`);
  if (result.conflicts.length > 0) {
    console.log("Conflicts:");
    for (const conflict of result.conflicts) console.log(`- ${conflict.to}`);
  }
  if (result.warnings.length > 0) {
    console.log("Notes:");
    for (const warning of result.warnings) console.log(`- ${warning}`);
  }
};

const main = (): void => {
  const opts: CliOptions = parseCliOptions(process.argv.slice(2));
  loadDotEnv({ path: path.join(process.cwd(), ".env") });
  console.log("auth:install");
  console.log(`overlay: ${path.resolve(opts.overlayPath)}`);
  console.log(`mode: ${opts.dryRun ? "dry-run" : "apply"}`);
  const envResult: EnvCheckResult = envCheck();
  for (const message of envResult.messages) console.log(`- ${message}`);
  const result: InstallResult = runInstall(opts);
  printInstallSummary(result);
  if (!opts.dryRun && result.conflicts.length > 0 && !opts.force) {
    console.log("Re-run with --force to overwrite conflicting files.");
    process.exitCode = 1;
    return;
  }
  console.log("Next:");
  console.log("- Run: pnpm db:migrate");
  console.log("- Set: PREMIUM_PLAN=pro");
};

main();
