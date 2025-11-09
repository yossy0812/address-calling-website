# お問い合わせフォーム設定ガイド

## 概要

このサイトにはPHPベースのお問い合わせフォーム機能が実装されています。
お名前ドットコムのレンタルサーバーで動作します。

## 必要な設定

### 1. contact.phpの設定を変更

`site/contact.php` の以下の箇所を実際の値に変更してください：

```php
// 管理者のメールアドレス（お問い合わせを受信するメールアドレス）
define('ADMIN_EMAIL', 'info@addresscalling.jp');

// 自動返信メールの送信元メールアドレス
define('FROM_EMAIL', 'noreply@addresscalling.jp');
define('FROM_NAME', 'アドレスコーリング株式会社');

// サイトURL
define('SITE_URL', 'https://addresscalling.jp');
```

**変更例：**
```php
define('ADMIN_EMAIL', 'your-email@example.com');  // ← 実際の受信用メールアドレスに変更
define('FROM_EMAIL', 'noreply@example.com');      // ← 実際のドメインのメールアドレスに変更
define('SITE_URL', 'https://your-domain.com');    // ← 実際のサイトURLに変更
```

### 2. サーバーへのアップロード

お名前ドットコムのレンタルサーバーに以下のファイルをアップロードしてください：

```
site/
├── index.html
├── service.html
├── school.html
├── privacy.html
├── contact.php          ← 重要：このファイルが必須
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/
    └── (各種画像ファイル)
```

**アップロード方法：**

1. FTPソフト（FileZilla、Cyberduckなど）でサーバーに接続
2. お名前ドットコムの管理画面から以下の情報を確認：
   - FTPホスト名
   - FTPユーザー名
   - FTPパスワード
3. `/public_html/` または `/www/` ディレクトリ配下にファイルをアップロード

### 3. パーミッション設定

通常は不要ですが、エラーが出る場合は以下のパーミッションを設定してください：

- `contact.php`: 644 または 755

### 4. メール送信のテスト

1. ブラウザで `https://your-domain.com/index.html#contact` にアクセス
2. お問い合わせフォームに必要事項を記入
3. 送信ボタンをクリック
4. 以下を確認：
   - 緑色の「送信完了」メッセージが表示される
   - 管理者メールアドレスにお問い合わせ内容が届く
   - 送信者のメールアドレスに自動返信メールが届く

## トラブルシューティング

### メールが届かない場合

**原因1: メールアドレスの設定ミス**
- `contact.php` の `ADMIN_EMAIL` と `FROM_EMAIL` を確認
- 実際に使用しているドメインのメールアドレスを使用してください

**原因2: PHPのメール送信機能が無効**
- お名前ドットコムの管理画面でPHPが有効になっているか確認
- サポートに問い合わせて `mb_send_mail()` 関数が使えるか確認

**原因3: 迷惑メールフォルダに入っている**
- 受信メールボックスの迷惑メールフォルダを確認

**原因4: SPFレコードの設定**
- お名前ドットコムの管理画面でSPFレコードを設定
- 設定方法はお名前ドットコムのサポートページを参照

### エラーメッセージが表示される場合

**「送信に失敗しました」と表示される**
1. ブラウザのコンソール（F12キー → Console）でエラーを確認
2. `contact.php` のパーミッションを確認（644 または 755）
3. サーバーのPHPエラーログを確認

**「Invalid request method」と表示される**
- フォームのsubmit処理が正しく動作していない
- JavaScriptのエラーがないか確認

## フォーム項目のカスタマイズ

フォーム項目を変更する場合は、以下の3ファイルを同期して修正してください：

1. **index.html** - フォームのHTML構造
2. **contact.php** - PHPでのデータ取得とバリデーション
3. **js/main.js** - JavaScriptでのバリデーション

## セキュリティについて

現在の実装には以下のセキュリティ対策が含まれています：

- ✅ XSS対策：入力値のサニタイズ
- ✅ バリデーション：必須項目・メール形式・電話番号形式のチェック
- ✅ 二重送信防止：送信ボタンの無効化
- ⚠️ CSRF対策：現在は無効（必要に応じて有効化可能）

### CSRF対策を有効にする場合

`contact.php` の以下のコメントアウトを解除：

```php
// CSRF対策（オプション）
if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Invalid CSRF token']);
    exit;
}
```

そして `index.html` のフォームにトークンを追加：

```html
<input type="hidden" name="csrf_token" value="<?php echo $_SESSION['csrf_token']; ?>">
```

## お問い合わせデータの保存

現在はメール送信のみです。データベースに保存したい場合は、別途実装が必要です。

### データベース保存の実装例

1. お名前ドットコムの管理画面でMySQLデータベースを作成
2. `contact.php` にデータベース接続処理を追加
3. 送信データをINSERT

## サポート

不明点がある場合は、お名前ドットコムのサポートに以下を確認してください：

- PHPのバージョン
- `mb_send_mail()` 関数が使用可能か
- メール送信の制限事項
- エラーログの確認方法

---

**最終更新日**: 2025年11月8日
