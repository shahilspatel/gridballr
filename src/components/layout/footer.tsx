import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_6px_var(--cyan)]" />
              <span className="text-sm font-bold tracking-wider text-cyan glow">GRIDBALLR</span>
            </div>
            <p className="text-[10px] text-muted">
              NFL Draft Intelligence Platform. Advanced scouting, analytics, and prospect tools.
            </p>
            <div className="mt-1 flex items-center gap-1.5 text-[9px] text-muted">
              <div className="h-1.5 w-1.5 rounded-full bg-green" />
              <span>ALL_SYSTEMS_OPERATIONAL</span>
            </div>
          </div>

          {/* Scouting */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold tracking-widest text-muted">SCOUTING</span>
            <div className="flex flex-col gap-1.5">
              <FooterLink href="/" label="Big Board" />
              <FooterLink href="/stats" label="Stat Matrix" />
              <FooterLink href="/compare" label="Compare Engine" />
              <FooterLink href="/film-terminal" label="Film Terminal" />
              <FooterLink href="/scouts" label="Scouts Community" />
            </div>
          </div>

          {/* Tools */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold tracking-widest text-muted">TOOLS</span>
            <div className="flex flex-col gap-1.5">
              <FooterLink href="/mock-draft" label="Mock Draft" />
              <FooterLink href="/lottery" label="Lottery Simulator" />
              <FooterLink href="/my-board" label="My Board" />
              <FooterLink href="/dynasty" label="Dynasty Bridge" />
              <FooterLink href="/dynasty/calculator" label="Trade Calculator" />
            </div>
          </div>

          {/* Account & Legal */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold tracking-widest text-muted">ACCOUNT</span>
            <div className="flex flex-col gap-1.5">
              <FooterLink href="/pricing" label="Pricing" />
              <FooterLink href="/login" label="Login" />
              <FooterLink href="/signup" label="Sign Up" />
            </div>
            <span className="mt-2 text-[10px] font-bold tracking-widest text-muted">LEGAL</span>
            <div className="flex flex-col gap-1.5">
              <FooterLink href="/terms" label="Terms of Service" />
              <FooterLink href="/privacy" label="Privacy Policy" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-border pt-4 sm:flex-row sm:justify-between">
          <span className="text-[9px] text-muted">
            GRIDBALLR // NFL DRAFT INTELLIGENCE // {new Date().getFullYear()}
          </span>
          <span className="text-[9px] text-muted">NOT AFFILIATED WITH THE NFL OR ANY NFL TEAM</span>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-[11px] text-muted transition-colors hover:text-cyan">
      {label}
    </Link>
  )
}
