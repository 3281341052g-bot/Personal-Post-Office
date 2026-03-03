import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Send, Package, PenLine, MapPin, BellDot } from 'lucide-react'
import { api } from '../api/index.js'

function StatCard({ icon: Icon, label, value, glowColor, iconBg, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 glass relative overflow-hidden rounded-2xl p-5 prism text-left transition-all hover:-translate-y-0.5 group"
      style={{'--glow': glowColor}}
      onMouseEnter={e => e.currentTarget.style.boxShadow=`0 8px 32px rgba(0,0,0,0.4), 0 0 24px ${glowColor}22, inset 0 1px 0 rgba(255,255,255,0.2)`}
      onMouseLeave={e => e.currentTarget.style.boxShadow=''}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{background: iconBg}}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      <div className="text-sm text-white/50 mt-0.5">{label}</div>
    </button>
  )
}

function MessageRow({ msg, onClick }) {
  const timeStr = new Date(msg.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-4 py-3 rounded-xl transition text-left"
      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.06)'}
      onMouseLeave={e => e.currentTarget.style.background=''}
    >
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-[#4da6ff] font-semibold text-sm"
        style={{background:'rgba(77,166,255,0.15)'}}>
        {msg.from?.[0] || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`text-sm truncate ${msg.unread ? 'font-semibold text-white' : 'text-white/70'}`}>
            {msg.from}
          </span>
          <span className="text-[11px] text-white/30 flex-shrink-0">{timeStr}</span>
        </div>
        <div className={`text-sm truncate ${msg.unread ? 'font-medium text-white/80' : 'text-white/45'}`}>
          {msg.subject}
        </div>
      </div>
      {msg.unread && <div className="w-2 h-2 rounded-full bg-[#4da6ff] mt-1.5 flex-shrink-0" style={{boxShadow:'0 0 6px rgba(77,166,255,0.6)'}} />}
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const user = api.getCurrentUser()
  const [stats, setStats] = useState({ inbox: 0, sent: 0, unread: 0, tracking: 0 })
  const [recent, setRecent] = useState([])

  useEffect(() => {
    Promise.all([
      api.getMessages('inbox'),
      api.getMessages('sent'),
      api.getAllTracking(),
    ]).then(([inbox, sent, tracking]) => {
      setStats({
        inbox: inbox.length,
        sent: sent.length,
        unread: inbox.filter(m => m.unread).length,
        tracking: tracking.filter(t => t.status !== 'delivered').length,
      })
      setRecent(inbox.slice(0, 5))
    })
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 6 ? '夜深了' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      {/* 问候 */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          {greeting}，{user?.name || '朋友'} 👋
        </h1>
        <p className="text-sm text-white/40 mt-1">
          {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="flex gap-4 mb-8">
        <StatCard icon={Inbox} label="收件箱" value={stats.inbox}
          glowColor="#4da6ff" iconBg="rgba(77,166,255,0.35)"
          onClick={() => navigate('/inbox')} />
        <StatCard icon={Send} label="已发送" value={stats.sent}
          glowColor="#34c759" iconBg="rgba(52,199,89,0.35)"
          onClick={() => navigate('/sent')} />
        <StatCard icon={Package} label="在途包裹" value={stats.tracking}
          glowColor="#ff9500" iconBg="rgba(255,149,0,0.35)"
          onClick={() => navigate('/tracking')} />
        <StatCard icon={BellDot} label="未读消息" value={stats.unread}
          glowColor="#ff3b30" iconBg="rgba(255,59,48,0.35)"
          onClick={() => navigate('/inbox')} />
      </div>

      {/* 快速操作 */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => navigate('/compose')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-medium transition glow-blue"
          style={{background:'rgba(77,166,255,0.22)', border:'1px solid rgba(77,166,255,0.4)'}}
          onMouseEnter={e => e.currentTarget.style.background='rgba(77,166,255,0.32)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(77,166,255,0.22)'}
        >
          <PenLine size={15} /> 写封信
        </button>
        <button
          onClick={() => navigate('/tracking')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white/75 text-sm font-medium transition glass"
          onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background=''}
        >
          <MapPin size={15} /> 查追踪
        </button>
      </div>

      {/* 最近收信 */}
      <div className="glass-strong rounded-2xl overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <h2 className="text-base font-semibold text-white">最近收信</h2>
          <button onClick={() => navigate('/inbox')} className="text-sm text-[#4da6ff]/80 hover:text-[#4da6ff] transition">查看全部</button>
        </div>
        <div className="p-2">
          {recent.length === 0 ? (
            <div className="text-center py-10 text-white/25 text-sm">暂无信件</div>
          ) : (
            recent.map(msg => (
              <MessageRow key={msg.id} msg={msg} onClick={() => navigate('/inbox')} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
