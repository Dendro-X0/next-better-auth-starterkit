import fs from "fs";
import path from "path";

type CliOptions = {
  readonly targetDir: string;
  readonly clean: boolean;
};

type FileSystemEntry = {
  readonly name: string;
  readonly absolutePath: string;
  readonly isDirectory: boolean;
};

const DEFAULTS = {
  targetDir: path.join(process.cwd(), ".tmp", "pro"),
} as const;

const parseCliOptions = (args: readonly string[]): CliOptions => {
  const targetFlagPrefix: string = "--target-dir=";
  const targetArg: string | undefined = args.find((arg: string) => arg.startsWith(targetFlagPrefix));
  const targetDir: string = path.resolve(targetArg ? targetArg.slice(targetFlagPrefix.length) : DEFAULTS.targetDir);
  const clean: boolean = args.includes("--clean");
  return { targetDir, clean };
};

const getDirectoryEntries = (directoryPath: string): readonly FileSystemEntry[] => {
  const entries: fs.Dirent[] = fs.readdirSync(directoryPath, { withFileTypes: true });
  const result: FileSystemEntry[] = [];
  for (const entry of entries) {
    result.push({ name: entry.name, absolutePath: path.join(directoryPath, entry.name), isDirectory: entry.isDirectory() });
  }
  return result;
};

const fileExists = (filePath: string): boolean => {
  try {
    fs.accessSync(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const ensureEmptyDirectory = (params: { readonly directoryPath: string; readonly clean: boolean }): void => {
  if (!fileExists(params.directoryPath)) {
    fs.mkdirSync(params.directoryPath, { recursive: true });
    return;
  }
  const existingEntries: readonly FileSystemEntry[] = getDirectoryEntries(params.directoryPath);
  if (existingEntries.length === 0) return;
  if (!params.clean) {
    throw new Error(`Target directory is not empty. Re-run with --clean: ${params.directoryPath}`);
  }
  fs.rmSync(params.directoryPath, { recursive: true, force: true });
  fs.mkdirSync(params.directoryPath, { recursive: true });
};

const shouldExclude = (relativePathFromSourceRoot: string): boolean => {
  const normalized: string = relativePathFromSourceRoot.split(path.sep).join("/");
  const firstSegment: string = normalized.split("/")[0] ?? "";
  if (firstSegment === ".git") return true;
  if (firstSegment === "node_modules") return true;
  if (firstSegment === ".next") return true;
  if (firstSegment === ".turbo") return true;
  if (firstSegment === ".vercel") return true;
  if (firstSegment === "coverage") return true;
  if (firstSegment === "dist") return true;
  if (firstSegment === ".tmp") return true;
  if (normalized === ".env") return true;
  if (normalized.endsWith("/.env")) return true;
  return false;
};

const ensureDirExists = (directoryPath: string): void => {
  if (fileExists(directoryPath)) return;
  fs.mkdirSync(directoryPath, { recursive: true });
};

const copyFile = (params: { readonly from: string; readonly to: string }): void => {
  ensureDirExists(path.dirname(params.to));
  fs.copyFileSync(params.from, params.to);
};

const copyDirectory = (params: { readonly sourceRoot: string; readonly sourcePath: string; readonly targetPath: string }): void => {
  ensureDirExists(params.targetPath);
  const entries: readonly FileSystemEntry[] = getDirectoryEntries(params.sourcePath);
  for (const entry of entries) {
    const relFromRoot: string = path.relative(params.sourceRoot, entry.absolutePath);
    if (shouldExclude(relFromRoot)) continue;
    const dest: string = path.join(params.targetPath, entry.name);
    if (entry.isDirectory) {
      copyDirectory({ sourceRoot: params.sourceRoot, sourcePath: entry.absolutePath, targetPath: dest });
      continue;
    }
    copyFile({ from: entry.absolutePath, to: dest });
  }
};

const main = (): void => {
  const opts: CliOptions = parseCliOptions(process.argv.slice(2));
  const sourceRoot: string = process.cwd();
  if (opts.targetDir === sourceRoot) {
    throw new Error("Refusing to assemble into the source repo root.");
  }
  ensureEmptyDirectory({ directoryPath: opts.targetDir, clean: opts.clean });
  copyDirectory({ sourceRoot, sourcePath: sourceRoot, targetPath: opts.targetDir });
  process.stdout.write(`Assembled Pro working tree into: ${opts.targetDir}\n`);
  process.stdout.write("Next (in target dir): pnpm install && pnpm auth:install -- --force\n");
};

try {
  main();
} catch (error: unknown) {
  const message: string = error instanceof Error ? error.message : "Unknown error";
  process.stderr.write(`assemble-pro failed: ${message}\n`);
  process.exitCode = 1;
}
