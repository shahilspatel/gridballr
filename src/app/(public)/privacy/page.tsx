import { TerminalHeader } from '@/components/layout/terminal-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'GridBallr privacy policy — how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
  return (
    <div>
      <TerminalHeader title="PRIVACY_POLICY" status="LEGAL" />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="border border-border bg-surface p-6 sm:p-8">
          <div className="prose-terminal flex flex-col gap-6 text-[12px] leading-relaxed text-foreground/80">
            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                1. INFORMATION_WE_COLLECT
              </h2>
              <p>We collect the following types of information:</p>
              <ul className="mt-2 flex flex-col gap-1 pl-4">
                <li>
                  - <span className="text-foreground">Account data:</span> Email address, scout
                  alias, and password (hashed) when you create an account
                </li>
                <li>
                  - <span className="text-foreground">Usage data:</span> Pages visited, features
                  used, and interaction patterns via Vercel Analytics
                </li>
                <li>
                  - <span className="text-foreground">Payment data:</span> Processed securely by
                  Stripe. We do not store credit card numbers
                </li>
                <li>
                  - <span className="text-foreground">User content:</span> Custom draft boards,
                  scouting reports, and notes you create
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                2. HOW_WE_USE_DATA
              </h2>
              <p>Your information is used to:</p>
              <ul className="mt-2 flex flex-col gap-1 pl-4">
                <li>- Provide and maintain the Platform</li>
                <li>- Process subscriptions and payments</li>
                <li>- Improve Platform features and performance</li>
                <li>- Send service-related communications</li>
                <li>- Detect and prevent fraud or abuse</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">3. DATA_STORAGE</h2>
              <p>
                Your data is stored securely using Supabase (PostgreSQL) with row-level security
                policies. Authentication is handled by Supabase Auth. All data transmission is
                encrypted via TLS/SSL.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                4. THIRD_PARTY_SERVICES
              </h2>
              <p>We use the following third-party services:</p>
              <ul className="mt-2 flex flex-col gap-1 pl-4">
                <li>
                  - <span className="text-foreground">Supabase:</span> Database and authentication
                </li>
                <li>
                  - <span className="text-foreground">Stripe:</span> Payment processing
                </li>
                <li>
                  - <span className="text-foreground">Vercel:</span> Hosting and analytics
                </li>
                <li>
                  - <span className="text-foreground">YouTube:</span> Embedded video content (Film
                  Terminal)
                </li>
              </ul>
              <p className="mt-2">
                Each service has its own privacy policy. We encourage you to review them.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">5. COOKIES</h2>
              <p>
                We use essential cookies for authentication and session management. Vercel Analytics
                uses privacy-friendly, cookieless analytics. We do not use tracking cookies or sell
                data to advertisers.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">6. YOUR_RIGHTS</h2>
              <p>You have the right to:</p>
              <ul className="mt-2 flex flex-col gap-1 pl-4">
                <li>- Access your personal data</li>
                <li>- Request correction of inaccurate data</li>
                <li>- Request deletion of your account and data</li>
                <li>- Export your data (draft boards, scouting reports)</li>
                <li>- Opt out of non-essential communications</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                7. DATA_RETENTION
              </h2>
              <p>
                We retain your data for as long as your account is active. Upon account deletion, we
                remove your personal data within 30 days. Anonymized usage analytics may be retained
                indefinitely.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">8. SECURITY</h2>
              <p>
                We implement industry-standard security measures including encrypted data
                transmission (TLS), row-level database security, secure password hashing, and
                regular security audits. No method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">9. CHILDREN</h2>
              <p>
                The Platform is not directed at children under 13. We do not knowingly collect
                personal information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">10. CONTACT</h2>
              <p>
                For privacy-related inquiries, contact us at{' '}
                <span className="text-cyan">privacy@gridballr.com</span>.
              </p>
            </section>

            <div className="mt-4 border-t border-border pt-4 text-[10px] text-muted">
              LAST_UPDATED: 2025-04-08 // EFFECTIVE_DATE: 2025-04-08
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
