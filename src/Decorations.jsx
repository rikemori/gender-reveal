// シンプルな図形だけで組み立てたイラストアイコン群（絵文字より統一感のあるスタイルにするため）

export function Star({ size = 24, color = 'currentColor', className, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={style}
    >
      <polygon
        points="12,1.5 15,9 22.5,9.6 16.8,14.6 18.5,22 12,17.9 5.5,22 7.2,14.6 1.5,9.6 9,9"
        fill={color}
      />
    </svg>
  )
}

export function Heart({ size = 24, color = 'currentColor', className, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 90"
      className={className}
      style={style}
    >
      <g fill={color}>
        <circle cx="30" cy="33" r="27" />
        <circle cx="70" cy="33" r="27" />
        <rect x="18" y="30" width="64" height="35" />
        <polygon points="12,55 50,90 88,55" />
      </g>
    </svg>
  )
}

export function Cloud({ size = 60, color = '#ffffff', className, style }) {
  return (
    <svg
      width={size}
      height={size * 0.6}
      viewBox="0 0 100 60"
      className={className}
      style={style}
    >
      <g fill={color}>
        <ellipse cx="30" cy="36" rx="24" ry="19" />
        <ellipse cx="55" cy="24" rx="21" ry="21" />
        <ellipse cx="76" cy="38" rx="19" ry="16" />
        <rect x="16" y="34" width="68" height="20" rx="10" />
      </g>
    </svg>
  )
}

export function GiftBox({ size = 60, color = '#ff9ecb', ribbon = '#fff5f9', className, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={style}
    >
      <rect x="12" y="42" width="76" height="46" rx="6" fill={color} />
      <rect x="12" y="42" width="76" height="14" fill={ribbon} opacity="0.9" />
      <rect x="44" y="42" width="12" height="46" fill={ribbon} opacity="0.9" />
      <circle cx="38" cy="30" r="11" fill={ribbon} opacity="0.9" />
      <circle cx="62" cy="30" r="11" fill={ribbon} opacity="0.9" />
      <rect x="45" y="18" width="10" height="20" fill={ribbon} opacity="0.9" />
    </svg>
  )
}

// ---- 開発者モード・エコーギャラリー用の小さなアイコン ----

export function Camera({ size = 24, color = 'currentColor', className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
      <rect x="8" y="30" width="84" height="56" rx="10" fill={color} />
      <rect x="34" y="16" width="32" height="16" rx="4" fill={color} />
      <circle cx="50" cy="58" r="20" fill="#ffffff" opacity="0.9" />
      <circle cx="50" cy="58" r="12" fill={color} />
    </svg>
  )
}

export function Pencil({ size = 24, color = 'currentColor', className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
      <rect x="18" y="54" width="70" height="18" rx="4" transform="rotate(-45 18 54)" fill={color} />
      <polygon points="10,90 26,82 18,74" fill={color} />
    </svg>
  )
}

export function Trash({ size = 24, color = 'currentColor', className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
      <rect x="22" y="30" width="56" height="58" rx="8" fill={color} />
      <rect x="14" y="18" width="72" height="12" rx="6" fill={color} />
      <rect x="40" y="6" width="20" height="12" rx="4" fill={color} />
    </svg>
  )
}

export function ChevronLeft({ size = 24, color = 'currentColor', className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
      <polygon points="65,10 30,50 65,90 78,78 56,50 78,22" fill={color} />
    </svg>
  )
}

export function ChevronRight({ size = 24, color = 'currentColor', className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
      <polygon points="35,10 70,50 35,90 22,78 44,50 22,22" fill={color} />
    </svg>
  )
}

export function Key({ size = 24, color = 'currentColor', className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
      <circle cx="30" cy="30" r="18" fill="none" stroke={color} strokeWidth="9" />
      <rect x="40" y="42" width="46" height="10" fill={color} />
      <rect x="66" y="52" width="10" height="16" fill={color} />
      <rect x="80" y="52" width="10" height="16" fill={color} />
    </svg>
  )
}

export function Plus({ size = 24, color = 'currentColor', className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
      <rect x="42" y="10" width="16" height="80" rx="6" fill={color} />
      <rect x="10" y="42" width="80" height="16" rx="6" fill={color} />
    </svg>
  )
}
