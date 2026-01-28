#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sisgerp}"
SERVICE_NAME="${SERVICE_NAME:-sisgerp}"

RELEASE_ID="${1:-}"
if [ -z "${RELEASE_ID}" ]; then
  echo "Uso: $0 <RELEASE_ID>"
  ls -1dt "${APP_DIR}/releases/"* 2>/dev/null | head -n 10 || true
  exit 1
fi

TARGET="${APP_DIR}/releases/${RELEASE_ID}"
if [ ! -d "${TARGET}" ]; then
  echo "Release não encontrada: ${TARGET}"
  exit 2
fi

ln -sfn "${TARGET}" "${APP_DIR}/current"
systemctl restart "${SERVICE_NAME}"
