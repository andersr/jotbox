# JotBox

A privacy-first note-taking panel for VSCode. Jot down quick notes without leaving your editor — all data stays local on your machine.

## Features

- Create, edit, and delete notes from a dedicated sidebar panel
- Auto-saves notes as you type
- Delete confirmation to prevent accidental loss
- All notes stored locally via VSCode's built-in storage (no external services)

## Getting Started

```bash
npm install
npm run compile
```

Then press `F5` in VSCode to launch the extension in a development host.

## Usage

1. Click the JotBox icon in the activity bar to open the notes panel
2. Use the **JotBox: New Note** command to create a note
3. Notes auto-save as you type

## Commands

| Command | Description |
|---------|-------------|
| `JotBox: New Note` | Create a new note |
| `JotBox: Refresh Notes` | Refresh the notes list |

## Development

- `npm run compile` — Build the extension
- `npm run watch` — Build in watch mode

## License

MIT
