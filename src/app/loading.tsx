export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]" />
          <div
            className="h-2 w-2 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]"
            style={{ animationDelay: '0.2s' }}
          />
          <div
            className="h-2 w-2 animate-pulse rounded-full bg-cyan shadow-[0_0_8px_var(--cyan)]"
            style={{ animationDelay: '0.4s' }}
          />
        </div>
        <span className="text-[10px] font-bold tracking-widest text-muted">LOADING_DATA...</span>
      </div>
    </div>
  )
}
