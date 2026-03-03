/* ═══════════════════════════════════════════════════
   API 适配层 · 自动切换 Mock / 真实 PHP 模式
   ─────────────────────────────────────────────────
   演示模式（token 以 demo- 开头）: 使用 localStorage Mock 数据
   真实模式（IMAP token）       : 调用 dist/api/*.php 接口
═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Mock 数据初始化 ─────────────────────────── */
  function initMockData() {
    if (localStorage.getItem('ppo_mock_initialized')) return;

    const inbox = [
      {
        id: 'msg-001', folder: 'inbox', unread: true, starred: false,
        from: '林小雨', fromEmail: 'lin@example.com',
        to: '我', toEmail: 'me@postoffice.com',
        subject: '好久不见，最近还好吗？',
        body: '亲爱的朋友，\n\n好久没有联系了，不知道你最近过得怎么样？\n\n前几天看到街上的梧桐叶落了，忽然想起我们一起走过那条街道的时光。那时候我们总是聊到很晚，对未来有着说不完的幻想。\n\n现在，我在一家小书店做店员，每天和书为伴，虽然薪水不高，但很安心。你呢？还在那家公司工作吗？\n\n希望你一切安好。期待你的回信。\n\n林小雨 敬上\n2026年3月1日，于成都',
        date: '2026-03-01T09:12:00', trackingId: 'PPO-20260301-1234',
        trackingStatus: 'delivered', package: '心意', from_city: '成都', to_city: '上海'
      },
      {
        id: 'msg-002', folder: 'inbox', unread: true, starred: true,
        from: '张伟明', fromEmail: 'zhang@example.com',
        to: '我', toEmail: 'me@postoffice.com',
        subject: '生日快乐！来自纽约的祝福',
        body: '生日快乐！\n\n隔着太平洋，送上我最真诚的祝福。\n\n我在纽约一切都好，这里的秋天很美，只是少了你们这群老朋友。\n\n张伟明\n2026年2月28日，于纽约',
        date: '2026-02-28T14:30:00', trackingId: 'PPO-20260228-5678',
        trackingStatus: 'delivered', package: '珍藏', from_city: '纽约', to_city: '上海'
      },
      {
        id: 'msg-003', folder: 'inbox', unread: false, starred: false,
        from: '陈思远', fromEmail: 'chen@example.com',
        to: '我', toEmail: 'me@postoffice.com',
        subject: '谢谢你的那封信',
        body: '你好，\n\n收到你上个月的来信，我激动了好久。\n\n希望我们能继续这样通信。\n\n陈思远',
        date: '2026-02-20T16:22:00', trackingId: null,
        trackingStatus: null, package: null, from_city: '北京', to_city: '上海'
      }
    ];

    const sent = [
      {
        id: 'sent-001', folder: 'sent', unread: false, starred: false,
        from: '我', fromEmail: 'me@postoffice.com',
        to: '王芳芳', toEmail: 'wang@example.com',
        subject: '致远方的你',
        body: '芳芳，\n\n见字如面。\n\n好久没有联系，却总是在某个安静的午后想起你。\n\n期待你的回信。',
        date: '2026-02-25T11:00:00', trackingId: 'PPO-20260225-9012',
        trackingStatus: 'delivered', package: '心意', from_city: '上海', to_city: '深圳'
      },
      {
        id: 'sent-002', folder: 'sent', unread: false, starred: true,
        from: '我', fromEmail: 'me@postoffice.com',
        to: '爸爸妈妈', toEmail: 'parents@example.com',
        subject: '报平安，顺便说说近况',
        body: '爸爸妈妈，\n\n好久没打电话，想着写封信给你们。\n\n我在上海一切都好，工作虽然忙，但已经慢慢适应了。\n\n爱你们的孩子',
        date: '2026-02-10T20:30:00', trackingId: 'PPO-20260210-3344',
        trackingStatus: 'delivered', package: '信笺', from_city: '上海', to_city: '武汉'
      }
    ];

    const contacts = [
      { id: 'c-001', name: '林小雨', email: 'lin@example.com', phone: '138-0000-0001', city: '成都', note: '大学室友' },
      { id: 'c-002', name: '张伟明', email: 'zhang@example.com', phone: '138-0000-0002', city: '纽约', note: '留学好友' },
      { id: 'c-003', name: '王芳芳', email: 'wang@example.com', phone: '138-0000-0003', city: '深圳', note: '高中同学' },
      { id: 'c-004', name: '陈思远', email: 'chen@example.com', phone: '138-0000-0004', city: '北京', note: '网友' }
    ];

    const tracking = [
      {
        id: 'PPO-20260301-1234', status: 'delivered',
        from: '成都', to: '上海', package: '心意',
        sender: '林小雨', recipient: '我',
        steps: [
          { event: '已封装', location: '成都分拣中心', time: '2026-03-01 09:12', done: true },
          { event: '已揽收', location: '成都快递', time: '2026-03-01 14:30', done: true },
          { event: '运输中', location: '成都→上海', time: '2026-03-01 20:00', done: true },
          { event: '派送中', location: '上海浦东配送站', time: '2026-03-02 08:30', done: true },
          { event: '已签收', location: '上海收件点', time: '2026-03-02 11:20', done: true }
        ]
      },
      {
        id: 'PPO-20260225-9012', status: 'delivered',
        from: '上海', to: '深圳', package: '心意',
        sender: '我', recipient: '王芳芳',
        steps: [
          { event: '已封装', location: '上海分拣中心', time: '2026-02-25 11:00', done: true },
          { event: '已揽收', location: '上海快递', time: '2026-02-25 15:00', done: true },
          { event: '运输中', location: '上海→深圳', time: '2026-02-25 21:00', done: true },
          { event: '派送中', location: '深圳配送站', time: '2026-03-02 09:00', done: true },
          { event: '已签收', location: '深圳收件点', time: '2026-03-02 10:45', done: true }
        ]
      }
    ];

    localStorage.setItem('ppo_inbox', JSON.stringify(inbox));
    localStorage.setItem('ppo_sent', JSON.stringify(sent));
    localStorage.setItem('ppo_contacts', JSON.stringify(contacts));
    localStorage.setItem('ppo_tracking', JSON.stringify(tracking));
    localStorage.setItem('ppo_mock_initialized', '1');
  }

  /* ── API 核心 ──────────────────────────────── */
  window.api = {

    // 是否为演示模式
    _demo() {
      const token = localStorage.getItem('ppo_token');
      return !token || token.startsWith('demo-');
    },

    // 调用 PHP 接口（含 session token 鉴权）
    async _fetch(path, opts = {}) {
      const token = localStorage.getItem('ppo_token') || '';
      const headers = { 'Content-Type': 'application/json', 'X-Session-Token': token };
      const resp = await fetch('api/' + path, {
        ...opts,
        headers: { ...headers, ...(opts.headers || {}) }
      });
      const data = await resp.json();
      if (!data.ok) {
        if (resp.status === 401) {
          // 会话过期，退回登录页
          localStorage.removeItem('ppo_user');
          localStorage.removeItem('ppo_token');
          window.location.href = 'index.html';
          throw new Error('会话已过期');
        }
        throw new Error(data.error || '请求失败');
      }
      return data.data;
    },

    // ── 认证 ────────────────────────────────────
    getCurrentUser() {
      return JSON.parse(localStorage.getItem('ppo_user') || 'null');
    },
    logout() {
      localStorage.removeItem('ppo_user');
      localStorage.removeItem('ppo_token');
      window.location.href = 'index.html';
    },

    // ── 邮件列表 ──────────────────────────────
    async getMessages(folder = 'inbox') {
      if (this._demo()) {
        const key = folder === 'inbox' ? 'ppo_inbox' : 'ppo_sent';
        return JSON.parse(localStorage.getItem(key) || '[]');
      }
      try {
        const result = await this._fetch('messages.php?folder=' + folder);
        return result.messages || [];
      } catch (e) {
        console.error('getMessages 失败:', e);
        return [];
      }
    },

    // ── 单封邮件详情 ──────────────────────────
    async getMessage(id) {
      if (this._demo()) {
        const all = [
          ...JSON.parse(localStorage.getItem('ppo_inbox') || '[]'),
          ...JSON.parse(localStorage.getItem('ppo_sent') || '[]')
        ];
        return all.find(m => m.id === id) || null;
      }
      try {
        const result = await this._fetch('messages.php?id=' + encodeURIComponent(id));
        return result.message || null;
      } catch (e) {
        return null;
      }
    },

    // ── 标记已读 ──────────────────────────────
    async markRead(id) {
      if (this._demo()) {
        ['ppo_inbox', 'ppo_sent'].forEach(key => {
          const msgs = JSON.parse(localStorage.getItem(key) || '[]');
          const idx = msgs.findIndex(m => m.id === id);
          if (idx >= 0) {
            msgs[idx].unread = false;
            localStorage.setItem(key, JSON.stringify(msgs));
          }
        });
        return;
      }
      try {
        await this._fetch('messages.php?action=read&id=' + encodeURIComponent(id), { method: 'POST' });
      } catch (e) { /* 标记失败不中断流程 */ }
    },

    // ── 删除邮件 ──────────────────────────────
    async deleteMessage(id) {
      if (this._demo()) {
        ['ppo_inbox', 'ppo_sent'].forEach(key => {
          const msgs = JSON.parse(localStorage.getItem(key) || '[]');
          localStorage.setItem(key, JSON.stringify(msgs.filter(m => m.id !== id)));
        });
        return;
      }
      await this._fetch('messages.php?id=' + encodeURIComponent(id), { method: 'DELETE' });
    },

    // ── 发送邮件 ──────────────────────────────
    async sendMessage(data) {
      if (this._demo()) {
        const sent = JSON.parse(localStorage.getItem('ppo_sent') || '[]');
        const user = this.getCurrentUser();
        const trackingId = 'PPO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(Math.random() * 9000 + 1000);
        const newMsg = {
          id: 'sent-' + Date.now(), folder: 'sent', unread: false, starred: false,
          from: user ? user.name : '我', fromEmail: user ? user.email : '',
          to: data.to, toEmail: data.toEmail || data.to,
          subject: data.subject, body: data.body,
          date: new Date().toISOString(), trackingId,
          trackingStatus: 'processing', package: data.package,
          from_city: data.fromCity || '出发地', to_city: data.toCity || '目的地'
        };
        sent.unshift(newMsg);
        localStorage.setItem('ppo_sent', JSON.stringify(sent));
        const tracking = JSON.parse(localStorage.getItem('ppo_tracking') || '[]');
        tracking.unshift({
          id: trackingId, status: 'processing',
          from: data.fromCity || '出发地', to: data.toCity || '目的地',
          package: data.package, sender: user ? user.name : '我', recipient: data.to,
          steps: [
            { event: '已封装', location: '分拣中心', time: new Date().toLocaleString('zh-CN'), done: true },
            { event: '等待揽收', location: '待安排', time: null, done: false },
            { event: '运输中', location: null, time: null, done: false },
            { event: '派送中', location: null, time: null, done: false },
            { event: '已签收', location: null, time: null, done: false }
          ]
        });
        localStorage.setItem('ppo_tracking', JSON.stringify(tracking));
        return { success: true, trackingId };
      }
      const result = await this._fetch('send.php', {
        method: 'POST',
        body: JSON.stringify({
          to: data.to, toEmail: data.toEmail || data.to,
          subject: data.subject, body: data.body,
          package: data.package, fromCity: data.fromCity, toCity: data.toCity
        })
      });
      return { success: true, trackingId: result.trackingId };
    },

    // ── 未读数量 ──────────────────────────────
    async getUnreadCount() {
      if (this._demo()) {
        const inbox = JSON.parse(localStorage.getItem('ppo_inbox') || '[]');
        return inbox.filter(m => m.unread).length;
      }
      try {
        const result = await this._fetch('messages.php?folder=inbox');
        const msgs = result.messages || [];
        return msgs.filter(m => m.unread).length;
      } catch (e) {
        return 0;
      }
    },

    // ── 追踪（始终使用本地数据，IMAP 无追踪概念） ──
    trackPackage(trackingId) {
      const tracking = JSON.parse(localStorage.getItem('ppo_tracking') || '[]');
      return Promise.resolve(tracking.find(t => t.id === trackingId.trim().toUpperCase()) || null);
    },
    getAllTracking() {
      return Promise.resolve(JSON.parse(localStorage.getItem('ppo_tracking') || '[]'));
    },

    // ── 联系人 ────────────────────────────────
    async getContacts() {
      if (this._demo()) {
        return JSON.parse(localStorage.getItem('ppo_contacts') || '[]');
      }
      try {
        const result = await this._fetch('contacts.php');
        return Array.isArray(result) ? result : [];
      } catch (e) {
        return JSON.parse(localStorage.getItem('ppo_contacts') || '[]');
      }
    },
    async saveContact(contact) {
      if (this._demo()) {
        const contacts = JSON.parse(localStorage.getItem('ppo_contacts') || '[]');
        if (contact.id) {
          const idx = contacts.findIndex(c => c.id === contact.id);
          if (idx >= 0) contacts[idx] = contact; else contacts.push(contact);
        } else {
          contact.id = 'c-' + Date.now();
          contacts.push(contact);
        }
        localStorage.setItem('ppo_contacts', JSON.stringify(contacts));
        return contact;
      }
      const result = await this._fetch('contacts.php', {
        method: 'POST',
        body: JSON.stringify(contact)
      });
      return contact;
    },
    async deleteContact(id) {
      if (this._demo()) {
        const contacts = JSON.parse(localStorage.getItem('ppo_contacts') || '[]');
        localStorage.setItem('ppo_contacts', JSON.stringify(contacts.filter(c => c.id !== id)));
        return;
      }
      await this._fetch('contacts.php?id=' + encodeURIComponent(id), { method: 'DELETE' });
    },

    // ── 服务器配置 ────────────────────────────
    getServerConfig() {
      return JSON.parse(localStorage.getItem('ppo_server_config') || JSON.stringify({
        host: '', smtpPort: 465, imapPort: 993, ssl: true, username: '', password: ''
      }));
    },

    // 从 PHP 加载服务器配置（异步，供设置页调用）
    async loadServerConfig() {
      try {
        const result = await this._fetch('server-config.php');
        if (result && result.host) {
          const current = this.getServerConfig();
          localStorage.setItem('ppo_server_config', JSON.stringify({
            ...current, ...result, password: current.password
          }));
          return result;
        }
      } catch (e) { /* PHP 不可用时，继续用 localStorage */ }
      return this.getServerConfig();
    },

    async saveServerConfig(config) {
      localStorage.setItem('ppo_server_config', JSON.stringify(config));
      // 同步保存到 PHP
      try {
        await this._fetch('server-config.php', {
          method: 'POST',
          body: JSON.stringify(config)
        });
      } catch (e) {
        console.warn('PHP 服务器配置保存失败，仅保存到本地:', e.message);
      }
    },

    async testConnection(config) {
      try {
        const result = await this._fetch('server-config.php?action=test', {
          method: 'POST',
          body: JSON.stringify(config)
        });
        return {
          success: result.success,
          message: result.imap?.success
            ? (result.smtp?.success ? 'IMAP 和 SMTP 均连接成功！' : 'IMAP 成功，SMTP 失败：' + result.smtp?.message)
            : 'IMAP 连接失败：' + result.imap?.message
        };
      } catch (e) {
        return { success: false, message: e.message || '无法连接服务器，请确认后端 PHP 已启用' };
      }
    }
  };

  initMockData();

})();
