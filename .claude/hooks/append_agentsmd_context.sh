#!/bin/bash
# Find all AGENTS.md files in project directory and subdirectories
find "$CLAUDE_PROJECT_DIR" -name "AGENTS.md" -type f -exec cat {} +