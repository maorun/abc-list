/**
 * Postinstall script: ensure @typescript-eslint packages use TypeScript 6.
 *
 * TypeScript 7 is a Go-based rewrite that no longer exports the classic
 * TypeScript compiler API (ts.Extension, ts.ModuleKind, etc.).
 * @typescript-eslint depends on that API at load time, so it crashes with TS7.
 *
 * This script creates a nested symlink inside each @typescript-eslint package
 * so that require('typescript') resolves to TypeScript 6 for those packages,
 * while the root project keeps TypeScript 7.
 *
 * The TypeScript 6 copy is installed via the "typescript-6" alias in
 * devDependencies (pinned to ^6.0.0) and symlinked into the right locations.
 * Older aliases ("typescript-eslint-compat-v6", "typescript-eslint-compat")
 * are checked as well for backwards compatibility, but only if they resolve
 * to a TypeScript 6 version.
 *
 * Remove this script once @typescript-eslint officially supports TypeScript 7.
 */

import {existsSync, mkdirSync, rmSync, symlinkSync} from "fs";
import {join, resolve} from "path";
import {fileURLToPath} from "url";
import {readFileSync} from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = resolve(__dirname, "..");
const nodeModules = join(rootDir, "node_modules");

/**
 * Returns the directory path if the package exists and its major version is < 7,
 * otherwise returns null.
 */
function findTs6Dir(packageName) {
  const dir = join(nodeModules, ...packageName.split("/"));
  if (!existsSync(dir)) return null;
  try {
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    const major = parseInt(pkg.version.split(".")[0], 10);
    return major < 7 ? dir : null;
  } catch {
    return null;
  }
}

// Preferred alias for TypeScript 6, then legacy fallbacks (only accepted when <7).
const resolvedTs6Dir =
  findTs6Dir("typescript-6") ??
  findTs6Dir("typescript-eslint-compat-v6") ??
  findTs6Dir("typescript-eslint-compat");

if (!resolvedTs6Dir) {
  console.log(
    "ℹ️  TypeScript 6 eslint compat package not found, skipping ESLint TS compat setup.",
  );
  process.exit(0);
}

// Check root typescript version
const rootTsPackageJson = join(nodeModules, "typescript", "package.json");
if (!existsSync(rootTsPackageJson)) {
  process.exit(0);
}

const rootTsVersion = JSON.parse(
  readFileSync(rootTsPackageJson, "utf8"),
).version;
const rootTsMajor = parseInt(rootTsVersion.split(".")[0], 10);

if (rootTsMajor < 7) {
  // Root TypeScript is already compatible — nothing to do
  process.exit(0);
}

console.log(
  `📦 Root TypeScript v${rootTsVersion} is incompatible with @typescript-eslint. Symlinking TypeScript 6 for ESLint...`,
);

// All packages that directly require('typescript') and need TypeScript 6
const packages = [
  "typescript-eslint",
  "@typescript-eslint/typescript-estree",
  "@typescript-eslint/parser",
  "@typescript-eslint/eslint-plugin",
  "@typescript-eslint/type-utils",
  "ts-api-utils",
];

for (const pkg of packages) {
  const pkgDir = join(nodeModules, ...pkg.split("/"));

  if (!existsSync(pkgDir)) {
    continue;
  }

  const nestedModulesDir = join(pkgDir, "node_modules");
  const typescriptLink = join(nestedModulesDir, "typescript");

  if (existsSync(typescriptLink)) {
    // Already set up (or is a real install) — skip
    try {
      const existing = JSON.parse(
        readFileSync(join(typescriptLink, "package.json"), "utf8"),
      );
      const existingMajor = parseInt(existing.version.split(".")[0], 10);
      if (existingMajor < 7) {
        console.log(`  ✅ ${pkg} already has TypeScript ${existing.version}`);
        continue;
      }
      // It points to TS7 — remove and replace
      rmSync(typescriptLink, {recursive: true, force: true});
    } catch {
      rmSync(typescriptLink, {recursive: true, force: true});
    }
  }

  mkdirSync(nestedModulesDir, {recursive: true});
  symlinkSync(resolvedTs6Dir, typescriptLink, "dir");
  console.log(`  ✅ Symlinked TypeScript 6 for ${pkg}`);
}

console.log("✅ ESLint TypeScript 6 compatibility setup complete.");
