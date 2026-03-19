import { useState } from 'react'

export default function StatsPage({ stats, books, sessions, isMobile, goal, onSetGoal }) {
  const hours = Math.floor(stats.totalMinutes / 60)
  const mins  = stats.totalMinutes % 60

  return (
    <div style={{ maxWidth: 680, paddingBottom: isMobile ? 16 : 32 }}>

      {/* Niveau + Streak */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <LevelCard level={stats.level} />
        <StreakCard streak={stats.streak} />
      </div>

      {/* Objectif annuel */}
      <GoalCard goal={stats.goal} onSetGoal={onSetGoal} />

      {/* Stats rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Livres lus',      value: stats.done,       icon: '✓' },
          { label: 'En cours',        value: stats.reading,    icon: '📖' },
          { label: 'Pages lues',      value: stats.totalPages, icon: '📄' },
          { label: 'Vitesse moy.',    value: stats.avgSpeed ? stats.avgSpeed + ' p/h' : '—', icon: '⚡' },
        ].map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      {/* Temps total */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
        <SectionTitle>Temps de lecture</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <BigStat value={`${hours}h ${mins}m`} label="Total depuis le début" />
          <BigStat value={`${Math.floor(stats.last30Min/60)}h ${stats.last30Min%60}m`} label="Ces 30 derniers jours" />
        </div>
      </div>

      {/* Heure favorite */}
      {stats.favoriteHour && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 32 }}>{stats.favoriteHour.icon}</span>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 2 }}>Vous lisez surtout</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 400 }}>{stats.favoriteHour.label}</div>
          </div>
        </div>
      )}

      {/* Graphique pages / 30 jours */}
      {stats.pagesPerDay && stats.pagesPerDay.some(d => d.pages > 0) && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
          <SectionTitle>Pages lues — 30 derniers jours</SectionTitle>
          <BarChart data={stats.pagesPerDay} isMobile={isMobile} />
        </div>
      )}

      {/* Graphique pages / semaine */}
      {stats.pagesPerWeek && stats.pagesPerWeek.some(d => d.pages > 0) && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
          <SectionTitle>Pages lues — 12 dernières semaines</SectionTitle>
          <BarChart data={stats.pagesPerWeek} isMobile={isMobile} color="var(--amber)" />
        </div>
      )}

      {/* Livres récents */}
      {books.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20 }}>
          <SectionTitle>Derniers livres</SectionTitle>
          {[...books].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)).slice(0, 5).map((b, i, arr) => (
            <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 30, height: 44, borderRadius: 4, overflow: 'hidden', background: 'var(--surface3)', flexShrink: 0 }}>
                {b.cover_url ? <img src={b.cover_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>📖</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{b.author}</div>
              </div>
              <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 20, background: b.status === 'done' ? 'var(--green-soft)' : b.status === 'reading' ? 'var(--amber-soft)' : 'var(--surface3)', color: b.status === 'done' ? 'var(--green)' : b.status === 'reading' ? 'var(--amber)' : 'var(--text3)', flexShrink: 0 }}>
                {b.status === 'done' ? 'Lu' : b.status === 'reading' ? 'En cours' : 'À lire'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Sous-composants ──

function LevelCard({ level }) {
  if (!level) return null
  const pct = level.next ? Math.min(Math.round((level.score / level.next) * 100), 100) : 100
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 28 }}>{level.icon}</span>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Niveau</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 400, color: level.color }}>{level.name}</div>
        </div>
      </div>
      {level.next && (
        <>
          <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 2, marginBottom: 4 }}>
            <div style={{ height: '100%', width: pct + '%', background: level.color, borderRadius: 2, transition: 'width 0.6s' }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text3)' }}>{level.score} / {level.next} points</div>
        </>
      )}
    </div>
  )
}

function StreakCard({ streak }) {
  return (
    <div style={{ background: streak > 0 ? 'rgba(230,126,34,0.06)' : 'var(--surface)', border: `1px solid ${streak > 0 ? 'var(--amber-soft)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: 32, marginBottom: 4 }}>{streak > 0 ? '🔥' : '💤'}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 400, color: streak > 0 ? 'var(--amber)' : 'var(--text3)' }}>{streak}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
        {streak === 0 ? 'Aucun streak' : streak === 1 ? 'jour consécutif' : 'jours consécutifs'}
      </div>
    </div>
  )
}

function GoalCard({ goal, onSetGoal }) {
  const [editing, setEditing] = useState(false)
  const [val,     setVal]     = useState('')
  const year = new Date().getFullYear()

  async function handleSave() {
    const n = parseInt(val)
    if (!n || n < 1) return
    await onSetGoal(n)
    setEditing(false)
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <SectionTitle>Objectif {year}</SectionTitle>
        <button onClick={() => { setEditing(!editing); setVal(goal?.target || 12) }} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
          {editing ? 'Annuler' : goal ? 'Modifier' : 'Définir un objectif'}
        </button>
      </div>

      {editing && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <input
            type="number" min="1" max="365"
            value={val} onChange={e => setVal(e.target.value)}
            placeholder="Ex : 20"
            autoFocus
            style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border2)', background: 'var(--surface2)', color: 'var(--text)', fontSize: 14, outline: 'none' }}
          />
          <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: '#1a1814', color: '#faf9f7', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Enregistrer</button>
        </div>
      )}

      {goal ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300 }}>
              {goal.done} <span style={{ fontSize: 16, color: 'var(--text3)' }}>/ {goal.target} livres</span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 500, color: goal.pct >= 100 ? 'var(--green)' : 'var(--text2)' }}>{goal.pct}%</div>
          </div>
          <div style={{ height: 8, background: 'var(--surface3)', borderRadius: 4 }}>
            <div style={{ height: '100%', width: goal.pct + '%', background: goal.pct >= 100 ? 'var(--green)' : 'var(--accent)', borderRadius: 4, transition: 'width 0.6s' }} />
          </div>
          {goal.pct >= 100
            ? <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 6 }}>🎉 Objectif atteint !</div>
            : <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Plus que {goal.target - goal.done} livre{goal.target - goal.done > 1 ? 's' : ''} pour atteindre votre objectif</div>
          }
        </>
      ) : !editing && (
        <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text3)', fontSize: 13 }}>
          Définissez combien de livres vous voulez lire en {year}
        </div>
      )}
    </div>
  )
}

function BarChart({ data, isMobile, color = 'var(--accent)' }) {
  const max = Math.max(...data.map(d => d.pages), 1)
  const show = isMobile ? data.slice(-14) : data

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: isMobile ? 3 : 4, height: 100, marginTop: 8 }}>
      {show.map((d, i) => {
        const h = Math.max(Math.round((d.pages / max) * 100), d.pages > 0 ? 4 : 0)
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }} title={`${d.label} : ${d.pages} pages`}>
            <div style={{ width: '100%', height: h + '%', background: d.pages > 0 ? color : 'var(--surface3)', borderRadius: '3px 3px 0 0', transition: 'height 0.4s', opacity: d.pages > 0 ? 1 : 0.4 }} />
          </div>
        )
      })}
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 400, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{label}</div>
    </div>
  )
}

function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14 }}>{children}</div>
}

function BigStat({ value, label }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 300 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>{label}</div>
    </div>
  )
}
