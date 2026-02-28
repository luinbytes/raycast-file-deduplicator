# Raycast File Deduplicator

A Raycast extension for finding and managing duplicate files using the [file-deduplicator](https://github.com/luinbytes/file-deduplicator) CLI tool.

## Features

- **Find Duplicates**: Scan any folder for duplicate files
- **Quick Actions**: Delete, move to trash, or reveal in Finder
- **Configurable**: Set default scan locations and CLI path

## Prerequisites

- [Raycast](https://www.raycast.com/) installed
- [file-deduplicator](https://github.com/luinbytes/file-deduplicator) CLI installed

## Status

**Code: ✅ Complete**
- Find Duplicates command implemented
- Results list with grouped duplicates
- Quick actions (trash, copy path, show in finder)
- Preferences (CLI path, scan location, algorithm)
- Error handling

**Blockers before publishing:**
1. **Author**: Need Lu's Raycast username (not GitHub username)
   - Update `package.json` → `author` field
2. **Icon**: Need 512x512 PNG icon
   - Replace `assets/extension-icon.png`

## Installation

1. Clone this repository
2. Run `npm install`
3. Run `npm run dev` to start development
4. In Raycast, run "Import Extension" and select this folder

## Usage

1. Open Raycast
2. Search for "Find Duplicates"
3. Select a folder to scan
4. Review duplicate groups
5. Take action on individual files

## Development

```bash
# Install dependencies
npm install

# Start development mode
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## License

MIT
