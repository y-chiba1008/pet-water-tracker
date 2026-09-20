#!/usr/bin/env bash
# コミット済みの型定義が、現在のマイグレーション内容と一致しているかを検証する。
# 差分があれば「pnpm gen-types の実行漏れ」とみなして失敗させる。
set -euo pipefail

TARGET='src/shared/types/database.ts'

if [ ! -f "$TARGET" ]; then
  echo "::error::${TARGET} が存在しません。pnpm gen-types を実行してコミットしてください"
  exit 1
fi

generated="$(mktemp)"
trap 'rm -f "$generated"' EXIT

supabase gen types typescript --local > "$generated"

if ! diff -u "$TARGET" "$generated"; then
  echo "::error::${TARGET} が最新のマイグレーションと一致しません。pnpm gen-types を実行してコミットしてください"
  exit 1
fi

echo "型定義: マイグレーションと一致"
