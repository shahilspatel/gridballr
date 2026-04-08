import { TerminalHeader } from '@/components/layout/terminal-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'GridBallr terms of service and usage agreement.',
}

export default function TermsPage() {
  return (
    <div>
      <TerminalHeader title="TERMS_OF_SERVICE" status="LEGAL" />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="border border-border bg-surface p-6 sm:p-8">
          <div className="prose-terminal flex flex-col gap-6 text-[12px] leading-relaxed text-foreground/80">
            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                1. ACCEPTANCE_OF_TERMS
              </h2>
              <p>
                By accessing and using GridBallr (&quot;the Platform&quot;), you agree to be bound
                by these Terms of Service. If you do not agree to these terms, please do not use the
                Platform.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                2. DESCRIPTION_OF_SERVICE
              </h2>
              <p>
                GridBallr provides NFL draft scouting tools, analytics, prospect databases, mock
                draft simulations, and related services. The Platform offers both free and premium
                subscription tiers.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">3. USER_ACCOUNTS</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials.
                You agree to provide accurate information during registration and to keep your
                account information up to date.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                4. SUBSCRIPTION_AND_BILLING
              </h2>
              <p>
                Premium subscriptions are billed monthly ($12/month) or annually ($80/year) through
                Stripe. You may cancel at any time. Refunds are handled on a case-by-case basis.
                Prices are subject to change with 30 days notice.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                5. ACCEPTABLE_USE
              </h2>
              <p>You agree not to:</p>
              <ul className="mt-2 flex flex-col gap-1 pl-4">
                <li>- Scrape or systematically download data from the Platform</li>
                <li>- Use the Platform for any unlawful purpose</li>
                <li>- Attempt to gain unauthorized access to other users&apos; accounts</li>
                <li>- Distribute or resell Platform content without authorization</li>
                <li>- Interfere with or disrupt the Platform&apos;s infrastructure</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                6. INTELLECTUAL_PROPERTY
              </h2>
              <p>
                All content, features, and functionality of the Platform are owned by GridBallr. NFL
                team names, logos, and related marks are property of the National Football League.
                GridBallr is not affiliated with or endorsed by the NFL.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                7. DATA_AND_ACCURACY
              </h2>
              <p>
                Prospect data, rankings, and analytics are provided for informational and
                entertainment purposes. While we strive for accuracy, we do not guarantee the
                completeness or reliability of any data. Do not make financial decisions based
                solely on Platform data.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">
                8. LIMITATION_OF_LIABILITY
              </h2>
              <p>
                GridBallr is provided &quot;as is&quot; without warranties of any kind. We shall not
                be liable for any indirect, incidental, special, or consequential damages arising
                from your use of the Platform.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">9. MODIFICATIONS</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be posted on
                this page with an updated effective date. Continued use of the Platform after
                changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xs font-bold tracking-widest text-cyan">10. CONTACT</h2>
              <p>
                For questions about these terms, contact us at{' '}
                <span className="text-cyan">support@gridballr.com</span>.
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
