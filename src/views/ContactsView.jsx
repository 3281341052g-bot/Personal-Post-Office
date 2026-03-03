import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { api } from '../api/index.js'

function ContactModal({ contact, onSave, onClose }) {
  const [form, setForm] = useState(contact || { name:'', email:'', phone:'', city:'', note:'' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function handleSave(e) {
    e.preventDefault()
    if (!form.name) return
    onSave(form)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{background:'rgba(0,0,0,0.6)', backdropFilter:'blur(8px)'}}>
      <div className="glass-strong rounded-2xl w-full max-w-sm relative overflow-hidden">
        {/* 折射层 */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{background:'linear-gradient(135deg,rgba(77,166,255,0.06) 0%,rgba(160,100,255,0.04) 100%)'}} />
        <div className="relative z-10">
          <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
            <h2 className="text-base font-semibold text-white">{contact?.id ? '编辑联系人' : '新增联系人'}</h2>
            <button onClick={onClose} className="p-1.5 rounded-xl text-white/40 transition"
              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.8)' }}
              onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='' }}>
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleSave} className="px-6 py-4 space-y-3">
            {[
              { key:'name', label:'姓名 *', placeholder:'联系人姓名' },
              { key:'email', label:'邮箱', placeholder:'email@example.com' },
              { key:'phone', label:'电话', placeholder:'138-0000-0000' },
              { key:'city', label:'城市', placeholder:'所在城市' },
              { key:'note', label:'备注', placeholder:'认识方式或其他备注' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs text-white/40 mb-1 block">{label}</label>
                <input
                  value={form[key]}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                  className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                />
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm text-white/60 transition glass"
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.currentTarget.style.background=''}
              >取消</button>
              <button type="submit"
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-medium transition glow-blue"
                style={{background:'rgba(77,166,255,0.25)', border:'1px solid rgba(77,166,255,0.45)'}}
                onMouseEnter={e => e.currentTarget.style.background='rgba(77,166,255,0.38)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(77,166,255,0.25)'}
              >保存</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ContactsView() {
  const [contacts, setContacts] = useState([])
  const [modal, setModal] = useState(null)

  useEffect(() => { api.getContacts().then(setContacts) }, [])

  function load() { api.getContacts().then(setContacts) }

  function handleSave(form) {
    api.saveContact(form).then(() => { load(); setModal(null) })
  }

  function handleDelete(id) {
    if (!confirm('确定删除这个联系人？')) return
    api.deleteContact(id).then(load)
  }

  return (
    <div className="h-full overflow-y-auto px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">地址簿</h1>
          <p className="text-sm text-white/40 mt-0.5">{contacts.length} 位联系人</p>
        </div>
        <button
          onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition glow-blue"
          style={{background:'rgba(77,166,255,0.22)', border:'1px solid rgba(77,166,255,0.4)'}}
          onMouseEnter={e => e.currentTarget.style.background='rgba(77,166,255,0.32)'}
          onMouseLeave={e => e.currentTarget.style.background='rgba(77,166,255,0.22)'}
        >
          <Plus size={15} /> 新增联系人
        </button>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-20 text-white/20">
          <div className="text-5xl mb-3" style={{filter:'grayscale(1) opacity(0.2)'}}>👤</div>
          <p className="text-sm">还没有联系人，点击右上角添加</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {contacts.map(c => (
            <div key={c.id} className="glass rounded-2xl p-5 transition-all hover:-translate-y-0.5"
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.11)'}
              onMouseLeave={e => e.currentTarget.style.background=''}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-[#4da6ff] font-semibold text-lg"
                  style={{background:'rgba(77,166,255,0.18)', boxShadow:'0 0 12px rgba(77,166,255,0.2)'}}>
                  {c.name[0]}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal(c)} className="p-1.5 rounded-lg text-white/30 transition"
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.color='rgba(255,255,255,0.8)' }}
                    onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='' }}>
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-lg text-white/30 transition"
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='rgba(248,113,113,1)' }}
                    onMouseLeave={e => { e.currentTarget.style.background=''; e.currentTarget.style.color='' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <div className="text-sm font-semibold text-white/90">{c.name}</div>
              {c.city && <div className="text-xs text-white/40 mt-0.5">📍 {c.city}</div>}
              {c.email && <div className="text-xs text-white/30 mt-1 truncate">{c.email}</div>}
              {c.note && <div className="text-xs text-white/25 mt-1 truncate">{c.note}</div>}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ContactModal
          contact={modal === 'new' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
