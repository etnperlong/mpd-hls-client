---
name: check-tools
description: Check if required external tools are installed and install them if missing. Use before using external tools like ast-grep, or when encountering "command not found" errors.
---

# Check Tools

## Quick Start

Verify required tools are available, install missing ones.

## Workflow

1. Identify the tool needed for the current task.
2. Check if the tool is installed:
   ```bash
   which <tool-name> || command -v <tool-name>
   ```
3. If not installed, determine the installation method:
   - Check tool's official documentation for installation instructions.
   - Prefer package managers (npm, bun, cargo, brew, apt, etc.).
4. Install the tool using the appropriate method.
5. Verify installation:
   ```bash
   <tool-name> --version
   ```

## Supported Tools

### ast-grep

**Purpose**: Structural code search using AST patterns.

**Check**:
```bash
which ast-grep || command -v ast-grep
```

**Install methods** (choose based on platform):

| Platform | Command |
|----------|---------|
| macOS (Homebrew) | `brew install ast-grep` |
| Linux (Cargo) | `cargo install ast-grep` |
| Linux (npm) | `npm install -g @ast-grep/cli` |
| Windows (Scoop) | `scoop install ast-grep` |
| Windows (Cargo) | `cargo install ast-grep` |

**Verify**:
```bash
ast-grep --version
```

## Constraints

- Never install tools without user confirmation.
- Prefer official installation methods from tool documentation.
- If multiple installation methods exist, suggest the most appropriate for the user's platform.
- After installation, remind user to verify the tool works correctly.
