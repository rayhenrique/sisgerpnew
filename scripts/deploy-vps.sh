#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sisgerp}"
REPO_URL="${REPO_URL:-https://github.com/rayhenrique/sisgerpnew.git}"
BRANCH="${BRANCH:-main}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
SERVICE_NAME="${SERVICE_NAME:-sisgerp}"

mkdir -p "${APP_DIR}/repo" "${APP_DIR}/releases"

if [ ! -d "${APP_DIR}/repo/.git" ]; then
  git clone "${REPO_URL}" "${APP_DIR}/repo"
fi

cd "${APP_DIR}/repo"
git fetch origin "${BRANCH}"
git checkout -f "${BRANCH}"
git reset --hard "origin/${BRANCH}"

export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

npm ci
npm run build

RELEASE_ID="$(date +%Y%m%d%H%M%S)"
RELEASE_DIR="${APP_DIR}/releases/${RELEASE_ID}"
mkdir -p "${RELEASE_DIR}"

cp -R .next/standalone/* "${RELEASE_DIR}/"
mkdir -p "${RELEASE_DIR}/.next"
cp -R .next/static "${RELEASE_DIR}/.next/static"
cp -R public "${RELEASE_DIR}/public"

ln -sfn "${RELEASE_DIR}" "${APP_DIR}/current"

systemctl daemon-reload
systemctl restart "${SERVICE_NAME}"

ls -1dt "${APP_DIR}/releases/"* | tail -n +"$((KEEP_RELEASES + 1))" | xargs -r rm -rf
