import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { api } from '../api/index.js'

const STATUS_LABEL = { delivered:'已签收', transit:'运输中', processing:'处理中' }
const STATUS_STYLE = {
  delivered: { background:'rgba(52,199,89,0.15)', color:'rgba(74,222,128,1)', border:'1px solid rgba(52,199,89,0.25)' },
  transit:   { background:'rgba(255,149,0,0.15)', color:'rgba(251,146,60,1)', border:'1px solid rgba(255,149,0,0.25)' },
  processing:{ background:'rgba(77,166,255,0.15)', color:'rgba(96,165,250,1)', border:'1px solid rgba(77,166,255,0.25)' },
}

export default function SentView() {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.getMessages('sent').then(msgs => {
      setMessages(msgs)
      if (msgs.length > 0) setSelected(msgs[0])
    })
  }, [])

  function handleDelete(id) {
    api.deleteMessage(id).then(() => {
      const updated = messages.filter(m => m.id !== id)
      setMessages(updated)
      setSelected(updated[0] || null)
    })
  }

  return (
    <div className="h-full flex">
      {/* 列表 */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-white/10"
        style={{background:'rgba(255,255,255,0.12)', backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)'}}>
        <div className="px-4 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <h2 className="text-base font-semibold text-white">已发送</h2>
          <p className="text-xs text-white/40">{messages.length} 封</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-16 text-white/25 text-sm">暂无发送记录</div>
          ) : messages.map(msg => (
            <button
              key={msg.id}
              onClick={() => setSelected(msg)}
              className="w-full flex items-start gap-3 px-4 py-3.5 transition text-left"
              style={{
                borderBottom:'1px solid rgba(255,255,255,0.06)',
                background: selected?.id === msg.id ? 'rgba(77,166,255,0.15)' : 'transparent',
              }}
              onMouseEnter={e => { if(selected?.id !== msg.id) e.currentTarget.style.background='rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if(selected?.id !== msg.id) e.currentTarget.style.background='transparent' }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-sm font-medium text-white/85 truncate">致 {msg.to}</span>
                  <span className="text-[10px] text-white/30 flex-shrink-0">
                    {new Date(msg.date).toLocaleDateString('zh-CN', { month:'numeric', day:'numeric' })}
                  </span>
                </div>
                <div className="text-sm text-white/45 truncate mt-0.5">{msg.subject}</div>
                {msg.trackingStatus && (
                  <span className="inline-block text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded-md"
                    style={STATUS_STYLE[msg.trackingStatus] || {background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)'}}>
                    {STATUS_LABEL[msg.trackingStatus] || msg.trackingStatus}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 详情 */}
      {selected ? (
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-semibold text-white mb-4">{selected.subject}</h1>
            <div className="flex items-center justify-between mb-6 pb-4" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              <div>
                <div className="text-sm text-white/50">收件人：<span className="text-white/85 font-medium">{selected.to}</span></div>
                <div className="text-xs text-white/30">{selected.toEmail}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/30">
                  {new Date(selected.date).toLocaleString('zh-CN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                </span>
                <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-xl text-white/40 transition"
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='rgba(248,113,113,1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='' }}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {selected.trackingId && (
              <div className="mb-6 px-4 py-3 rounded-xl text-xs text-white/55 flex items-center gap-3"
                style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
                <span>📦</span>
                <div>
                  <div>追踪编号：<span className="font-mono font-medium text-white/80">{selected.trackingId}</span></div>
                  {selected.from_city && selected.to_city && (
                    <div className="text-white/30 mt-0.5">{selected.from_city} → {selected.to_city}</div>
                  )}
                </div>
                {selected.trackingStatus && (
                  <span className="ml-auto text-xs font-medium px-2 py-1 rounded-lg"
                    style={STATUS_STYLE[selected.trackingStatus] || {background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)'}}>
                    {STATUS_LABEL[selected.trackingStatus] || selected.trackingStatus}
                  </span>
                )}
              </div>
            )}
            <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{selected.body}</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/25">
          <div className="text-5xl mb-3" style={{filter:'grayscale(1) opacity(0.3)'}}>📤</div>
          <p className="text-sm">选择一封信来查看</p>
        </div>
      )}
    </div>
  )
}
