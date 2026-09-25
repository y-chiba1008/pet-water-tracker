# 結合テスト・総合テスト（手動）

要件どおりの業務フロー（総合）と、画面をまたいだデータの反映・認可（結合）を、同じ手動試験で確認する。

単体テスト（Vitest）・見た目のピクセル確認・自動 E2E・2名同時利用は対象外。不具合を見つけたら GitHub Issue を新規作成する。

---

## 対象範囲

| 含む | 含まない |
|---|---|
| ログイン／ログアウト／未登録アカウント拒否 | 家族2名の順次・同時操作 |
| 水皿 CRUD（論理削除含む） | 要件の将来候補（按分、記録の修正削除、内訳表示など） |
| 水皿交換（開始／交換／片付け）と個別給水 | Playwright 等の自動 E2E |
| ホームの日別集計（カレンダー・直近30日グラフ） | domain / Zod の単体ケースの再実施 |
| バリデーションと通信失敗 | |

---

## 文書構成

| ファイル | 内容 |
|---|---|
| [試験データ.md](./試験データ.md) | アカウント、日時記号、マスタ、期待値の計算方法 |
| [シナリオ.md](./シナリオ.md) | 試験項目（手順・期待結果）。OK 時は各項目のチェックボックスを入れる |
| [seed.sql](./seed.sql) | セット C 用の履歴データ（相対日時） |

---

## 実施環境

- OS: 試験実施者のローカル（WSL2 可）
- アプリ: `pnpm dev`（http://localhost:3000 ）
- DB / Auth: `pnpm exec supabase start`
- ブラウザ: Chromium 系（Chrome / Edge）。通信失敗は DevTools の Network を使う
- タイムゾーン: **Asia/Tokyo**。PC とブラウザを JST にして実施する

---

## 共通準備

```bash
pnpm exec supabase start
pnpm exec supabase db reset
pnpm seed-users
pnpm dev
```

- `scripts/seed-users.config.json` に、ログインする **許可 Google アカウントのメール** が入っていること
- `db reset` のたびに `pnpm seed-users` が必要（Auth ユーザーも消える）
- セット C だけ、ユーザー作成のあと `seed.sql` を投入する（手順は [試験データ.md](./試験データ.md)）

---

## 実施セット（リセット単位）

| セット | DB | 目的 | シナリオ ID |
|---|---|---|---|
| A | reset + `seed-users` のみ（水皿・記録なし） | 認証・未ログイン誘導 | AUTH-* |
| B | セット A の続き（UI でデータを作る） | 空状態〜CRUD〜記録〜当日集計〜バリデーション〜通信失敗 | BOWL-* / REC-* / VAL-* / SUM-B-* / ERR-* |
| C | reset + `seed-users` + `seed.sql` | 日付またぎ・30日境界・前月・進行中は集計外 | SUM-C-* / BOWL-C-* |

セット B のあとにセット C へ進むときは **必ず `db reset` → `seed-users` → `seed.sql`** する。

推奨: 基準日 D は **月の 3 日以降**（前月カレンダーと「今日」を同時に確認しやすい）。1 日でも実施可能だが、前月セルの確認が主になる。
