import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { safeRedirect } from '@/lib/safe-redirect'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirect = safeRedirect(searchParams.get('redirect'))

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      // Don't pretend the login succeeded — send the user to /login with a
      // generic error flag so the UI can surface it. Avoid leaking the raw
      // Supabase error text.
      console.error('Auth callback: exchangeCodeForSession failed', error)
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
    }
  }

  return NextResponse.redirect(`${origin}${redirect}`)
}
