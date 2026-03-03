import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { api } from '../api/index.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('ppo_user') || 'null')
    if (user?.loggedIn) { navigate('/'); return }
    const saved = localStorage.getItem('ppo_email')
    if (saved) { setEmail(saved); setRemember(true) }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email || !password) { setError('请填写邮箱和密码'); return }
    setError(''); setLoading(true)
    try {
      const { user, token } = await api.login(email, password)
      if (remember) localStorage.setItem('ppo_email', email)
      else localStorage.removeItem('ppo_email')
      localStorage.setItem('ppo_token', token)
      localStorage.setItem('ppo_user', JSON.stringify({ ...user, loggedIn: true }))
      navigate('/')
    } catch (err) {
      setError(err.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{background:'linear-gradient(135deg,#0d1b2e 0%,#1a2d4a 50%,#1e3558 100%)'}}>

      {/* 背景光晕球 */}
      <div className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{top:'-80px', left:'-80px', background:'radial-gradient(circle,rgba(77,166,255,0.15) 0%,transparent 70%)', filter:'blur(40px)'}} />
      <div className="absolute w-80 h-80 rounded-full pointer-events-none"
        style={{bottom:'-60px', right:'-60px', background:'radial-gradient(circle,rgba(160,100,255,0.12) 0%,transparent 70%)', filter:'blur(40px)'}} />

      {/* Logo */}
      <div className="text-center mb-8 relative z-10">
        <div className="text-5xl mb-3" style={{filter:'drop-shadow(0 0 16px rgba(77,166,255,0.5))'}}>✉️</div>
        <h1 className="text-2xl font-semibold text-white tracking-tight">个人邮局</h1>
        <p className="text-sm text-white/40 mt-1">Personal Post Office</p>
      </div>

      {/* 卡片 */}
      <div className="w-full max-w-sm glass-strong rounded-2xl p-8 relative overflow-hidden z-10">
        {/* 彩虹折射层 */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{background:'linear-gradient(135deg,rgba(255,120,180,0.07) 0%,rgba(120,160,255,0.07) 40%,rgba(100,220,200,0.05) 100%)'}} />

        <div className="relative z-10">
          <h2 className="text-xl font-semibold text-white mb-1">欢迎回来</h2>
          <p className="text-sm text-white/45 mb-6">登录你的个人邮局账户</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm text-red-300"
              style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(248,113,113,0.25)'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">邮箱地址</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@example.com"
                  autoComplete="email"
                  className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">密码</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  className="glass-input w-full pl-10 pr-10 py-2.5 rounded-xl text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70 transition"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-white/55 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="rounded"
                  style={{accentColor:'#4da6ff'}}
                />
                记住我
              </label>
              <button type="button" className="text-sm text-[#4da6ff]/80 hover:text-[#4da6ff] transition">忘记密码？</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed mt-2 glow-blue"
              style={{background:'rgba(77,166,255,0.25)', border:'1px solid rgba(77,166,255,0.45)'}}
              onMouseEnter={e => !loading && (e.currentTarget.style.background='rgba(77,166,255,0.38)')}
              onMouseLeave={e => e.currentTarget.style.background='rgba(77,166,255,0.25)'}
            >
              {loading ? '登录中…' : '登录'}
            </button>
          </form>

          <p className="mt-5 text-xs text-center text-white/25 leading-relaxed">
            服务器模式：使用宝塔邮局账号和密码登录<br />
            本地演示：任意邮箱 + 任意密码均可
          </p>
        </div>
      </div>

      <p className="mt-6 text-xs text-white/20 relative z-10">
        © 2026 个人邮局 · <a href="#" className="hover:text-white/40 transition">隐私政策</a> · <a href="#" className="hover:text-white/40 transition">服务条款</a>
      </p>
    </div>
  )
}
