# SEO・アクセス解析の設定

> サイトの訪問者数を把握し、Google検索での表示を最適化します

## はじめに

アクセス解析を設定すると、以下のことがわかるようになります:
- サイトに何人が訪問したか
- どのページが人気か
- どんなキーワードで検索されているか
- お客様がどこからサイトに来ているか

**サイト公開後にいつでも追加できるので、今は設定しなくても大丈夫です。**

## Google Analytics（アクセス解析）

サイトの訪問者数やページ閲覧数を無料で計測できるGoogleの公式ツールです。

### 設定手順
1. [Google Analytics](https://analytics.google.com/) にアクセス
2. Googleアカウントでログイン
3. 「プロパティを作成」でサイト情報を入力
4. 測定ID（`G-XXXXXXXXXX` の形式）が表示される
5. Site Builderの「SEO設定」→「GA トラッキングID」にペースト

## Google Search Console（検索パフォーマンス）

Google検索での表示回数やクリック数を確認でき、サイトマップの送信もできます。

### 設定手順
1. [Google Search Console](https://search.google.com/search-console/) にアクセス
2. 「プロパティを追加」でサイトURLを入力
3. 所有権確認用のメタタグコードをコピー
4. Site Builderの「SEO設定」→「Google確認コード」にペースト

## Bing Webmaster Tools

Microsoft Bingの検索エンジンに対応する場合に設定します。

- [Bing Webmaster Tools](https://www.bing.com/webmasters/) にアクセス
- Google Search Consoleの設定をインポートできるので簡単です

## よくある質問

**Q: 最初から設定しないとダメですか？**
A: いいえ。サイト公開後にいつでも追加できます。まずはサイトを完成させることが優先です。

**Q: 費用はかかりますか？**
A: Google Analytics、Search Console、Bing Webmaster Toolsは全て無料です。

**Q: 設定するとサイトが重くなりますか？**
A: 計測用の小さなスクリプトが追加されますが、体感できる影響はほぼありません。

**Q: 測定IDがわかりません**
A: Google Analyticsの管理画面 →「データストリーム」→ 対象のストリームを選択 → 「測定ID」に表示されています。
