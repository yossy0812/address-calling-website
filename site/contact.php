<?php
/**
 * お問い合わせフォーム処理（SMTP版）
 * Address Calling Inc.
 */

// エラー表示を本番環境用に設定
error_reporting(0);
ini_set('display_errors', 0);

// セッション開始
session_start();

// 文字エンコーディング設定
mb_language("Japanese");
mb_internal_encoding("UTF-8");

// PHPMailerを読み込み
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/lib/phpmailer/Exception.php';
require __DIR__ . '/lib/phpmailer/PHPMailer.php';
require __DIR__ . '/lib/phpmailer/SMTP.php';

// ==================================================
// SMTP設定
// ==================================================
define('SMTP_HOST', 'mail20.onamae.ne.jp');
define('SMTP_PORT', 465);
define('SMTP_USERNAME', 'noreply@adrs-c.com');
define('SMTP_PASSWORD', 'CSaR58wFz3!7bpK');
define('SMTP_SECURE', 'ssl'); // 'ssl' または 'tls'

// ==================================================
// メール設定
// ==================================================
define('ADMIN_EMAIL', 'y-hamano@adrs-s.co.jp');
define('FROM_EMAIL', 'noreply@adrs-c.com');
define('FROM_NAME', 'アドレスコーリング株式会社');
define('SITE_URL', 'https://adrs-c.com');

// ==================================================
// POSTリクエストのみ受け付け
// ==================================================
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

// ==================================================
// データ取得とサニタイズ
// ==================================================
$company = isset($_POST['company']) ? trim($_POST['company']) : '';
$last_name = isset($_POST['last_name']) ? trim($_POST['last_name']) : '';
$first_name = isset($_POST['first_name']) ? trim($_POST['first_name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$phone = isset($_POST['phone']) ? trim($_POST['phone']) : '';
$consultation_date = isset($_POST['consultation_date']) ? trim($_POST['consultation_date']) : '';
$consultation_time = isset($_POST['consultation_time']) ? trim($_POST['consultation_time']) : '';
$inquiry_type = isset($_POST['inquiry_type']) ? $_POST['inquiry_type'] : [];
$message = isset($_POST['message']) ? trim($_POST['message']) : '';
$privacy_agreed = isset($_POST['privacy_agreed']) ? $_POST['privacy_agreed'] : false;

// ==================================================
// バリデーション
// ==================================================
$errors = [];

if (empty($company)) {
    $errors[] = '会社名は必須です';
}

if (empty($last_name)) {
    $errors[] = '姓は必須です';
}

if (empty($first_name)) {
    $errors[] = '名は必須です';
}

if (empty($email)) {
    $errors[] = 'メールアドレスは必須です';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'メールアドレスの形式が正しくありません';
}

if (empty($phone)) {
    $errors[] = '電話番号は必須です';
} elseif (!preg_match('/^[0-9-+()]{10,}$/', $phone)) {
    $errors[] = '電話番号の形式が正しくありません';
}

if (empty($inquiry_type) || !is_array($inquiry_type)) {
    $errors[] = 'お問い合わせ内容を選択してください';
}

if (!$privacy_agreed) {
    $errors[] = '個人情報の取扱いに同意してください';
}

// エラーがある場合は返す
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => implode('<br>', $errors)
    ]);
    exit;
}

// ==================================================
// お問い合わせ内容の整形
// ==================================================
$inquiry_type_text = '';
$inquiry_options = [
    'ec_logistics' => 'EC物流サービスについて',
    'work_contract' => '作業請負サービスについて',
    'ai_school' => 'AIスクールについて',
    'other' => 'その他'
];

foreach ($inquiry_type as $type) {
    if (isset($inquiry_options[$type])) {
        $inquiry_type_text .= '・' . $inquiry_options[$type] . "\n";
    }
}

// ==================================================
// メール本文作成（管理者宛）
// ==================================================
$admin_subject = '【お問い合わせ】' . $company . ' 様より';

$admin_body = <<<EOD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
お問い合わせフォームから新規お問い合わせがありました
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 会社名
{$company}

■ お名前
{$last_name} {$first_name} 様

■ メールアドレス
{$email}

■ 電話番号
{$phone}

■ 相談会希望日時
日付: {$consultation_date}
時間: {$consultation_time}

■ お問い合わせ内容
{$inquiry_type_text}

■ お問い合わせ詳細
{$message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
送信日時: {$_SERVER['REQUEST_TIME']}
送信元IP: {$_SERVER['REMOTE_ADDR']}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOD;

// ==================================================
// メール本文作成（自動返信）
// ==================================================
$reply_subject = '【アドレスコーリング】お問い合わせを受け付けました';

$reply_body = <<<EOD
{$last_name} {$first_name} 様

この度は、アドレスコーリング株式会社にお問い合わせいただき、
誠にありがとうございます。

以下の内容でお問い合わせを受け付けいたしました。
担当者より3営業日以内にご連絡させていただきます。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
■ お問い合わせ内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

会社名: {$company}
お名前: {$last_name} {$first_name} 様
メールアドレス: {$email}
電話番号: {$phone}

相談会希望日時:
日付: {$consultation_date}
時間: {$consultation_time}

お問い合わせ内容:
{$inquiry_type_text}

お問い合わせ詳細:
{$message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

※このメールは自動送信されています。
※このメールに心当たりがない場合は、お手数ですが
　下記までご連絡ください。

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
アドレスコーリング株式会社
〒332-0011
埼玉県川口市元郷3-4-11
TEL: 048-224-4846
Email: y-hamano@adrs-s.co.jp
Web: https://adrs-c.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOD;

// ==================================================
// SMTP送信関数
// ==================================================
function sendMailSMTP($to, $to_name, $subject, $body, $reply_to = null) {
    $mail = new PHPMailer(true);

    try {
        // SMTP設定
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USERNAME;
        $mail->Password = SMTP_PASSWORD;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port = SMTP_PORT;
        $mail->CharSet = 'UTF-8';
        $mail->Encoding = 'base64';

        // 送信元
        $mail->setFrom(FROM_EMAIL, FROM_NAME);

        // 返信先
        if ($reply_to) {
            $mail->addReplyTo($reply_to);
        }

        // 宛先
        $mail->addAddress($to, $to_name);

        // メール内容
        $mail->Subject = $subject;
        $mail->Body = $body;
        $mail->isHTML(false);

        // 送信
        $mail->send();
        return true;

    } catch (Exception $e) {
        error_log("メール送信エラー: " . $mail->ErrorInfo);
        return false;
    }
}

// ==================================================
// メール送信
// ==================================================
$mail_sent = false;
$reply_sent = false;

// 管理者宛メール送信
$mail_sent = sendMailSMTP(
    ADMIN_EMAIL,
    '',
    $admin_subject,
    $admin_body,
    $email
);

// 自動返信メール送信
$reply_sent = sendMailSMTP(
    $email,
    $last_name . ' ' . $first_name,
    $reply_subject,
    $reply_body,
    ADMIN_EMAIL
);

// ==================================================
// レスポンス返却
// ==================================================
if ($mail_sent) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'お問い合わせありがとうございます。<br>担当者より3営業日以内にご連絡させていただきます。'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => '送信に失敗しました。お手数ですが、お電話にてお問い合わせください。<br>TEL: 048-224-4846'
    ]);
}
