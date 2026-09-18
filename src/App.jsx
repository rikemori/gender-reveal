import { useEffect, useMemo, useState } from 'react'
import { Star, Heart, Cloud, GiftBox } from './Decorations'
import './App.css'

// ============================================================
// ★ 発表する性別はここだけを書き換えてください ★
//   'boy'  → 「男の子です！」（ブルー）
//   'girl' → 「女の子です！」（ピンク）
// ============================================================
const REVEAL_GENDER = 'girl'
// ============================================================

// 出産予定日（カウントダウンの基準日）
const DUE_DATE = new Date('2026-12-18T00:00:00')

const GENDER_CONFIG = {
  boy: {
    message: '男の子です！',
    kicker: 'Baby is maybe a BOY',
    accent: '#3b82f6',
    accentSoft: '#dceaff',
    gradientStart: '#cfe6ff',
    gradientEnd: '#4d9bff',
  },
  girl: {
    message: '女の子です！',
    kicker: 'Baby is maybe a GIRL',
    accent: '#ec4899',
    accentSoft: '#ffe1ef',
    gradientStart: '#ffd6ea',
    gradientEnd: '#ff6fae',
  },
}

const CONFETTI_COLORS = ['#ffd166', '#ff6b9d', '#a78bfa', '#5fd4c4', '#60a5fa', '#ffffff']
const CONFETTI_SHAPES = ['circle', 'rect', 'triangle']

function createConfetti(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3.2,
    duration: 3.6 + Math.random() * 2.6,
    drift: `${(Math.random() - 0.5) * 40}vw`,
    rotate: `${360 + Math.random() * 360}deg`,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 7 + Math.random() * 8,
    shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
  }))
}

function createBalloons(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 4 + Math.random() * 92,
    delay: Math.random() * 1.4,
    duration: 5 + Math.random() * 2.6,
    drift: `${(Math.random() - 0.5) * 16}vw`,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  }))
}

function getCountdown(target) {
  const diff = Math.max(0, target.getTime() - Date.now())
  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

const SKY_DECOR = [
  { Icon: Star, top: '10%', left: '8%', size: 32, color: '#ffd166', duration: 6 },
  { Icon: Cloud, top: '18%', left: '76%', size: 74, color: '#ffffff', duration: 9 },
  { Icon: Heart, top: '68%', left: '10%', size: 30, color: '#ff9ecb', duration: 7 },
  { Icon: Star, top: '78%', left: '84%', size: 24, color: '#a78bfa', duration: 5.5 },
  { Icon: Cloud, top: '6%', left: '42%', size: 54, color: '#ffffff', duration: 8 },
  { Icon: Heart, top: '42%', left: '90%', size: 22, color: '#ffd166', duration: 6.5 },
  { Icon: Star, top: '85%', left: '30%', size: 20, color: '#5fd4c4', duration: 7.5 },
]

function App() {
  const [phase, setPhase] = useState('idle') // idle | animating | revealed
  const confetti = useMemo(() => createConfetti(70), [])
  const balloons = useMemo(() => createBalloons(10), [])
  const config = GENDER_CONFIG[REVEAL_GENDER]
  const [countdown, setCountdown] = useState(() => getCountdown(DUE_DATE))

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown(DUE_DATE)), 1000)
    return () => clearInterval(id)
  }, [])

  const handleReveal = () => {
    if (phase !== 'idle') return
    setPhase('animating')
    window.setTimeout(() => setPhase('revealed'), 2800)
  }

  const rootStyle =
    phase === 'revealed'
      ? {
          background: `radial-gradient(circle at 50% 20%, ${config.gradientStart}, ${config.gradientEnd})`,
        }
      : undefined

  return (
    <div className={`app-root phase-${phase}`} style={rootStyle}>
      {phase === 'idle' && (
        <div className="sky-decor" aria-hidden="true">
          {SKY_DECOR.map((d, i) => (
            <d.Icon
              key={i}
              size={d.size}
              color={d.color}
              className="floaty"
              style={{ position: 'absolute', top: d.top, left: d.left, animationDuration: `${d.duration}s` }}
            />
          ))}
        </div>
      )}

      {(phase === 'animating' || phase === 'revealed') && (
        <div className={`fx-layer ${phase === 'revealed' ? 'fx-soft' : ''}`} aria-hidden="true">
          {confetti.map((c) => (
            <span
              key={`confetti-${c.id}`}
              className={`confetti shape-${c.shape}`}
              style={{
                left: `${c.left}%`,
                width: `${c.size}px`,
                height: c.shape === 'circle' ? `${c.size}px` : `${c.size * 0.5}px`,
                backgroundColor: c.color,
                animationDelay: `${c.delay}s`,
                animationDuration: `${c.duration}s`,
                '--drift': c.drift,
                '--rotate': c.rotate,
              }}
            />
          ))}
          {balloons.map((b) => (
            <span
              key={`balloon-${b.id}`}
              className="balloon"
              style={{
                left: `${b.left}%`,
                animationDelay: `${b.delay}s`,
                animationDuration: `${b.duration}s`,
                '--drift': b.drift,
              }}
            >
              <span className="balloon-body" style={{ backgroundColor: b.color }}>
                <span className="balloon-shine" />
              </span>
              <span className="balloon-string" />
            </span>
          ))}
        </div>
      )}

      {phase === 'idle' && (
        <div className="idle-card">
          <div className="idle-illustration">
            <GiftBox size={92} color="#ff9ecb" ribbon="#fff5f9" />
          </div>
          <p className="eyebrow">Gender Reveal</p>
          <h1 className="idle-title">性別、発表します！</h1>
          <p className="idle-subtitle">ボタンを押して開封してね</p>

          <div className="countdown">
            <p className="countdown-label">予定日（12/18）まで</p>
            <div className="countdown-grid">
              <div className="countdown-item">
                <span className="countdown-number">{countdown.days}</span>
                <span className="countdown-unit">日</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{pad(countdown.hours)}</span>
                <span className="countdown-unit">時間</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{pad(countdown.minutes)}</span>
                <span className="countdown-unit">分</span>
              </div>
              <div className="countdown-item">
                <span className="countdown-number">{pad(countdown.seconds)}</span>
                <span className="countdown-unit">秒</span>
              </div>
            </div>
          </div>

          <button type="button" className="reveal-button" onClick={handleReveal}>
            <GiftBox size={24} color="#ffffff" ribbon="#ffd166" />
            開封する
          </button>
        </div>
      )}

      {phase === 'revealed' && (
        <div className="reveal-scene">
          <div className="burst-rays" style={{ '--ray-color': config.accentSoft }} />
          <div className="reveal-card">
            <div className="reveal-icons">
              <Heart size={26} color={config.accent} className="bounce-in bounce-1" />
              <Star size={22} color="#ffd166" className="bounce-in bounce-2" />
              <Heart size={18} color={config.accent} className="bounce-in bounce-3" />
            </div>
            <p className="reveal-kicker" style={{ color: config.accent, background: config.accentSoft }}>
              {config.kicker}
            </p>
            <h1 className="reveal-message" style={{ color: config.accent }}>
              {config.message}
            </h1>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
