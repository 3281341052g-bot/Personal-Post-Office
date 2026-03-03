import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { api } from '../api/index.js'

function Section({ title, children }) {
  return (
    <div className="glass rounded-2xl overflow-hidden mb-4">
      <div className="px-6 py-4" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <h2 className="text-sm font-semibold text-white/80">{title}</h2>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex items-center gap-4 py-2.5 last:border-0"
      style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
      <label className="text-sm text-white/40 w-28 flex-shrink-0">{label}</label>
      {children}
    </div>
  )
}

export default function SettingsView() {
  const user = api.getCurrentUser()
  const savedCfg = JSON.parse(localStorage.getItem('ppo_server_config') || JSON.stringify({ host:'two.edu.kg', smtpPort:25, imapPort:143, ssl:false, username:'admin@two.edu.kg', password:'' }))
  const [cfg, setCfg] = useState(savedCfg)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [saved, setSaved] = useState(false)

  const set = (k, v) => { setCfg(c => ({ ...c, [k]: v })); setTestResult(null) }

  async function handleTest() {
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch('/api/server-config.php?action=test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Session-Token': localStorage.getItem('ppo_token') || '' },
        body: JSON.stringify(cfg),
      })
      const json = await res.json()
      setTestResult(json.data || { success: false, message: json.error })
    } catch {
      setTestResult({ success: false, message: '网络错误，请检查服务器是否可达' })
    } finally {
      setTesting(false)
    }
  }

  function handleSave() {
    localStorage.setItem('ppo_server_config', JSON.stringify(cfg))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-6">设置</h1>

        <Section title="账号信息">
          <Field label="邮箱"><span className="text-sm text-white/80">{user?.email}</span></Field>
          <Field label="用户名"><span className="text-sm text-white/80">{user?.name}</span></Field>
          <Field label="模式">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={api.isServerMode()
                ? {background:'rgba(52,199,89,0.15)', color:'rgba(74,222,128,1)', border:'1px solid rgba(52,199,89,0.25)'}
                : {background:'rgba(77,166,255,0.15)', color:'rgba(96,165,250,1)', border:'1px solid rgba(77,166,255,0.25)'}
              }>
              {api.isServerMode() ? '服务器模式' : '本地演示模式'}
            </span>
          </Field>
        </Section>

        <Section title="邮件服务器配置">
          <p className="text-xs text-white/30 mb-4">配置宝塔邮局 IMAP/SMTP 服务器参数，保存后重新登录生效。</p>

          {[
            { key:'host', label:'服务器地址', placeholder:'mail.example.com', type:'text' },
            { key:'username', label:'邮箱账号', placeholder:'admin@example.com', type:'email' },
            { key:'password', label:'邮箱密码', placeholder:'••••••••', type:'password' },
            { key:'imapPort', label:'IMAP 端口', placeholder:'143 或 993', type:'number' },
            { key:'smtpPort', label:'SMTP 端口', placeholder:'25、465 或 587', type:'number' },
          ].map(({ key, label, placeholder, type }) => (
            <Field key={key} label={label}>
              <input
                type={type}
                value={cfg[key] || ''}
                onChange={e => set(key, type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                className="glass-input flex-1 text-sm px-3 py-2 rounded-xl"
              />
            </Field>
          ))}

          <Field label="SSL 加密">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={cfg.ssl} onChange={e => set('ssl', e.target.checked)}
                className="rounded" style={{accentColor:'#4da6ff'}} />
              <span className="text-sm text-white/70">启用 SSL/TLS</span>
            </label>
          </Field>

          {testResult && (
            <div className="mt-3 px-4 py-3 rounded-xl text-sm"
              style={testResult.success
                ? {background:'rgba(52,199,89,0.12)', border:'1px solid rgba(52,199,89,0.25)', color:'rgba(74,222,128,1)'}
                : {background:'rgba(239,68,68,0.12)', border:'1px solid rgba(248,113,113,0.25)', color:'rgba(248,113,113,1)'}
              }>
              {testResult.success ? '✅ 连接成功！IMAP 和 SMTP 均正常' : `❌ ${testResult.message || '连接失败'}`}
              {testResult.imap && !testResult.success && (
                <div className="mt-1 text-xs space-y-0.5 opacity-80">
                  <div>IMAP: {testResult.imap.success ? '✅' : '❌'} {testResult.imap.message}</div>
                  <div>SMTP: {testResult.smtp?.success ? '✅' : '❌'} {testResult.smtp?.message}</div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm text-white/70 transition disabled:opacity-50 glass"
              onMouseEnter={e => !testing && (e.currentTarget.style.background='rgba(255,255,255,0.12)')}
              onMouseLeave={e => e.currentTarget.style.background=''}
            >
              {testing ? <Loader2 size={14} className="animate-spin" /> : null}
              {testing ? '测试中…' : '测试连接'}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition glow-blue"
              style={{background:'rgba(77,166,255,0.25)', border:'1px solid rgba(77,166,255,0.45)'}}
              onMouseEnter={e => e.currentTarget.style.background='rgba(77,166,255,0.38)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(77,166,255,0.25)'}
            >
              {saved ? <Check size={14} /> : null}
              {saved ? '已保存' : '保存配置'}
            </button>
          </div>
        </Section>

        <Section title="关于">
          <div className="text-sm text-white/40 space-y-1">
            <div className="text-white/70">个人邮局 · Personal Post Office</div>
            <div className="text-xs text-white/25">版本 1.0.0 · React + Vite + Tailwind CSS · Liquid Glass UI</div>
          </div>
        </Section>
      </div>
    </div>
  )
}
