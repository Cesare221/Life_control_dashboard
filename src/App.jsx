import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './styles.css'

const DEFAULT_THEME = 'system'
const STORAGE_KEY = 'mld-theme'
const DASHBOARD_STORAGE_KEY = 'mld-dashboard-data'
const MEMORIES_STORAGE_KEY = 'mld-memories'

const todayStr = () => new Date().toDateString()
const todayKey = () => new Date().toISOString().slice(0, 10)

const baseData = {
  firstName: '',
  lastName: '',
  heightCm: '',
  birthday: '',
  habits: [
    { id: 1, label: 'Exercício', done: false },
    { id: 2, label: 'Leitura', done: false },
    { id: 3, label: 'Meditar', done: false },
  ],
  water: 0,
  sleep: '',
  steps: '',
  expenses: [],
  archive: [],
  lastDay: todayStr(),
}

const asNumber = value => {
  const n = Number.parseFloat(String(value).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

const mergeData = saved => {
  if (!saved) return baseData
  return {
    ...baseData,
    ...saved,
    habits: (saved.habits || baseData.habits).map(h => ({ ...h, done: !!h.done })),
    expenses: saved.expenses || [],
    archive: saved.archive || [],
  }
}

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME)
  const [toast, setToast] = useState('')
  const [recentChange, setRecentChange] = useState('')
  const [undoState, setUndoState] = useState(null)
  const [errors, setErrors] = useState({})
  const [newHabit, setNewHabit] = useState('')
  const [expDesc, setExpDesc] = useState('')
  const [expAmount, setExpAmount] = useState('')
  const [expCat, setExpCat] = useState('Alimentação')
  const [data, setData] = useState(baseData)
  const [memories, setMemories] = useState([])
  const [now, setNow] = useState(new Date())
  const toastTimer = useRef(null)
  const undoTimer = useRef(null)
  const { birthday, habits, water, sleep, steps, expenses, firstName, lastName, heightCm } = data

  const update = useCallback(patch => setData(prev => ({ ...prev, ...patch })), [])
  const announce = useCallback(message => {
    setRecentChange(message)
    window.clearTimeout(toastTimer.current)
    setToast(message)
    toastTimer.current = window.setTimeout(() => setToast(''), 2800)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    const applySystemTheme = () => {
      document.documentElement.dataset.systemTheme = mq?.matches ? 'dark' : 'light'
    }
    if (theme === 'system') {
      applySystemTheme()
      mq?.addEventListener?.('change', applySystemTheme)
      return () => mq?.removeEventListener?.('change', applySystemTheme)
    }
    document.documentElement.dataset.systemTheme = theme
    return undefined
  }, [theme])

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DASHBOARD_STORAGE_KEY)
      if (saved) setData(mergeData(JSON.parse(saved)))
    } catch {}

    try {
      const savedMemories = localStorage.getItem(MEMORIES_STORAGE_KEY)
      if (savedMemories) setMemories(JSON.parse(savedMemories))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(data))
  }, [data])

  useEffect(() => {
    localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memories))
  }, [memories])

  const life = useMemo(() => {
    if (!birthday) return null
    const bd = new Date(birthday)
    if (Number.isNaN(bd) || bd > now) return null
    const diff = now - bd
    const days = Math.floor(diff / 86400000)
    const weeks = Math.floor(days / 7)
    const years = diff / (365.25 * 86400000)
    const pct = Math.min((years / 80) * 100, 100)
    const nb = new Date(bd)
    nb.setFullYear(now.getFullYear())
    if (nb <= now) nb.setFullYear(now.getFullYear() + 1)
    const daysToNb = Math.ceil((nb - now) / 86400000)
    return { days, weeks, age: Math.floor(years), pct, daysToNb }
  }, [birthday, now])

  const dailySnapshot = useMemo(() => ({
    date: todayKey(),
    name: [firstName, lastName].filter(Boolean).join(' ') || 'Sem nome',
    heightCm: asNumber(heightCm) || null,
    age: life?.age ?? null,
    daysAlive: life?.days ?? null,
    water,
    sleep: sleep || null,
    steps: steps ? parseInt(steps, 10) : 0,
    expensesTotal: expenses.reduce((sum, e) => sum + e.amount, 0),
    habitsDone: habits.filter(h => h.done).length,
    habitsTotal: habits.length,
  }), [expenses, firstName, habits, heightCm, lastName, life, sleep, steps, water])

  useEffect(() => {
    const latest = memories[0]
    if (latest?.date === dailySnapshot.date && JSON.stringify(latest) === JSON.stringify(dailySnapshot)) return
    setMemories(prev => {
      const withoutToday = prev.filter(item => item.date !== dailySnapshot.date)
      return [dailySnapshot, ...withoutToday].slice(0, 60)
    })
  }, [dailySnapshot])

  const yearPct = useMemo(() => {
    const s = new Date(now.getFullYear(), 0, 1)
    const e = new Date(now.getFullYear() + 1, 0, 1)
    return ((now - s) / (e - s)) * 100
  }, [now])

  const monthPct = useMemo(() => {
    const s = new Date(now.getFullYear(), now.getMonth(), 1)
    const e = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    return ((now - s) / (e - s)) * 100
  }, [now])

  const dayPct = useMemo(() => {
    const sod = new Date(now)
    sod.setHours(0, 0, 0, 0)
    return ((now - sod) / 86400000) * 100
  }, [now])

  const dayOfYear = useMemo(() => {
    const s = new Date(now.getFullYear(), 0, 1)
    return Math.floor((now - s) / 86400000) + 1
  }, [now])

  const daysInYear = now.getFullYear() % 4 === 0 ? 366 : 365
  const daysLeftMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate() - now.getDate()
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0)
  const habitsDone = habits.filter(h => h.done).length
  const allHabitsDone = habits.length > 0 && habitsDone === habits.length
  const sleepPct = Math.min((Number(sleep || 0) / 12) * 100, 100)
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long' })
  const currentTheme = theme === 'system' ? document.documentElement.dataset.systemTheme || 'light' : theme
  const memoriesDesc = [...memories].slice().reverse()
  const latestMemory = memoriesDesc[0]
  const previousMemory = memoriesDesc[1]
  const memoryDelta = latestMemory && previousMemory ? {
    water: latestMemory.water - previousMemory.water,
    steps: latestMemory.steps - previousMemory.steps,
    sleep: Number(latestMemory.sleep || 0) - Number(previousMemory.sleep || 0),
    expenses: latestMemory.expensesTotal - previousMemory.expensesTotal,
  } : null

  const toggleHabit = id => {
    update({ habits: habits.map(h => (h.id === id ? { ...h, done: !h.done } : h)) })
  }

  const addHabit = () => {
    const label = newHabit.trim()
    if (!label) return
    update({ habits: [...habits, { id: Date.now(), label, done: false }] })
    setNewHabit('')
  }

  const removeHabit = id => {
    const removed = habits.find(h => h.id === id)
    if (!removed || !window.confirm(`Remover o hábito "${removed.label}"?`)) return
    update({ habits: habits.filter(h => h.id !== id) })
  }

  const addExpense = () => {
    const desc = expDesc.trim()
    const amount = asNumber(expAmount)
    if (!desc || amount == null || amount <= 0) return
    update({ expenses: [...expenses, { id: Date.now(), desc, amount, cat: expCat }] })
    setExpDesc('')
    setExpAmount('')
  }

  const removeExpense = id => {
    const removed = expenses.find(e => e.id === id)
    if (!removed || !window.confirm(`Remover a despesa "${removed.desc}"?`)) return
    update({ expenses: expenses.filter(e => e.id !== id) })
  }

  const handleResetDay = () => {
    if (!window.confirm('Limpar hábitos, água, sono, passos e despesas de hoje?')) return
    update({
      habits: habits.map(h => ({ ...h, done: false })),
      water: 0,
      sleep: '',
      steps: '',
      expenses: [],
      archive: [...data.archive, { date: todayStr(), habits, water, sleep, steps, expenses }],
      lastDay: todayStr(),
    })
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-left">
            <img className="brand-logo" src="/logo-appicon.png" alt="Meu Painel Pessoal" />
            <div>
              <h1 className="header-title">Meu Painel Pessoal</h1>
              <p className="header-sub">Hábitos, rotina e finanças no mesmo lugar</p>
            </div>
          </div>
          <div className="header-right">
            <button className="theme-toggle" onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : prev === 'light' ? 'system' : 'dark'))} aria-label="Alternar tema">
              <ThemeIcon theme={currentTheme} />
              <span className="theme-toggle-text">{theme === 'system' ? 'Sistema' : theme}</span>
            </button>
            <div className="header-clock"><span className="live-dot" /><span className="clock-display">{timeStr}</span></div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="date-banner">
          <span className="date-full">{dateStr}</span>
          <span className="date-day-count">Dia {dayOfYear} de {daysInYear}</span>
          <button className="btn-text reset-btn" onClick={handleResetDay}>Limpar hoje</button>
        </div>

        <section className="progress-grid">
          <ProgressCard label="Ano" pct={yearPct} detail={`${(100 - yearPct).toFixed(1)}% restante`} color="var(--accent)" />
          <ProgressCard label={monthName} pct={monthPct} detail={`${daysLeftMonth} dias restantes`} color="#a78bfa" />
          <ProgressCard label="Hoje" pct={dayPct} detail={timeStr} color="#34d399" />
        </section>

        <section className="two-col">
          <div className="card">
            <div className="card-head"><span className="section-label">Estatísticas de Vida</span></div>
            <div className="card-body">
              <div className="profile-grid">
                <input className="profile-input" value={firstName} onChange={e => update({ firstName: e.target.value })} placeholder="Nome" />
                <input className="profile-input" value={lastName} onChange={e => update({ lastName: e.target.value })} placeholder="Sobrenome" />
                <input className="profile-input" value={heightCm} onChange={e => update({ heightCm: e.target.value.replace(/[^\d]/g, '') })} placeholder="Altura em cm" />
                <input className="profile-input" type="date" value={birthday} onChange={e => update({ birthday: e.target.value })} />
              </div>
              {life && (
                <>
                  <div className="profile-summary">
                    <div><strong>{[firstName, lastName].filter(Boolean).join(' ') || 'Seu perfil'}</strong><p>{heightCm ? `${heightCm} cm` : 'Altura não informada'}</p></div>
                    <div><strong>{heightCm ? `${(Number(heightCm) / 100).toFixed(2)} m` : '—'}</strong><p>Altura convertida</p></div>
                  </div>
                  <div className="stats-grid">
                    <StatItem value={life.days.toLocaleString()} label="Dias vivo" accent />
                    <StatItem value={life.weeks.toLocaleString()} label="Semanas vivo" />
                    <StatItem value={life.age} label="Idade" />
                    <StatItem value={`${life.daysToNb}d`} label="Até aniversário" />
                  </div>
                  <div className="life-bar-wrap">
                    <div className="life-bar-labels"><span>Vida (média 80 anos)</span><span className="accent-text">{life.pct.toFixed(1)}%</span></div>
                    <div className="pbar-track"><div className="pbar-fill" style={{ width: `${life.pct}%`, background: 'var(--accent)' }} /></div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className={`card${allHabitsDone ? ' card-success' : ''}`}>
            <div className="card-head"><span className="section-label">Hábitos</span><span className="badge-count">{habitsDone}/{habits.length}</span></div>
            <div className="card-body">
              <div className="habits-list">
                {habits.map(h => (
                  <div key={h.id} className={`habit-row${h.done ? ' done' : ''}`}>
                    <button className={`habit-check${h.done ? ' checked' : ''}`} onClick={() => toggleHabit(h.id)}>{h.done && <IconCheck />}</button>
                    <span className="habit-name">{h.label}</span>
                    <button className="icon-btn danger" onClick={() => removeHabit(h.id)}><IconX /></button>
                  </div>
                ))}
              </div>
              <div className="add-row">
                <input className="add-input" value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="Adicionar hábito..." onKeyDown={e => e.key === 'Enter' && addHabit()} />
                <button className="btn-icon-add" onClick={addHabit}><IconPlus /></button>
              </div>
            </div>
          </div>
        </section>

        <section className="vitals-grid">
          <div className="card">
            <div className="card-head"><span className="section-label">Água</span><span className="vital-badge">{water}/8</span></div>
            <div className="card-body">
              <div className="water-row">{[...Array(8)].map((_, i) => <button key={i} className={`water-drop${i < water ? ' filled' : ''}`} onClick={() => update({ water: water === i + 1 ? i : i + 1 })}><IconDrop /></button>)}</div>
              <p className="vital-hint">{water === 0 ? 'Mantenha-se hidratado!' : water >= 8 ? 'Meta diária atingida!' : `${8 - water} restantes`}</p>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><span className="section-label">Sono</span>{sleep && <span className="vital-badge">{sleep}h</span>}</div>
            <div className="card-body">
              <div className="sleep-display-row"><span className="sleep-num">{sleep || '—'}</span>{sleep && <span className="sleep-unit">h</span>}</div>
              <div className="sleep-slider-wrap">
                <div className="sleep-bubble" style={{ left: `calc(${sleepPct}% - 18px)` }}>{sleep ? `${sleep}h` : '0h'}</div>
                <input type="range" min="0" max="12" step="0.5" value={sleep || 0} onChange={e => update({ sleep: e.target.value === '0' ? '' : e.target.value })} className="sleep-range" style={{ '--sleep-fill': `${sleepPct}%` }} />
              </div>
              <div className="range-labels"><span>0h</span><span>6h</span><span>12h</span></div>
            </div>
          </div>
          <div className="card">
            <div className="card-head"><span className="section-label">Passos</span></div>
            <div className="card-body">
              <div className="steps-display">{steps ? parseInt(steps, 10).toLocaleString() : '—'}</div>
              <input className="steps-input" value={steps} onChange={e => update({ steps: e.target.value.replace(/[^\d]/g, '') })} placeholder="Insira os passos" />
              {steps && parseInt(steps, 10) > 0 && <div className="pbar-track"><div className="pbar-fill" style={{ width: `${Math.min((parseInt(steps, 10) / 10000) * 100, 100)}%`, background: 'var(--success)' }} /></div>}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><span className="section-label">Despesas de Hoje</span><span className="expense-total-badge">R$ {totalExp.toFixed(2)}</span></div>
          <div className="card-body">
            <div className="expense-add-row">
              <input className="expense-desc-input" value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="No que gastou?" onKeyDown={e => e.key === 'Enter' && addExpense()} />
              <input className="expense-amt-input" value={expAmount} onChange={e => setExpAmount(e.target.value)} placeholder="0.00" onKeyDown={e => e.key === 'Enter' && addExpense()} />
              <select className="expense-cat-select" value={expCat} onChange={e => setExpCat(e.target.value)}>{['Alimentação', 'Transporte', 'Saúde', 'Compras', 'Entretenimento', 'Outro'].map(c => <option key={c} value={c}>{c}</option>)}</select>
              <button className="btn-icon-add" onClick={addExpense}><IconPlus /></button>
            </div>
            <div className="expense-list">
              {expenses.map(e => (
                <div key={e.id} className="expense-row">
                  <span className="exp-cat">{e.cat}</span>
                  <span className="exp-desc">{e.desc}</span>
                  <span className="exp-amt">R$ {e.amount.toFixed(2)}</span>
                  <button className="icon-btn danger" onClick={() => removeExpense(e.id)}><IconX /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head"><span className="section-label">Memória</span><span className="expense-total-badge">{memories.length} dias</span></div>
          <div className="card-body">
            {memoryDelta && <div className="memory-insight"><span>Comparado ao dia anterior:</span><div className="memory-insight-grid"><strong>{memoryDelta.water >= 0 ? '+' : ''}{memoryDelta.water} água</strong><strong>{memoryDelta.steps >= 0 ? '+' : ''}{memoryDelta.steps.toLocaleString()} passos</strong><strong>{memoryDelta.sleep >= 0 ? '+' : ''}{memoryDelta.sleep.toFixed(1)}h sono</strong><strong>R$ {memoryDelta.expenses.toFixed(2)} gastos</strong></div></div>}
            <div className="memory-list">
              {memoriesDesc.slice(0, 7).map(item => (
                <article key={item.date} className="memory-row">
                  <div className="memory-top"><strong>{item.date}</strong><span>{item.name}</span></div>
                  <div className="memory-grid"><span>{item.daysAlive ?? '—'} dias</span><span>{item.heightCm ? `${item.heightCm} cm` : 'Sem altura'}</span><span>{item.water}/8 água</span><span>{item.steps.toLocaleString()} passos</span><span>R$ {item.expensesTotal.toFixed(2)}</span><span>{item.habitsDone}/{item.habitsTotal} hábitos</span></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <div className="sr-only" aria-live="polite">{recentChange}</div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

function ThemeIcon({ theme }) {
  if (theme === 'dark') return <span aria-hidden="true">◐</span>
  if (theme === 'light') return <span aria-hidden="true">◑</span>
  return <span aria-hidden="true">◒</span>
}

function ProgressCard({ label, pct, detail, color }) {
  const dimColor = color === 'var(--accent)'
    ? 'rgba(99, 102, 241, 0.12)'
    : color === '#a78bfa'
      ? 'rgba(167, 139, 250, 0.12)'
      : 'rgba(52, 211, 153, 0.12)'
  return (
    <div className="progress-card" style={{ '--card-accent': color, '--card-accent-dim': dimColor }}>
      <div className="pc-top"><span className="pc-label">{label}</span><span className="pc-pct" style={{ color }}>{pct.toFixed(1)}%</span></div>
      <div className="pbar-track"><div className="pbar-fill" style={{ width: `${pct}%`, background: color }} /></div>
      <span className="pc-detail">{detail}</span>
    </div>
  )
}

function StatItem({ value, label, accent }) {
  return <div className="stat-item"><div className={`stat-val${accent ? ' accent' : ''}`}>{value}</div><div className="stat-lbl">{label}</div></div>
}

function IconCheck() { return <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 7l4 4 6-6" /></svg> }
function IconX() { return <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8" /></svg> }
function IconPlus() { return <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M7 2v10M2 7h10" /></svg> }
function IconDrop() { return <svg width="13" height="17" viewBox="0 0 13 17" fill="currentColor"><path d="M6.5 0.5C6.5 0.5 0.5 8 0.5 11.5C0.5 14.5 3.2 16.5 6.5 16.5C9.8 16.5 12.5 14.5 12.5 11.5C12.5 8 6.5 0.5 6.5 0.5Z" /></svg> }
