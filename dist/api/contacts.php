<?php
/**
 * GET    /api/contacts.php        → 获取联系人列表
 * POST   /api/contacts.php        → 新增/更新联系人
 * DELETE /api/contacts.php?id=xxx → 删除联系人
 */
require '_helper.php';

$sess   = require_session();
$method = $_SERVER['REQUEST_METHOD'];
$key    = 'contacts_' . md5($sess['email']); // 每个账号独立存储

if ($method === 'GET') {
    ok(read_data($key));
}

if ($method === 'POST') {
    $data     = body();
    $contacts = read_data($key);
    $name     = trim($data['name'] ?? '');
    if (!$name) err('姓名不能为空');

    if (!empty($data['id'])) {
        // 更新
        foreach ($contacts as &$c) {
            if ($c['id'] === $data['id']) {
                $c = array_merge($c, $data);
                break;
            }
        }
    } else {
        // 新增
        $data['id'] = 'c-' . time() . '-' . rand(100, 999);
        $contacts[] = $data;
    }
    write_data($key, $contacts);
    ok($contacts);
}

if ($method === 'DELETE') {
    $id       = get('id');
    $contacts = read_data($key);
    $contacts = array_values(array_filter($contacts, fn($c) => $c['id'] !== $id));
    write_data($key, $contacts);
    ok();
}

err('无效请求', 400);
