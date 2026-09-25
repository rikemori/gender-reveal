import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Star,
  Heart,
  Cloud,
  GiftBox,
  Camera,
  Pencil,
  Trash,
  ChevronLeft,
  ChevronRight,
  Key,
  Plus,
} from './Decorations'
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
// 妊娠の起算日（エコー写真の「◯w◯d」表記に使う）
const PREGNANCY_START_DATE = new Date('2026-03-13T00:00:00')

// 画像の置き場所。public/images/ にファイルを置くと、ここから参照される
const IMAGES_BASE = `${import.meta.env.BASE_URL}images/`
const echoSrc = (url) => (url.startsWith('data:') ? url : `${IMAGES_BASE}${url}`)

const GENDER_CONFIG = {
  boy: {
    message: '男の子です',
    kicker: 'Baby is maybe a Boy',
    accent: '#4f7bab',
    accentSoft: '#e4edf6',
    gradientStart: '#eaf1f8',
    gradientEnd: '#a9c3dd',
    resultImage: 'baby_boy10_heart.png',
  },
  girl: {
    message: '女の子です',
    kicker: 'Baby is maybe a Girl',
    accent: '#bd5b7f',
    accentSoft: '#f7e6ec',
    gradientStart: '#faeef1',
    gradientEnd: '#dba7ba',
    resultImage: 'baby_girl10_heart.png',
  },
}

const DEV_PASSWORD = 'baby1218'
const ECHOES_STORAGE_KEY = 'gender-reveal:echoes'

// エコー写真の初期リスト（あとで public/images/ に同じファイル名の写真を置く）
const DEFAULT_ECHOES = [
  { url: 'echo_01.png', caption: '2026.04.24.（6w0d）' },
  { url: 'echo_02.png', caption: '2026.05.11.（8w3d）' },
  { url: 'echo_03.png', caption: '2026.05.18.（9w3d）' },
  { url: 'echo_04.png', caption: '2026.05.21.（9w6d）' },
  { url: 'echo_05.png', caption: '2026.06.04.（11w6d）' },
  { url: 'echo_06_1.png', caption: '2026.07.03.（16w0d）' },
  { url: 'echo_06_2.png', caption: '2026.07.03.（16w0d）' },
  { url: 'echo_07.png', caption: '2026.07.14.（17w4d）' },
  { url: 'echo_08_1.png', caption: '2026.08.03.（20w3d）' },
  { url: 'echo_08_2.png', caption: '2026.08.03.（20w3d）' },
  { url: 'echo_08_3.png', caption: '2026.08.03.（20w3d）' },
  { url: 'echo_08_4.png', caption: '2026.08.03.（20w3d）' },
  { url: 'echo_09.png', caption: '2026.08.06.（20w6d）' },
  { url: 'echo_10_1.png', caption: '2026.09.02.（24w5d）' },
  { url: 'echo_10_2.png', caption: '2026.09.02.（24w5d）' },
  { url: 'echo_10_3.png', caption: '2026.09.02.（24w5d）' },
  { url: 'echo_10_4.png', caption: '2026.09.02.（24w5d）' },
  { url: 'echo_11_1.png', caption: '2026.09.16.（26w5d）' },
  { url: 'echo_11_2.png', caption: '2026.09.16.（26w5d）' },
]

const CONFETTI_COLORS = ['#c9a227', '#bd5b7f', '#93a889', '#e7c9b0', '#ffffff']
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
    reached: diff <= 0,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  }
}

// 検診日から「妊娠◯週◯日」の表記を作る
function formatEchoCaption(dateString) {
  const picked = new Date(`${dateString}T00:00:00`)
  const diffDays = Math.floor((picked.getTime() - PREGNANCY_START_DATE.getTime()) / 86400000)
  const weeks = Math.floor(diffDays / 7)
  const days = diffDays % 7
  const yyyy = picked.getFullYear()
  const mm = String(picked.getMonth() + 1).padStart(2, '0')
  const dd = String(picked.getDate()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd}.（${weeks}w${days}d）`
}

// 写真を読み込んで、長辺1000pxに収まるようリサイズした dataURL にする
function readAndResizeImage(file, maxDim = 1000) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width)
          width = maxDim
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height)
          height = maxDim
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d').drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

function pad(n) {
  return String(n).padStart(2, '0')
}

const SKY_DECOR = [
  { Icon: Star, top: '10%', left: '8%', size: 26, color: '#c9a227', duration: 7 },
  { Icon: Cloud, top: '18%', left: '78%', size: 66, color: '#ffffff', duration: 10 },
  { Icon: Heart, top: '70%', left: '10%', size: 24, color: '#cf93ab', duration: 8 },
  { Icon: Cloud, top: '6%', left: '44%', size: 46, color: '#ffffff', duration: 9 },
  { Icon: Star, top: '82%', left: '82%', size: 18, color: '#93a889', duration: 6.5 },
]

function App() {
  const [phase, setPhase] = useState('idle') // idle | counting | revealed
  const [revealTick, setRevealTick] = useState(null) // 3 → 2 → 1 → null(演出前)
  const [devUnlocked, setDevUnlocked] = useState(false)
  const [echoes, setEchoes] = useState(() => {
    try {
      const saved = localStorage.getItem(ECHOES_STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_ECHOES
    } catch {
      return DEFAULT_ECHOES
    }
  })
  const [echoIndex, setEchoIndex] = useState(0)
  const [pendingPhoto, setPendingPhoto] = useState(null)
  const [dateValue, setDateValue] = useState(() => new Date().toISOString().slice(0, 10))
  const touchStartX = useRef(0)
  const fileInputRef = useRef(null)

  const confetti = useMemo(() => createConfetti(70), [])
  const balloons = useMemo(() => createBalloons(10), [])
  const config = GENDER_CONFIG[REVEAL_GENDER]
  const [countdown, setCountdown] = useState(() => getCountdown(DUE_DATE))

  useEffect(() => {
    const id = setInterval(() => setCountdown(getCountdown(DUE_DATE)), 1000)
    return () => clearInterval(id)
  }, [])

  // 開封ボタンを押すと 3・2・1 と数字を見せてから発表する
  useEffect(() => {
    if (phase !== 'counting') return
    let count = 3
    const id = setInterval(() => {
      if (count > 0) {
        setRevealTick(count)
        count -= 1
      } else {
        clearInterval(id)
        setPhase('revealed')
      }
    }, 800)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    try {
      localStorage.setItem(ECHOES_STORAGE_KEY, JSON.stringify(echoes))
    } catch {
      // 保存できなくても表示は続ける
    }
  }, [echoes])

  const handleReveal = () => {
    if (phase !== 'idle') return
    setPhase('counting')
  }

  const handleDevToggle = (event) => {
    if (event.target.checked) {
      const pass = window.prompt('開発者パスワードを入力してください')
      if (pass === DEV_PASSWORD) setDevUnlocked(true)
      else if (pass !== null) window.alert('パスワードが違います')
    } else {
      setDevUnlocked(false)
    }
  }

  const goPrevEcho = () => {
    if (echoes.length === 0) return
    setEchoIndex((i) => (i - 1 + echoes.length) % echoes.length)
  }

  const goNextEcho = () => {
    if (echoes.length === 0) return
    setEchoIndex((i) => (i + 1) % echoes.length)
  }

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX
  }

  const handleTouchEnd = (event) => {
    const diff = touchStartX.current - event.changedTouches[0].clientX
    if (Math.abs(diff) <= 40) return
    if (diff > 0) goNextEcho()
    else goPrevEcho()
  }

  const editEchoCaption = (index) => {
    const next = window.prompt('表示テキストを入力してください:', echoes[index].caption)
    if (next === null || next.trim() === '') return
    setEchoes((list) => list.map((echo, i) => (i === index ? { ...echo, caption: next.trim() } : echo)))
  }

  const deleteEcho = (index) => {
    if (!window.confirm('この写真を削除しますか？')) return
    setEchoes((list) => list.filter((_, i) => i !== index))
    setEchoIndex((i) => Math.min(i, Math.max(0, echoes.length - 2)))
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return
    try {
      setPendingPhoto(await readAndResizeImage(file))
    } catch {
      window.alert('写真を読み込めませんでした。')
    }
  }

  const handleAddEcho = () => {
    if (!pendingPhoto) return window.alert('写真を選択してください。')
    if (!dateValue) return window.alert('日付を選択してください。')

    const nextEchoes = [...echoes, { url: pendingPhoto, caption: formatEchoCaption(dateValue) }]
    try {
      localStorage.setItem(ECHOES_STORAGE_KEY, JSON.stringify(nextEchoes))
    } catch {
      window.alert('容量オーバーのため追加できませんでした。')
      return
    }
    setEchoes(nextEchoes)
    setEchoIndex(nextEchoes.length - 1)
    setPendingPhoto(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const rootStyle =
    phase === 'revealed'
      ? {
          background: `radial-gradient(circle at 50% 20%, ${config.gradientStart}, ${config.gradientEnd})`,
        }
      : undefined

  return (
    <div className={`app-root phase-${phase}`} style={rootStyle}>
      {/* 開発者モードの切り替え（常時表示） */}
      <div className="dev-toggle">
        <Key size={13} color={devUnlocked ? config.accent : '#c9bfcf'} />
        <label className="switch">
          <input type="checkbox" checked={devUnlocked} onChange={handleDevToggle} />
          <span className="toggle-slider" />
        </label>
      </div>

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

      {phase === 'revealed' && (
        <div className="fx-layer" aria-hidden="true">
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
            <GiftBox size={80} color="#cf93ab" ribbon="#fbf6f1" />
          </div>
          <p className="eyebrow">Gender Reveal</p>
          <h1 className="idle-title">性別、発表します</h1>
          <p className="idle-subtitle">ボタンを押して開封してね</p>

          <div className="countdown">
            <p className="countdown-label">予定日（12/18）まで</p>
            {countdown.reached ? (
              <p className="countdown-reached">出産予定日を迎えました👶✨</p>
            ) : (
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
            )}
          </div>

          <div className="question-row">
            <figure className="question-card">
              <img src={`${IMAGES_BASE}baby_boy09_question.png`} alt="男の子かな？" />
            </figure>
            <figure className="question-card">
              <img src={`${IMAGES_BASE}baby_girl09_question.png`} alt="女の子かな？" />
            </figure>
          </div>

          <button type="button" className="reveal-button" onClick={handleReveal}>
            <GiftBox size={20} color="#ffffff" ribbon="#e7c9b0" />
            開封する
          </button>
        </div>
      )}

      {phase === 'counting' && (
        <p className="reveal-tick" aria-live="polite">
          {revealTick ?? '…'}
        </p>
      )}

      {phase === 'revealed' && (
        <div className="reveal-scene">
          <div className="burst-rays" style={{ '--ray-color': config.accentSoft }} />
          <div className="reveal-card">
            <div className="reveal-icons">
              <Heart size={20} color={config.accent} className="bounce-in bounce-1" />
              <Star size={18} color="#c9a227" className="bounce-in bounce-2" />
              <Heart size={14} color={config.accent} className="bounce-in bounce-3" />
            </div>
            <p className="reveal-kicker" style={{ color: config.accent, background: config.accentSoft }}>
              {config.kicker}
            </p>
            <h1 className="reveal-message" style={{ color: config.accent }}>
              {config.message}
            </h1>
            <img className="reveal-result-img" src={`${IMAGES_BASE}${config.resultImage}`} alt="" />

            <div className="echo-gallery">
              <p className="echo-title">📷 エコーギャラリー</p>
              <div className="echo-slider" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
                <button type="button" className="nav-btn prev-btn" onClick={goPrevEcho} aria-label="前の写真">
                  <ChevronLeft size={16} />
                </button>

                {echoes.length === 0 ? (
                  <div className="echo-track echo-empty">写真がありません</div>
                ) : (
                  <div className="echo-track" style={{ transform: `translateX(-${echoIndex * 100}%)` }}>
                    {echoes.map((echo, i) => (
                      <div className="echo-slide" key={i}>
                        {devUnlocked && (
                          <div className="echo-actions">
                            <button type="button" onClick={() => editEchoCaption(i)} aria-label="キャプションを編集">
                              <Pencil size={13} color="#4a3e3d" />
                            </button>
                            <button type="button" className="danger" onClick={() => deleteEcho(i)} aria-label="削除">
                              <Trash size={13} color="#bd5b7f" />
                            </button>
                          </div>
                        )}
                        <img src={echoSrc(echo.url)} alt={`エコー写真 ${i + 1}`} />
                        <span className="echo-caption">{echo.caption}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" className="nav-btn next-btn" onClick={goNextEcho} aria-label="次の写真">
                  <ChevronRight size={16} />
                </button>
              </div>
              <p className="echo-counter">{echoes.length ? `${echoIndex + 1} / ${echoes.length}` : '0 / 0'}</p>
            </div>

            {devUnlocked && (
              <div className="dev-panel">
                <p className="dev-panel-title">
                  <Plus size={12} color={config.accent} /> エコー写真の追加
                </p>
                <label className="upload-area" htmlFor="echoFileInput">
                  <Camera size={22} color={config.accent} />
                  <span>{pendingPhoto ? '写真を選択済み・追加できます' : '写真を選択'}</span>
                </label>
                <input
                  id="echoFileInput"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />
                <label className="input-label" htmlFor="echoDateInput">
                  検診日
                </label>
                <input
                  id="echoDateInput"
                  type="date"
                  className="date-input"
                  value={dateValue}
                  onChange={(e) => setDateValue(e.target.value)}
                />
                <button type="button" className="btn-add" style={{ background: config.accent }} onClick={handleAddEcho}>
                  アルバムに追加
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
