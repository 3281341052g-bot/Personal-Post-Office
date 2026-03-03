import { useState, useEffect } from 'react'
import { Search, Package } from 'lucide-react'
import { api } from '../api/index.js'

const STATUS_LABEL = { delivered:'已签收', transit:'运输中', processing:'处理中' }
const STATUS_STYLE = {
  delivered: { background:'rgba(52,199,89,0.15)', color:'rgba(74,222,128,1)', border:'1px solid rgba(52,199,89,0.25)' },
  transit:   { background:'rgba(255,149,0,0.15)', color:'rgba(251,146,60,1)', border:'1px solid rgba(255,149,0,0.25)' },
  processing:{ background:'rgba(77,166,255,0.15)', color:'rgba(96,165,250,1)', border:'1px solid rgba(77,166,255,0.25)' },
}

function Timeline({ steps }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1`}
              style={step.done
                ? {borderColor:'#4da6ff', background:'#4da6ff', boxShadow:'0 0 8px rgba(77,166,255,0.6)'}
                : {borderColor:'rgba(255,255,255,0.15)', background:'rgba(255,255,255,0.04)'}
              } />
            {i < steps.length - 1 && (
              <div className="w-0.5 flex-1 my-1"
                style={{background: step.done ? 'rgba(77,166,255,0.4)' : 'rgba(255,255,255,0.08)'}} />
            )}
          </div>
          <div className={`pb-5 flex-1 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
            <div className={`text-sm font-medium ${step.done ? 'text-white/90' : 'text-white/25'}`}>{step.event}</div>
            {step.location && <div className="text-xs text-white/40 mt-0.5">{step.location}</div>}
            {step.time && <div className="text-xs text-white/25 mt-0.5">{step.time}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function TrackCard({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3.5 transition"
      style={{
        borderBottom:'1px solid rgba(255,255,255,0.06)',
        background: active ? 'rgba(77,166,255,0.15)' : 'transparent',
      }}
      onMouseEnter={e => { if(!active) e.currentTarget.style.background='rgba(255,255,255,0.06)' }}
      onMouseLeave={e => { if(!active) e.currentTarget.style.background='transparent' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-white/35">{item.id}</span>
        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={STATUS_STYLE[item.status] || {background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)'}}>
          {STATUS_LABEL[item.status] || item.status}
        </span>
      </div>
      <div className="text-sm font-medium text-white/85">{item.from} → {item.to}</div>
      <div className="text-xs text-white/35 mt-0.5">{item.package} · {item.sender} → {item.recipient}</div>
    </button>
  )
}

export default function TrackingView() {
  const [query, setQuery] = useState('')
  const [all, setAll] = useState([])
  const [selected, setSelected] = useState(null)
  const [searching, setSearching] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.getAllTracking().then(list => {
      setAll(list)
      if (list.length > 0) setSelected(list[0])
    })
  }, [])

  async function handleSearch(e) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true); setNotFound(false)
    const result = await api.trackPackage(query)
    if (result) { setSelected(result); if (!all.find(t => t.id === result.id)) setAll(a => [result, ...a]) }
    else setNotFound(true)
    setSearching(false)
  }

  return (
    <div className="h-full flex">
      {/* 左侧列表 */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-white/10"
        style={{background:'rgba(255,255,255,0.12)', backdropFilter:'blur(40px)', WebkitBackdropFilter:'blur(40px)'}}>
        <div className="px-4 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          <h2 className="text-base font-semibold text-white mb-2">实时追踪</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="输入追踪编号…"
              className="glass-input flex-1 text-xs px-3 py-2 rounded-xl"
            />
            <button type="submit" className="p-2 rounded-xl text-white transition glow-blue"
              style={{background:'rgba(77,166,255,0.25)', border:'1px solid rgba(77,166,255,0.4)'}}
              onMouseEnter={e => e.currentTarget.style.background='rgba(77,166,255,0.38)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(77,166,255,0.25)'}
            >
              <Search size={14} />
            </button>
          </form>
          {notFound && <p className="text-xs text-red-400/80 mt-1.5">未找到该追踪编号</p>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {all.length === 0 ? (
            <div className="text-center py-16 text-white/25 text-sm">暂无追踪记录</div>
          ) : all.map(item => (
            <TrackCard key={item.id} item={item} active={selected?.id === item.id} onClick={() => setSelected(item)} />
          ))}
        </div>
      </div>

      {/* 右侧详情 */}
      {selected ? (
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-lg mx-auto">
            <div className="glass rounded-2xl p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs font-mono text-white/30 mb-1">{selected.id}</div>
                  <h2 className="text-lg font-semibold text-white">{selected.from} → {selected.to}</h2>
                  <div className="text-sm text-white/45 mt-0.5">{selected.package}</div>
                </div>
                <span className="text-xs font-medium px-3 py-1.5 rounded-full"
                  style={STATUS_STYLE[selected.status] || {background:'rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)'}}>
                  {STATUS_LABEL[selected.status] || selected.status}
                </span>
              </div>
              <div className="text-xs text-white/30 flex gap-4">
                <span>寄件人：{selected.sender}</span>
                <span>收件人：{selected.recipient}</span>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-white/85 mb-5">物流时间线</h3>
              <Timeline steps={selected.steps || []} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/20">
          <Package size={40} className="mb-3 opacity-30" />
          <p className="text-sm">选择包裹或输入追踪编号</p>
        </div>
      )}
    </div>
  )
}
