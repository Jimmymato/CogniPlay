// Logo de la marca. `compact` oculta el texto y deja solo el isotipo.
export default function Logo({ size = 30, compact = false }) {
  return (
    <div
      role="img"
      aria-label="CogniPlay"
      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
    >
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="9" fill="var(--cp-blue)" />
        <circle cx="12" cy="16" r="5.5" stroke="white" strokeWidth="1.8" fill="none" />
        <circle cx="20" cy="16" r="5.5" stroke="white" strokeWidth="1.8" fill="none" />
        <path d="M16 10.5 L16 21.5" stroke="white" strokeWidth="1.4" strokeDasharray="1.5 1.5" />
        <path d="M14.5 24 L17.5 24 L16 27Z" fill="white" opacity="0.85" />
      </svg>
      {!compact && (
        <span
          style={{
            fontFamily: 'var(--cp-font)',
            fontSize: size * 0.6,
            fontWeight: 700,
            color: 'var(--cp-text-1)',
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          Cogni<span style={{ color: 'var(--cp-blue)' }}>Play</span>
        </span>
      )}
    </div>
  )
}
