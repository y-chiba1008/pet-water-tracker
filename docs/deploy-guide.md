# ペット飲水量記録アプリ デプロイ手順書

## 1. 全体構成

| 部分 | ホスティング先 | 備考 |
|---|---|---|
| フロントエンド（Vite + React） | Render（Static Site） | GitHub連携で自動デプロイ |
| バックエンド | Supabase（マネージドサービス） | サーバーのデプロイは不要。プロジェクトのセットアップのみ |

---

## 2. Supabase側のセットアップ

### 2.1 プロジェクト作成
- Supabaseダッシュボードで新規プロジェクトを作成（リージョン: 東京 `ap-northeast-1`）

### 2.2 マイグレーション適用
ローカルの`supabase-cli`でスキーマ管理している内容（テーブル定義・`is_authorized`関数・RLSポリシー・部分ユニークインデックス）をリモートに反映する。

```bash
supabase link --project-ref <プロジェクトref>
supabase db push
```

初回はこの手順で反映する。以降は `main` へのマージ時に `.github/workflows/db-deploy.yml` が自動で `db push` するため、手動実行は不要（詳細は下記2.2.1）。

#### 2.2.1 マイグレーションの自動適用（GitHub Actions）

`supabase/migrations/**` を含む変更が `main` にマージされると `DB Deploy` ワークフローが起動し、承認後にリモートへ `db push` する。

**必要な GitHub Secrets**

| Secret | 取得元 |
|---|---|
| `SUPABASE_ACCESS_TOKEN` | Supabaseダッシュボード → Account → Access Tokens で発行 |
| `SUPABASE_DB_PASSWORD` | プロジェクト作成時に設定したDBパスワード |
| `SUPABASE_PROJECT_ID` | プロジェクトのReference ID（Project Settings → General） |

**承認ゲートの設定**

マイグレーションはロールバックできないため、Environment による承認を必須にしている。

1. GitHubリポジトリ → Settings → Environments → **New environment** で `production` を作成
2. **Required reviewers** に自分（および家族アカウント）を追加
3. Secrets は Environment 側ではなくリポジトリの Secrets に登録しておけばよい（Environment 側に置いても動く）

これでマージ後にワークフローが承認待ちで停止し、Actions画面から **Review deployments → Approve and deploy** を押すと適用される。

### 2.3 Google OAuth設定
1. Google Cloud ConsoleでOAuthクライアントID（ウェブアプリケーション種別）を作成
2. 承認済みリダイレクトURIに以下を登録
   ```
   https://<プロジェクトref>.supabase.co/auth/v1/callback
   ```
3. Supabaseダッシュボード → Authentication → Providers → Google で、本番用のClient ID / Secretを設定
   - ローカルの`config.toml`は`client_id = "env(GOOGLE_CLIENT_ID)"`のように環境変数参照になっているが、これは**ローカル用**。`supabase config push`を使わない運用のため、本番はダッシュボードに直接値を入力する必要がある

### 2.4 新規サインアップの禁止
- Authentication → Settings で **"Allow new user signups"** をオフにする
- ローカルの`config.toml`では`enable_signup = false`になっているが、これはローカル環境にのみ適用されるため、本番ダッシュボードでも同様に設定する必要がある

### 2.5 Emailプロバイダの無効化（推奨）
- Google SSOのみを使う設計のため、Authentication → Providers → Email を無効化しておく
- `config.toml`では`[auth.email] enable_signup = true`となっており、トップレベルの`enable_signup = false`と矛盾した設定になっている（実害はないが紛らわしいので、本番ではEmailプロバイダごと切ってしまうのが安全）

### 2.6 ユーザー2名を手動作成
- Authentication → Users から、事前登録する2名分を手動作成
- `users`テーブルへの連携（トリガー、または手動insert）も忘れずに行う

### 2.7 Leaked Password Protection（今回は対応しない）
- Supabaseの警告 `auth_leaked_password_protection` として表示される項目
- 有料プランが必要そうなため、今回は対応をスルーする方針
- Google SSOのみの運用であればパスワード認証自体を使わないため、実害としての優先度はもともと低い

---

## 3. フロントエンドのデプロイ（Render）

### 3.1 サービス作成
1. Renderダッシュボードで **New → Static Site** を選択
2. GitHubリポジトリを連携
3. ビルド設定
   - Build Command: `pnpm install && pnpm build`
   - Publish Directory: `dist`

### 3.2 環境変数の設定
Service Settings → Environment に以下を登録：

```
VITE_SUPABASE_URL=<SupabaseプロジェクトのURL>
VITE_SUPABASE_ANON_KEY=<Supabaseのanon key>
```

- `VITE_`プレフィックスの環境変数はビルド時に埋め込まれるため、値を変更した場合は再デプロイが必要

### 3.3 SPAルーティング対応（Rewrite設定）
対象のStatic Siteサービス → **Redirects/Rewrites** タブから以下を追加：

- Source Path: `/*`
- Destination Path: `/index.html`
- Action: **Rewrite**（Redirectではない点に注意）

保存すると即座に反映される（再デプロイ不要）。

---

## 4. デプロイ後の仕上げ

Renderが発行する本番URL（独自ドメインを使う場合はそちら）を、以下2箇所に登録する。登録漏れがログイン失敗の主な原因になるため要注意。

1. **Supabase**: Authentication → URL Configuration
   - Site URL: 本番URLに変更
   - Redirect URLs: 本番URL（および必要なパス）を追加
2. **Google Cloud Console**: OAuthクライアントの承認済みリダイレクトURIに本番URLを追加

---

## 5. ローカル`config.toml`と本番ダッシュボードの対応関係

`config.toml`は`supabase config push`を使わない限り、ローカル環境（`supabase start`）にのみ適用される。本番（リモートプロジェクト）は別途ダッシュボードで手動設定が必要。

| config.tomlの設定 | 本番での対応 |
|---|---|
| `auth.site_url` / `auth.additional_redirect_urls` | ダッシュボードのURL Configurationで本番URLを設定（上記4章） |
| `auth.external.google.client_id/secret`（env参照） | ダッシュボードのProviders → Googleに本番用の値を直接入力 |
| `auth.enable_signup = false` | ダッシュボードのAuthentication → Settingsで同様にオフ |
| `auth.email.enable_signup = true`（トップレベルと矛盾） | 本番ではEmailプロバイダ自体を無効化（推奨） |
| （config.toml側に対応項目なし） | Leaked Password Protection（今回はスルー） |
| （config.toml側に対応項目なし） | ユーザー2名の手動作成 |
| DBスキーマ・RLSポリシー・`is_authorized`関数 | `supabase db push`で反映されるため、ダッシュボードでの個別設定は不要（`main`へのマージ時に`DB Deploy`ワークフローが自動実行） |
