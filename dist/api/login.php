<?php
/**
 * POST /api/login.php
 * body: { email, password }
 * 成功: { ok: true, data: { token, user } }
 */
require '_helper.php';
require '_imap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') err('仅支持 POST', 405);

$body     = body();
$email    = trim($body['email'] ?? '');
$password = $body['password'] ?? '';

if (!$email || !$password) err('请填写邮箱和密码');

$cfg = get_server_config();

// 未配置服务器 → 返回演示模式标记
if (!$cfg) {
    $name = explode('@', $email)[0];
    $name = ucfirst($name);
    ok([
        'token' => 'demo-' . md5($email),
        'demo'  => true,
        'user'  => ['email' => $email, 'name' => $name, 'avatar' => strtoupper($name[0])]
    ]);
}

// 已配置 → 用 IMAP 验证
try {
    $imap = new ImapClient($cfg, $email, $password);
    $result = $imap->test();
    if (!$result['success']) err('邮箱或密码错误：' . $result['message']);

    $token = create_session($email, $password);
    $name  = explode('@', $email)[0];
    $name  = ucfirst($name);
    ok([
        'token' => $token,
        'demo'  => false,
        'user'  => ['email' => $email, 'name' => $name, 'avatar' => strtoupper($name[0])]
    ]);
} catch (Exception $e) {
    err($e->getMessage());
}
