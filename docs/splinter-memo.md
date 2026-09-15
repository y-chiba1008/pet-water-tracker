# splinterについて
コマンドラインでsplinterを実行するには、本来は`supabase db advisors --local`で良い。
しかし現在(2026/9/15)のところ、supabase-cli経由のsplinterでは拾えない警告が存在する。（利用しているsplinterが古い？）
そこで、splinterのGithubリポジトリより、最新のSQLを取得してpsqlで直接実行する形にしている。
（スクリプト詳細はpackage.jsonのscripts.splinterを参照）