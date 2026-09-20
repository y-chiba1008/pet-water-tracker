#!/usr/bin/env bash
# splinter（DB lint）を実行して結果を判定する。
# ※ supabase-cli のバンドル版は古いため、最新版を GitHub から直接取得して実行している
#
# 失敗とみなす条件:
#   - レベルが WARN / ERROR の指摘（カテゴリ問わず）
#   - SECURITY カテゴリの指摘（INFO であっても許容しない）
set -euo pipefail

SPLINTER_URL='https://raw.githubusercontent.com/supabase/splinter/main/splinter.sql'

DB_URL="$(supabase status -o env | grep '^DB_URL=' | cut -d= -f2- | tr -d '"')"

# -A -t -q でヘッダ・行数フッタ・コマンドタグを抑止し、タブ区切りの結果行だけを得る
# 列: name, title, level, facing, categories, description, detail, remediation, metadata, cache_key
rows="$(curl -sSL "$SPLINTER_URL" | psql "$DB_URL" -A -F $'\t' -t -q)"

if [ -z "$rows" ]; then
  echo "splinter: 指摘なし"
  exit 0
fi

echo "splinter の指摘一覧:"
printf '%s\n' "$rows" | awk -F'\t' '{ print $3, $5, $1 }' | sort | uniq -c

blocking="$(printf '%s\n' "$rows" | awk -F'\t' '$3 == "WARN" || $3 == "ERROR" || $5 ~ /SECURITY/')"

if [ -n "$blocking" ]; then
  count="$(printf '%s\n' "$blocking" | wc -l | tr -d ' ')"
  echo "::error::splinter で許容できない指摘が ${count} 件検出されました（WARN / ERROR、または SECURITY カテゴリ）"
  printf '%s\n' "$blocking" | awk -F'\t' '{ print "- [" $3 "][" $5 "] " $1 ": " $7 }'
  exit 1
fi

echo "splinter: SECURITY 以外の INFO のみのため通過"
