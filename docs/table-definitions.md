# ペット飲水量記録アプリ テーブル定義書

対象: Supabase (PostgreSQL)
認証: Supabase Auth（Google SSO）を利用し、`auth.users` を参照する

---

## 1. users（ユーザー）

Supabase Authの `auth.users` と1:1で対応するアプリ用のユーザー情報テーブル。

| カラム名 | 型 | NULL | 説明 |
|---|---|---|---|
| id | uuid | NOT NULL | 主キー。`auth.users.id` と同一の値を使用 |
| email | text | NOT NULL | メールアドレス（表示用。事前登録の照合は基本 `auth.users` 側で完結するため参照用途） |
| display_name | text | NULL | 表示名（任意） |
| created_at | timestamptz | NOT NULL | 作成日時（default: now()） |

- 主キー: `id`
- `auth.users` の作成に連動してこのテーブルへレコードを作成するトリガーを想定（事前に2名分を手動作成）

---

## 2. bowls（水皿）

| カラム名 | 型 | NULL | 説明 |
|---|---|---|---|
| id | uuid | NOT NULL | 主キー（default: gen_random_uuid()） |
| name | text | NOT NULL | 水皿の名称（例: リビング、寝室） |
| created_at | timestamptz | NOT NULL | 作成日時 |
| is_active | boolean | NOT NULL | 廃止フラグ（default: true）。物理削除せず論理削除で対応 |

- 主キー: `id`

---

## 3. bowl_records（水皿記録）

交換〜交換までの1サイクルを1レコードとして管理する。

| カラム名 | 型 | NULL | 説明 |
|---|---|---|---|
| id | uuid | NOT NULL | 主キー（default: gen_random_uuid()） |
| bowl_id | uuid | NOT NULL | 対象水皿（`bowls.id` への外部キー） |
| start_time | timestamptz | NOT NULL | 交換直後（開始）の記録時刻 |
| start_amount_ml | integer | NOT NULL | 交換直後の容量（ml） |
| start_recorded_by | uuid | NOT NULL | 開始記録を行ったユーザー（`users.id` への外部キー） |
| end_time | timestamptz | NULL | 次の交換直前（終了）の記録時刻。進行中サイクルはNULL |
| end_amount_ml | integer | NULL | 次の交換直前の容量（ml）。進行中サイクルはNULL |
| end_recorded_by | uuid | NULL | 終了記録を行ったユーザー（`users.id` への外部キー）。進行中サイクルはNULL |
| created_at | timestamptz | NOT NULL | レコード作成日時 |
| updated_at | timestamptz | NOT NULL | レコード更新日時（終了記録の追記時に更新） |

- 主キー: `id`
- 外部キー: `bowl_id` → `bowls.id`、`start_recorded_by` / `end_recorded_by` → `users.id`
- 飲水量（アプリ側で算出、カラムとしては持たない）: `start_amount_ml - end_amount_ml`（`end_amount_ml` がNULLの間は未確定）
- 「進行中サイクル」の判定: `end_time IS NULL` のレコード
- 業務ルールとして、同一 `bowl_id` に対して `end_time IS NULL` のレコードは常に高々1件のみ存在する想定（アプリ側で保証。DB制約での強制は必須ではないが、部分インデックス等での担保も検討可）
- **部分ユニークインデックス**（データ整合性のため）:
```sql
CREATE UNIQUE INDEX bowl_records_active_cycle_idx
  ON bowl_records (bowl_id)
  WHERE end_time IS NULL;
```
同一水皿に対して進行中サイクルが同時に2件以上存在することをDB側で防止する。

---

## 4. individual_records（個別記録）

| カラム名 | 型 | NULL | 説明 |
|---|---|---|---|
| id | uuid | NOT NULL | 主キー（default: gen_random_uuid()） |
| recorded_at | timestamptz | NOT NULL | 飲ませた時刻 |
| amount_ml | integer | NOT NULL | 量（ml） |
| recorded_by | uuid | NOT NULL | 記録したユーザー（`users.id` への外部キー） |
| created_at | timestamptz | NOT NULL | レコード作成日時 |

- 主キー: `id`
- 外部キー: `recorded_by` → `users.id`

---

## 5. 日別集計について

日別の飲水量合計は集計用テーブルを持たず、以下をアプリ側（またはビュー）でオンデマンドに算出する想定。

- 対象日の `bowl_records`（`end_time` の日付が対象日のもの）の `start_amount_ml - end_amount_ml` の合計
- 対象日の `individual_records`（`recorded_at` の日付が対象日のもの）の `amount_ml` の合計
- 上記2つの合計値が日別飲水量

---

## 6. RLSポリシー設計

将来「家」単位の共有設定を導入する際の移行コストを抑えるため、ポリシー条件を直接各テーブルに書かず、**認可判定用のSQL関数を1つ用意し、各テーブルのポリシーはその関数を呼ぶだけにする**方針とする。

- 関数例: `is_authorized(uid uuid) returns boolean`
  - 現時点の実装: 引数のユーザーが `users` テーブルに存在すれば `true` を返すだけ（＝認証済みユーザーは無条件で許可）
- 各テーブル（`bowls` / `bowl_records` / `individual_records` など）のRLSポリシーは、SELECT/INSERT/UPDATEいずれも `is_authorized(auth.uid())` を条件とする
- 将来「家」概念を導入する際は、この関数の中身を「同じ `house_id` に属するか」の判定に差し替えるだけで、各テーブルのポリシー定義自体は変更不要とする想定
- `house_id` カラムの追加自体は今回のスコープでは行わず、実際に「家」機能に着手するタイミングで対応する
