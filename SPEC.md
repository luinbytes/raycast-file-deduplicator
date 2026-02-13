# Raycast File Deduplicator - Specification

## Overview

A Raycast extension that provides a native UI for the `file-deduplicator` Go CLI tool. Users can scan folders for duplicate files and take quick actions on results.

---

## MVP Scope

### Core Command: "Find Duplicates"

**User Flow:**
1. User opens Raycast and types "Find Duplicates"
2. User selects a folder to scan (via Raycast's file picker or default location preference)
3. Extension shells out to `file-deduplicator` CLI with appropriate flags
4. Results display as a Raycast-native list view, grouped by duplicate sets
5. User can take actions on individual files within each group

**MVP Features:**
- Folder selection via Raycast file picker
- JSON output parsing from CLI
- Grouped list view showing duplicate sets
- Quick actions per file (delete, trash, reveal in Finder)
- Progress indicator during scan
- Error handling for missing CLI, failed scans

---

## Architecture

### Technology Stack

```
┌─────────────────────────────────────────┐
│           Raycast Extension             │
│         (TypeScript/React)              │
├─────────────────────────────────────────┤
│  Commands    │  Preferences  │  Utils   │
│  (UI Logic)  │  (Settings)   │  (CLI)   │
└─────────────────────────────────────────┘
              │
              │ shell out via child_process
              ▼
┌─────────────────────────────────────────┐
│      file-deduplicator CLI (Go)         │
│   - Scans directories                   │
│   - Computes file hashes                │
│   - Returns JSON results                │
└─────────────────────────────────────────┘
```

### Extension Structure

```
raycast-file-deduplicator/
├── package.json          # Raycast extension config
├── tsconfig.json         # TypeScript config
├── README.md
├── SPEC.md               # This file
├── src/
│   ├── find-duplicates.tsx    # Main command
│   ├── lib/
│   │   ├── cli.ts             # CLI invocation & parsing
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── utils.ts           # Helper functions
│   └── components/
│       ├── DuplicateGroup.tsx # List item component
│       └── EmptyView.tsx      # Empty/error states
└── assets/
    └── extension-icon.png
```

### CLI Integration

The extension shells out to the `file-deduplicator` CLI:

```typescript
// Example CLI invocation
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function scanForDuplicates(folderPath: string): Promise<DuplicateGroup[]> {
  const cliPath = getPreference('cliPath') || 'file-deduplicator';
  const { stdout } = await execFileAsync(cliPath, [
    'scan',
    folderPath,
    '--format', 'json',
    '--algorithm', 'sha256'
  ]);
  
  return JSON.parse(stdout);
}
```

**CLI Requirements:**
- Must support `--format json` flag for machine-readable output
- Must return array of duplicate groups with file paths and metadata
- Must handle large directories efficiently (streaming output?)

---

## UI Design

### List View Structure

```
┌──────────────────────────────────────────────────┐
│  Find Duplicates                         [⌘K]   │
├──────────────────────────────────────────────────┤
│                                                  │
│  📁 Duplicate Group 1 (3 files, 2.4 MB each)    │
│    ├── 📄 photo-vacation.jpg                     │
│    │   ~/Photos/2024/January/photo-vacation.jpg  │
│    ├── 📄 photo-vacation (1).jpg                 │
│    │   ~/Downloads/photo-vacation (1).jpg        │
│    └── 📄 photo-vacation copy.jpg                │
│        ~/Desktop/photo-vacation copy.jpg         │
│                                                  │
│  📁 Duplicate Group 2 (2 files, 890 KB each)    │
│    ├── 📄 budget.xlsx                            │
│    │   ~/Documents/budget.xlsx                   │
│    └── 📄 budget-backup.xlsx                     │
│        ~/Documents/Backups/budget-backup.xlsx    │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Actions (per file)

| Action | Shortcut | Description |
|--------|----------|-------------|
| Move to Trash | `⌘ + T` | Move file to system trash |
| Delete Permanently | `⌘ + D` | Irreversibly delete file |
| Reveal in Finder | `⌘ + R` | Open Finder at file location |
| Copy Path | `⌘ + C` | Copy full path to clipboard |
| Open File | `⌘ + O` | Open with default app |

### Actions (per group)

| Action | Shortcut | Description |
|--------|----------|-------------|
| Keep First, Trash Rest | `⌘ + ⇧ + T` | Auto-keep first file, trash others |
| Keep First, Delete Rest | `⌘ + ⇧ + D` | Auto-keep first file, delete others |

---

## Preferences

| Preference | Type | Default | Description |
|------------|------|---------|-------------|
| CLI Path | string | `file-deduplicator` | Path to CLI binary (use default if in PATH) |
| Default Scan Location | string | `~` | Default folder to scan |
| Algorithm | select | `sha256` | Hash algorithm (sha256, md5, etc.) |
| Show Hidden Files | boolean | `false` | Include hidden files in scan |

---

## Error Handling

### Edge Cases to Handle

1. **CLI not found**
   - Show actionable error: "file-deduplicator CLI not found. Install from [link] or update CLI Path preference."
   
2. **Permission denied**
   - Show error with folder path, suggest running with permissions
   
3. **Empty folder**
   - Show friendly empty state: "No files found in selected folder"
   
4. **No duplicates**
   - Show success message: "No duplicates found! 🎉"
   
5. **Large directories**
   - Show progress indicator
   - Consider streaming results vs batch
   
6. **CLI crash/timeout**
   - Timeout after 60s (configurable?)
   - Show error with CLI output if available

---

## Decision Boundaries

### What I Can Decide (Implementer Autonomy)

- UI component structure and styling
- Exact wording of error messages
- Icon choices
- Internal code organization
- Default values for preferences
- Action keyboard shortcuts (within Raycast conventions)
- Progress indicator style
- Empty state messaging

### What to Ask Lu About

- CLI output format (JSON schema)
- Supported CLI flags and options
- Preferred default scan location
- Algorithm preference (sha256 vs faster options)
- Behavior for "Keep First" actions (which file to keep?)
- File deletion vs trash preference
- Any non-standard CLI behavior or gotchas
- Large file handling strategy
- Whether CLI supports streaming/progress updates

---

## Out of Scope (Future Enhancements)

- Real-time file monitoring
- Scheduled scans
- Cloud storage integration
- Custom duplicate detection rules
- File preview
- Batch operations across groups
- Undo support
- Scan history

---

## Success Criteria (MVP)

- [ ] Extension installs and runs in Raycast
- [ ] Can select a folder via file picker
- [ ] CLI invocation works correctly
- [ ] Results display in grouped list view
- [ ] At least 2 quick actions work (trash, reveal)
- [ ] Error states are handled gracefully
- [ ] Preferences are saved and respected

---

## Timeline Estimate

| Task | Estimate |
|------|----------|
| Extension setup (package.json, tsconfig) | 30 min |
| CLI integration layer | 1 hour |
| Find Duplicates command (basic) | 2 hours |
| List view with groups | 2 hours |
| Quick actions implementation | 1.5 hours |
| Preferences UI | 1 hour |
| Error handling & polish | 1.5 hours |
| Testing & debugging | 2 hours |
| **Total** | ~11.5 hours |

---

## References

- [Raycast Extension API](https://developers.raycast.com/)
- [file-deduplicator CLI](https://github.com/luinbytes/file-deduplicator)
- [Raycast File System APIs](https://developers.raycast.com/utils-reference/fs)
