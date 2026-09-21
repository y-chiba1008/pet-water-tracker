# Google ログインボタン（公式ロゴ）

ログイン画面の「Google でログイン」ボタンにおける、公式ロゴの入手先と本リポジトリでの実装方針。

---

## 公式ドキュメント・ダウンロード先

| 用途 | URL |
|---|---|
| ブランディングガイドライン（必須） | https://developers.google.com/identity/branding-guidelines |
| Pre-Approved ボタン／ロゴのダウンロード | 上記ページ内の **Download Pre-Approved Brand Icons** |
| GIS による公式ボタン描画（参考） | https://developers.google.com/identity/gsi/web/guides/display-button |

ガイドラインに従った表示は、Google のアプリ検証（OAuth クライアント検証など）でも求められる。

---

## 表示方式の選択肢

| 方式 | 内容 | 本リポジトリでの採用 |
|---|---|---|
| **A. 公式アセット + 自前文言** | 公式 SVG/PNG の「G」ロゴを使い、文言は HTML でローカライズ | **採用** |
| B. Google Identity Services（GIS）描画 | `accounts.google.com/gsi/client` がボタンを描画 | 不採用（認証フローが GIS 前提になり、Supabase OAuth と別経路） |
| C. 自作 SVG / Material Symbols | 独自の「G」やアイコンフォント | 不採用（ガイドライン非準拠になりやすい） |

認証はこれまでどおり Supabase Auth の `signInWithOAuth({ provider: 'google' })` を使い、**見た目だけ公式アセットに合わせる**のが A の利点。

---

## 本リポジトリの実装方針（方式 A）

### 方針

1. Google 公式の「G」ロゴ SVG を `src/assets/` に配置する
2. ボタン文言は日本語で HTML 側に書く（`Google でログイン`）
3. ボタンの色・枠線はガイドラインの **Light** テーマに合わせる
4. クリック時は既存の `signInWithGoogle()`（Supabase OAuth）を呼ぶ

### テーマ（Light / Neutral / Dark）の選び方

公式アセットには 3 種類ある。**ボタン全体の塗りに合わせて選ぶ**。

| テーマ | ボタン側の目安 | 本アプリ |
|---|---|---|
| **Light** | 白背景 (`#FFFFFF`) + 枠線 `#747775`、文字 `#1F1F1F` | **採用**（ログイン画面が明るい背景） |
| Neutral | グレー塗り (`#F2F2F2`)、枠線なし | 未使用 |
| Dark | 暗い塗り (`#131314`) + 枠線 `#8E918F` | 未使用 |

「G」ロゴ自体の 4 色はテーマによらず同じ。変えてはいけない。

### 日本語文言について

- Pre-Approved の完成ボタン画像は、基本的に**英語文言**のみ
- 文言のローカライズはガイドラインで**許可・推奨**
- SVG 内の英語を書き換える方法もあるが、Google Sans が必要になる
- 本アプリは **ロゴのみ公式 SVG、文言は HTML** としてローカライズしている（Google Sans は不要）

許可される文言の例: `Sign in with Google` / `Google でログイン` / `Continue with Google` など（詳細はガイドラインの Text 節）。

### 配置ファイル

```
src/assets/
├── google-g-logo-light.svg    # 使用中
├── google-g-logo-neutral.svg  # 予備（Neutral ボタン用）
└── google-g-logo-dark.svg     # 予備（Dark ボタン用）
```

実装箇所: `src/features/login/components/LoginPage.tsx`

### ボタンスタイルの要点（Light）

ガイドラインの Light テーマに合わせた値（実装でもハードコードしている）:

- 背景: `#FFFFFF`
- 枠線: `#747775` / 1px
- 文字色: `#1F1F1F`
- 形状: ピル型（`rounded-full`）もガイドライン上問題なし

---

## 守ること（ガイドライン要約）

- 「G」は標準の多色版のみ。単色化・変形・古いロゴの使用は不可
- 「G」の背景は白（Light アセットの円形バッジがその役割）
- 他のサードパーティログイン手段と同等以上の目立たせ方にする
- 「Google」単独の文言だけでログイン操作を表さない

---

## 関連しないもの

- **Google Sans**: 公式の完成ボタン SVG を文言ごと使う場合に必要。方式 A（文言を HTML）ではアプリへの導入は不要
- **Material Symbols**: モック UI の一般アイコン用。Google ブランドロゴには使わない
