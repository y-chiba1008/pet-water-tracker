# ペット飲水量記録アプリ 設計方針

## 1. 背景・前提

要件（`requirements.md` / `table-definitions.md`）を踏まえると、設計上のポイントは以下の3点。

- **水皿記録画面**：進行中サイクルの有無によって入力項目が切り替わる（状態依存フォーム）
- **飲水量計算・異常値判定・日別集計**：ドメインロジックが複数箇所に散らばりやすい
- **Supabaseへの依存**：将来「家」単位の共有機能などスキーマ変更が入る可能性がある（`house_id` 追加など）

これらを踏まえ、以下の設計パターンの組み合わせを採用する。

---

## 2. 採用するデザインパターン

### 2.1 Repository パターン（データアクセス層の分離）

Supabaseへのクエリをコンポーネントやhookに直書きせず、`bowlRecordRepository` のような関数群に集約する。

```
src/features/bowl-records/api/bowlRecordRepository.ts
  - fetchActiveCycle(bowlId)
  - insertStartRecord(...)
  - updateEndRecord(...)
```

**理由**：`house_id` 追加などスキーマ変更が将来スコープに含まれているため、Supabaseクエリを1箇所にまとめておくと変更の影響範囲を小さくできる。

### 2.2 Functional Core, Imperative Shell（ドメインロジックの純粋関数化）

以下のロジックは、Supabaseやコンポーネントに依存しない純粋関数として `domain/` に切り出す。

- 飲水量 = 開始容量 − 終了容量
- 終了容量 > 開始容量なら異常値
- 進行中サイクルかどうかの判定
- 日別集計

```ts
// domain/bowlRecord.ts
export function calcWaterAmount(start: number, end: number): number
export function isAbnormal(start: number, end: number): boolean
export function isActiveCycle(record: BowlRecord): boolean
```

日別集計では、**データが存在しない日は 0ml として扱う**。

- 今月の1日平均：当月1日〜本日の全日数で割る（記録なしの日は合計に加算しないが日数には含める）
- グラフの最高/最低：直近30日の全日を対象にし、記録なしの日は 0ml として含める（記録がある日が1日でもあれば最低は 0ml になりうる）
- カレンダー：記録なしの日は 0ml と区別して `—` を表示する（表示上の区別のみ）

**理由**：テストツールにVitestを採用済み。副作用のない関数にしておくとユニットテストが書きやすく、業務ロジックの正しさを担保しやすい。テスト対象・カバレッジの詳細方針は `docs/testing.md` を参照。

### 2.3 カスタムHook + TanStack Query（状態管理）

Repositoryをラップし、コンポーネントからは `useActiveCycle(bowlId)` / `useDailySummary(date)` のようなhookだけを呼ぶ形にする。キャッシュ・ローディング・再検証はTanStack Queryに任せる。

**理由**：Reduxのような重い状態管理は今回の規模（画面5つ、ユーザー2名）には過剰。Query + Contextくらいのシンプルな構成が扱いやすい。

### 2.4 判別可能なUnion型でフォーム状態をモデリング

水皿記録画面の「進行中サイクルあり/なし」を素朴なif分岐で管理せず、型で状態を表現する。

```ts
type BowlFormState =
  | { mode: "no-active-cycle" }
  | { mode: "active-cycle"; current: BowlRecord };
```

**理由**：入力可能項目の切り替えロジックがコンポーネント側に散らばらず、TypeScriptの網羅性チェックで漏れを防げる。

### 2.5 フォルダ構成はfeatureベース

`components/` `hooks/` のような型別ではなく、機能単位（`bowl-records` / `individual-records` / `visualization` / `bowls` / `login`）でまとめる。各feature内にUI・hook・repository・domainを閉じ込める。

---

## 3. フォルダ構成

```
src/
├── app/
│   ├── App.tsx                  # ルーティング定義
│   ├── routes.tsx
│   └── providers/
│       ├── AuthProvider.tsx     # Supabase Authセッション管理
│       └── QueryProvider.tsx    # TanStack Query設定
│
├── features/
│   ├── login/
│   │   ├── components/
│   │   │   └── LoginPage.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── api/
│   │       └── authRepository.ts
│   │
│   ├── bowls/                          # 水皿管理
│   │   ├── components/
│   │   │   ├── BowlListPage.tsx
│   │   │   ├── BowlForm.tsx
│   │   │   └── BowlListItem.tsx
│   │   ├── hooks/
│   │   │   └── useBowls.ts
│   │   ├── api/
│   │   │   └── bowlRepository.ts
│   │   └── types.ts
│   │
│   ├── bowl-records/                   # 水皿記録
│   │   ├── components/
│   │   │   ├── BowlRecordPage.tsx
│   │   │   └── BowlRecordForm.tsx      # 進行中サイクル有無で表示切替
│   │   ├── hooks/
│   │   │   ├── useActiveCycle.ts       # 進行中サイクル取得
│   │   │   └── useBowlRecordMutations.ts # insert/update
│   │   ├── api/
│   │   │   └── bowlRecordRepository.ts
│   │   ├── domain/
│   │   │   └── bowlRecord.ts           # calcWaterAmount, isAbnormal, isActiveCycle
│   │   └── types.ts
│   │
│   ├── individual-records/             # 個別記録
│   │   ├── components/
│   │   │   └── IndividualRecordForm.tsx
│   │   ├── hooks/
│   │   │   └── useIndividualRecordMutation.ts
│   │   ├── api/
│   │   │   └── individualRecordRepository.ts
│   │   └── types.ts
│   │
│   └── visualization/                  # ホーム画面（カレンダー／折れ線グラフ）
│       ├── components/
│       │   ├── HomePage.tsx
│       │   ├── CalendarView.tsx
│       │   └── LineChartView.tsx
│       ├── hooks/
│       │   └── useDailySummary.ts      # 日別集計取得
│       ├── api/
│       │   └── summaryRepository.ts    # bowl_records + individual_records から集計
│       └── domain/
│           └── dailySummary.ts         # 純粋関数での集計ロジック（テスト対象）
│
├── shared/
│   ├── components/
│   │   ├── AppShell.tsx                # 共通ヘッダ・フッタ
│   │   └── UserMenu.tsx                # アカウントメニュー（アバター・ログアウト）
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   └── getAvatarUrl.ts             # Google アバター URL 取得
│   └── types/
│       └── database.ts                 # Supabase生成の型定義
│
└── main.tsx
```

### 補足ポイント

- **`domain/` は `bowl-records` と `visualization` にだけ配置**。飲水量計算・異常値判定・日別集計という「テストしたいロジック」が集中している箇所だけ純粋関数として分離し、単純なCRUDのみの`bowls`や`individual-records`には無理に置かない。単体テスト・カバレッジの範囲は `docs/testing.md` に従う。
- **`api/` はSupabaseクライアント呼び出しの唯一の窓口**。コンポーネントやhookから直接`supabase.from(...)`を呼ばないルールを徹底すると、将来`house_id`が入ってもここだけの修正で済む。
- **`shared/types/database.ts`** はSupabase CLIの型生成コマンド（`supabase gen types typescript`）の出力先として想定。

---

## 4. まとめ

**Repository（データアクセス）＋ Functional Core（ドメインロジック）＋ カスタムHook（React連携）＋ feature単位フォルダ**という組み合わせが、この規模のアプリには過不足ない構成である。
