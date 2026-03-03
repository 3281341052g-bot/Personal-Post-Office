<?php
/**
 * GET  /api/server-config.php        → 读取服务器配置（密码隐藏）
 * POST /api/server-config.php        → 保存服务器配置
 * POST /api/server-config.php?action=test → 测试连接
 */
require '_helper.php';
require '_imap.php';
require '_smtp.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $cfg = get_server_config() ?: [];
    if (isset($cfg['password'])) $cfg['password'] = ''; // 不返回密码
    ok($cfg);
}

if ($method === 'POST') {
    $data = body();

    // 测试连接
    if (get('action') === 'test') {
        $email    = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        if (!$email || !$password) err('请填写邮箱账号和密码');

        // 测 IMAP
        try {
            $imap   = new ImapClient($data, $email, $password);
            $iresult = $imap->test();
        } catch (Exception $e) {
            $iresult = ['success' => false, 'message' => $e->getMessage()];
        }

        // 测 SMTP
        try {
            $smtp    = new SmtpClient($data, $email, $password);
            $sresult = $smtp->test();
        } catch (Exception $e) {
            $sresult = ['success' => false, 'message' => $e->getMessage()];
        }

        ok([
            'imap' => $iresult,
            'smtp' => $sresult,
            'success' => $iresult['success'] && $sresult['success']
        ]);
    }

    // 保存配置
    $cfg = [
        'host'     => trim($data['host']     ?? ''),
        'smtpPort' => (int)($data['smtpPort'] ?? 465),
        'imapPort' => (int)($data['imapPort'] ?? 993),
        'ssl'      => (bool)($data['ssl']     ?? true),
        'username' => trim($data['username']  ?? ''),
        'password' => $data['password']       ?? '',
    ];
    if (empty($cfg['host'])) err('服务器地址不能为空');
    save_server_config($cfg);
    ok(['saved' => true]);
}

err('无效请求', 400);
