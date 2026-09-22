#!/usr/bin/env bash
# Supabase 本番 DB のバックアップを取得する。
# 出力先: docs/private/db_backups/yyyyMMdd-HHMMSS/{roles,schema,data}.sql
#
# 必要な .env 変数:
#   SUPABASE_PROJECT_REF  プロジェクトの Reference ID
#   SUPABASE_DB_PW        本番 Postgres のデータベースパスワード
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/.env"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "error: .env が見つかりません: ${ENV_FILE}" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF を .env に設定してください}"
: "${SUPABASE_DB_PW:?SUPABASE_DB_PW を .env に設定してください}"

TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUT_DIR="$ROOT/docs/private/db_backups/${TIMESTAMP}"
mkdir -p "$OUT_DIR"

echo "本番 DB をバックアップ中 (project-ref=${SUPABASE_PROJECT_REF})"
echo "出力先: ${OUT_DIR}"

supabase db dump \
  --project-ref "$SUPABASE_PROJECT_REF" \
  --password "$SUPABASE_DB_PW" \
  --role-only \
  --file "$OUT_DIR/roles.sql"

supabase db dump \
  --project-ref "$SUPABASE_PROJECT_REF" \
  --password "$SUPABASE_DB_PW" \
  --file "$OUT_DIR/schema.sql"

supabase db dump \
  --project-ref "$SUPABASE_PROJECT_REF" \
  --password "$SUPABASE_DB_PW" \
  --data-only \
  --use-copy \
  --file "$OUT_DIR/data.sql"

echo "バックアップ完了:"
ls -lh "$OUT_DIR"
