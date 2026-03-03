import { useState, useEffect } from 'react'
import { Trash2, Reply } from 'lucide-react'
import { api } from '../api/index.js'

function MsgList({ messages, selected, onSelect }) {
  return (
    <div className="w-72 flex-shrink-0 flex flex-col border-r border-white/10"
      style={{background:'rgba(255,255,255,0.12)', backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)'}}>
      <div className="px-4 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <h2 className="text-base font-semibold text-white">收件箱</h2>
        <p className="text-xs text-white/40">{messages.filter(m=>m.unread).length} 封未读</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-16 text-white/25 text-sm">收件箱为空</div>
        ) : messages.map(msg => (
          <button
            key={msg.id}
            onClick={() => onSelect(msg)}
            className="w-full flex items-start gap-3 px-4 py-3.5 transition text-left"
            style={{
              borderBottom:'1px solid rgba(255,255,255,0.06)',
              background: selected?.id === msg.id ? 'rgba(77,166,255,0.15)' : 'transparent',
            }}
            onMouseEnter={e => { if(selected?.id !== msg.id) e.currentTarget.style.background='rgba(255,255,255,0.06)' }}
            onMouseLeave={e => { if(selected?.id !== msg.id) e.currentTarget.style.background='transparent' }}
          >
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${msg.unread ? 'bg-[#4da6ff]' : 'bg-transparent'}`}
              style={msg.unread ? {boxShadow:'0 0 6px rgba(77,166,255,0.7)'} : {}} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <span className={`text-sm truncate ${msg.unread ? 'font-semibold text-white' : 'text-white/65'}`}>{msg.from}</span>
                <span className="text-[10px] text-white/30 flex-shrink-0">
                  {new Date(msg.date).toLocaleDateString('zh-CN', { month:'numeric', day:'numeric' })}
                </span>
              </div>
              <div className={`text-sm truncate mt-0.5 ${msg.unread ? 'font-medium text-white/80' : 'text-white/45'}`}>{msg.subject}</div>
              <div className="text-xs text-white/25 truncate mt-0.5">{msg.body?.split('\n')[0]}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function MsgDetail({ msg, onDelete, onReply }) {
  if (!msg) return (
    <div className="flex-1 flex flex-col items-center justify-center text-white/25">
      <div className="text-5xl mb-3" style={{filter:'grayscale(1) opacity(0.3)'}}>📬</div>
      <p className="text-sm">选择一封信来阅读</p>
    </div>
  )
  return (
    <div className="flex-1 overflow-y-auto px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-white mb-4">{msg.subject}</h1>
        <div className="flex items-center justify-between mb-6 pb-4" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#4da6ff] font-semibold"
              style={{background:'rgba(77,166,255,0.18)'}}>
              {msg.from?.[0] || '?'}
            </div>
            <div>
              <div className="text-sm font-medium text-white/90">{msg.from}</div>
              <div className="text-xs text-white/40">{msg.fromEmail}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/30">
              {new Date(msg.date).toLocaleString('zh-CN', { year:'numeric', month:'long', day:'numeric', hour:'2-digit', minute:'2-digit' })}
            </span>
            <button onClick={onReply} className="p-2 rounded-xl text-white/40 transition"
              onMouseEnter={e => { e.currentTarget.style.background='rgba(77,166,255,0.15)'; e.currentTarget.style.color='rgba(77,166,255,1)' }}
              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='' }}
              title="回复">
              <Reply size={16} />
            </button>
            <button onClick={() => onDelete(msg.id)} className="p-2 rounded-xl text-white/40 transition"
              onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='rgba(248,113,113,1)' }}
              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='' }}
              title="删除">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {msg.trackingId && (
          <div className="mb-6 px-4 py-3 rounded-xl text-xs text-white/55 flex items-center gap-2"
            style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
            <span>📦</span>
            <span>追踪编号：<span className="font-mono font-medium text-white/80">{msg.trackingId}</span></span>
            {msg.from_city && msg.to_city && <span className="text-white/30">· {msg.from_city} → {msg.to_city}</span>}
          </div>
        )}
        <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{msg.body}</div>
      </div>
    </div>
  )
}

export default function InboxView({ onRead }) {
  const [messages, setMessages] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [])

  function load() {
    api.getMessages('inbox').then(msgs => {
      setMessages(msgs)
      if (msgs.length > 0 && !selected) selectMsg(msgs[0], msgs)
    })
  }

  function selectMsg(msg, msgs) {
    setSelected(msg)
    if (msg.unread) {
      api.markRead(msg.id).then(() => {
        const updated = (msgs || messages).map(m => m.id === msg.id ? { ...m, unread: false } : m)
        setMessages(updated)
        onRead?.()
      })
    }
  }

  function handleDelete(id) {
    api.deleteMessage(id).then(() => {
      const updated = messages.filter(m => m.id !== id)
      setMessages(updated)
      setSelected(updated[0] || null)
      onRead?.()
    })
  }

  return (
    <div className="h-full flex">
      <MsgList messages={messages} selected={selected} onSelect={m => selectMsg(m)} />
      <MsgDetail msg={selected} onDelete={handleDelete} onReply={() => {}} />
    </div>
  )
}
