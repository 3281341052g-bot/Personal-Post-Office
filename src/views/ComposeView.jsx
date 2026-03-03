import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, X } from 'lucide-react'
import { api } from '../api/index.js'

const PACKAGES = [
  { id: 'letter', label: '普通信封', icon: '✉️', desc: '简约素雅' },
  { id: '心意', label: '心意礼盒', icon: '🎁', desc: '附赠贺卡' },
  { id: '珍藏', label: '珍藏礼盒', icon: '📦', desc: '精致包装' },
  { id: '信笺', label: '信笺套装', icon: '📜', desc: '复古风格' },
]

export default function ComposeView() {
  const navigate = useNavigate()
  const [contacts, setContacts] = useState([])
  const [form, setForm] = useState({ to: '', toEmail: '', subject: '', body: '', package: 'letter', fromCity: '', toCity: '' })
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { api.getContacts().then(setContacts) }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function handleContactSelect(e) {
    const contact = contacts.find(c => c.email === e.target.value)
    if (contact) { set('to', contact.name); set('toEmail', contact.email); set('toCity', contact.city || '') }
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!form.to || !form.body) { setError('请填写收件人和信件内容'); return }
    setError(''); setSending(true)
    try {
      const result = await api.sendMessage(form)
      setSuccess(result.trackingId)
    } catch (err) {
      setError(err.message || '发送失败')
    } finally {
      setSending(false)
    }
  }

  if (success) return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="glass-strong rounded-2xl p-10 text-center max-w-sm w-full relative overflow-hidden mx-4">
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{background:'linear-gradient(135deg,rgba(52,199,89,0.08) 0%,rgba(77,166,255,0.06) 100%)'}} />
        <div className="relative z-10">
          <div className="text-5xl mb-4" style={{filter:'drop-shadow(0 0 16px rgba(52,199,89,0.5))'}}>✅</div>
          <h2 className="text-xl font-semibold text-white mb-2">信件已寄出！</h2>
          <p className="text-sm text-white/50 mb-2">你的信正在路上</p>
          <p className="text-xs font-mono text-white/35 mb-6">{success}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setSuccess(null); setForm({ to:'',toEmail:'',subject:'',body:'',package:'letter',fromCity:'',toCity:'' }) }}
              className="px-5 py-2.5 rounded-xl text-white text-sm font-medium transition glow-blue"
              style={{background:'rgba(77,166,255,0.25)', border:'1px solid rgba(77,166,255,0.45)'}}
              onMouseEnter={e => e.currentTarget.style.background='rgba(77,166,255,0.38)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(77,166,255,0.25)'}
            >再写一封</button>
            <button
              onClick={() => navigate('/tracking')}
              className="px-5 py-2.5 rounded-xl text-white/70 text-sm font-medium transition glass"
            >查看追踪</button>
          </div>
        </div>
      </div>
    </div>
  )

  const fieldStyle = { borderBottom: '1px solid rgba(255,255,255,0.08)' }
  const inputClass = "flex-1 text-sm text-white/85 outline-none placeholder:text-white/25 bg-transparent"

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold text-white mb-6">✍️ 写一封信</h1>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300 flex items-center justify-between"
            style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(248,113,113,0.25)'}}>
            {error}
            <button onClick={() => setError('')} className="text-red-300/60 hover:text-red-300 transition"><X size={14} /></button>
          </div>
        )}

        <form onSubmit={handleSend} className="glass-strong rounded-2xl overflow-hidden">
          {/* 收件人 */}
          <div className="px-6 py-4 flex items-center gap-3" style={fieldStyle}>
            <span className="text-sm text-white/40 w-14 flex-shrink-0">收件人</span>
            <input value={form.to} onChange={e => set('to', e.target.value)} placeholder="姓名" className={inputClass} />
            <select onChange={handleContactSelect} defaultValue=""
              className="text-xs text-[#4da6ff]/80 outline-none cursor-pointer"
              style={{background:'transparent'}}>
              <option value="" style={{background:'#1a1f2e'}}>从地址簿选择</option>
              {contacts.map(c => <option key={c.id} value={c.email} style={{background:'#1a1f2e'}}>{c.name}</option>)}
            </select>
          </div>
          <div className="px-6 py-4 flex items-center gap-3" style={fieldStyle}>
            <span className="text-sm text-white/40 w-14 flex-shrink-0">邮箱</span>
            <input value={form.toEmail} onChange={e => set('toEmail', e.target.value)} placeholder="收件人邮箱地址" className={inputClass} />
          </div>
          <div className="px-6 py-4 flex items-center gap-3" style={fieldStyle}>
            <span className="text-sm text-white/40 w-14 flex-shrink-0">主题</span>
            <input value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="信件主题（可选）" className={inputClass} />
          </div>
          <div className="px-6 py-4 flex items-center gap-3" style={fieldStyle}>
            <span className="text-sm text-white/40 w-14 flex-shrink-0">城市</span>
            <input value={form.fromCity} onChange={e => set('fromCity', e.target.value)} placeholder="寄件城市" className="w-28 text-sm text-white/85 outline-none placeholder:text-white/25 bg-transparent" />
            <span className="text-white/25">→</span>
            <input value={form.toCity} onChange={e => set('toCity', e.target.value)} placeholder="收件城市" className="w-28 text-sm text-white/85 outline-none placeholder:text-white/25 bg-transparent" />
          </div>

          {/* 正文 */}
          <textarea
            value={form.body}
            onChange={e => set('body', e.target.value)}
            placeholder="见字如面…"
            rows={12}
            className="w-full px-6 py-5 text-sm text-white/85 outline-none resize-none placeholder:text-white/25 leading-relaxed bg-transparent"
          />

          {/* 套餐选择 */}
          <div className="px-6 py-4" style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}>
            <p className="text-xs text-white/35 mb-3">信纸套餐</p>
            <div className="flex gap-2">
              {PACKAGES.map(pkg => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => set('package', pkg.id)}
                  className="flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-center transition"
                  style={form.package === pkg.id
                    ? {background:'rgba(77,166,255,0.15)', border:'1px solid rgba(77,166,255,0.5)'}
                    : {background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)'}
                  }
                >
                  <span className="text-xl">{pkg.icon}</span>
                  <span className="text-xs font-medium text-white/80">{pkg.label}</span>
                  <span className="text-[10px] text-white/35">{pkg.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 发送 */}
          <div className="px-6 py-4 flex justify-end" style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}>
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-medium transition disabled:opacity-50 glow-blue"
              style={{background:'rgba(77,166,255,0.25)', border:'1px solid rgba(77,166,255,0.45)'}}
              onMouseEnter={e => !sending && (e.currentTarget.style.background='rgba(77,166,255,0.38)')}
              onMouseLeave={e => e.currentTarget.style.background='rgba(77,166,255,0.25)'}
            >
              <Send size={15} />
              {sending ? '发送中…' : '寄出这封信'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
