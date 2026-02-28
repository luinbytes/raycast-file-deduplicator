/**
 * CLI integration for file-deduplicator
 */

import { execFile } from "child_process";
import { promisify } from "util";
import { getPreferenceValues } from "@raycast/api";
import type { CLIOutput, Preferences } from "./types";

const execFileAsync = promisify(execFile);

/**
 * Get CLI path from preferences or use default
 */
export function getCLIPath(): string {
  const preferences = getPreferenceValues<Preferences>();
  return preferences.cliPath || "file-deduplicator";
}

/**
 * Scan a directory for duplicate files
 */
export async function scanForDuplicates(
  directory: string,
  options?: {
    recursive?: boolean;
    algorithm?: "sha256" | "md5" | "sha1";
    minSize?: number;
  },
): Promise<CLIOutput> {
  const cliPath = getCLIPath();
  const preferences = getPreferenceValues<Preferences>();

  const args = [
    "--dir",
    directory,
    "--json",
    "--recursive",
    String(options?.recursive ?? true),
    "--hash",
    options?.algorithm || preferences.algorithm || "sha256",
  ];

  if (options?.minSize) {
    args.push("--min-size", String(options.minSize));
  }

  try {
    const { stdout, stderr } = await execFileAsync(cliPath, args, {
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
      env: { ...process.env, _DEDUP_SPAWNED: "1" }, // Prevent double-click detection
    });

    // CLI outputs JSON to stdout, errors to stderr
    if (stderr && !stdout) {
      throw new Error(`CLI error: ${stderr}`);
    }

    const result: CLIOutput = JSON.parse(stdout);
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      // Check for common errors
      if (error.message.includes("ENOENT")) {
        throw new Error(
          "file-deduplicator CLI not found. Please install it or set the correct path in preferences.",
        );
      }
      throw error;
    }
    throw new Error("Failed to scan for duplicates");
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Get filename from full path
 */
export function getFilename(path: string): string {
  return path.split("/").pop() || path;
}
