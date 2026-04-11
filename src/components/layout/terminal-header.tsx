export function TerminalHeader({
  title,
  status,
  subtitle,
}: {
  title: string
  status?: string
  subtitle?: string
}) {
  return (
    <div className="border-b border-border bg-surface px-4 py-3 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_6px_var(--cyan)]" />
              <span className="text-xs font-bold tracking-widest text-cyan glow">{title}</span>
            </div>
            {subtitle && (
              <span className="hidden text-[10px] text-muted sm:inline">
                {'//'} {subtitle}
              </span>
            )}
          </div>
          {status && (
            <div className="flex items-center gap-1.5 text-[10px] text-green">
              <div className="h-1.5 w-1.5 rounded-full bg-green" />
              <span>{status}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
