/**
 * Type definitions for file-deduplicator integration
 */

// CLI output structure matching Go JSON output
export interface CLIOutput {
  version: string;
  timestamp: string;
  config: CLIConfig;
  duplicate_count: number;
  total_space: number;
  duplicates: DuplicateGroup[];
}

export interface CLIConfig {
  Dir: string;
  Recursive: boolean;
  DryRun: boolean;
  Verbose: boolean;
  Workers: number;
  MinSize: number;
  Interactive: boolean;
  TUI: boolean;
  MoveTo: string;
  KeepCriteria: string;
  HashAlgorithm: string;
  FilePattern: string;
  ExportReport: boolean;
  UndoLast: boolean;
  PerceptualMode: boolean;
  PHashAlgorithm: string;
  SimilarityThreshold: number;
  JSON: boolean;
}

export interface DuplicateGroup {
  Hash: string;
  Size: number;
  Files: FileInfo[];
  Similarity: number;
}

export interface FileInfo {
  Path: string;
  Size: number;
  Hash: string;
  ModTime: string;
  PHash: string;
  Selected?: boolean;
}

// Raycast preferences
export interface Preferences {
  cliPath: string;
  defaultScanLocation: string;
  algorithm: "sha256" | "md5" | "sha1";
  showHiddenFiles: boolean;
}
