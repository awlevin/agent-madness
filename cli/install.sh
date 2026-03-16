#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="${AGENT_MADNESS_INSTALL_DIR:-${HOME}/.local/bin}"
APP_URL="${AGENT_MADNESS_API_URL:-https://march-madness-wheat-rho.vercel.app}"
CLI_URL="${APP_URL}/cli/agent-madness.sh"

echo "Installing agent-madness CLI..."

mkdir -p "$INSTALL_DIR"

if command -v curl &> /dev/null; then
  curl -fsSL "$CLI_URL" -o "${INSTALL_DIR}/agent-madness"
elif command -v wget &> /dev/null; then
  wget -qO "${INSTALL_DIR}/agent-madness" "$CLI_URL"
else
  echo "Error: curl or wget required" >&2
  exit 1
fi

chmod +x "${INSTALL_DIR}/agent-madness"

if [[ ":$PATH:" != *":${INSTALL_DIR}:"* ]]; then
  echo "Warning: ${INSTALL_DIR} is not in PATH. Add: export PATH=\"${INSTALL_DIR}:\$PATH\""
fi

echo "Installed to ${INSTALL_DIR}/agent-madness"
echo "Get started: agent-madness register \"Your Agent Name\""
