'use client'

import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { ReactNode } from 'react'

interface ReCaptchaProviderProps {
  children: ReactNode
}

export function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  // Debug: Log site key status
  console.log('[ReCaptchaProvider] Site Key present:', !!siteKey, siteKey ? `(${siteKey.substring(0, 10)}...)` : '')

  // Skip reCAPTCHA in development if no site key
  if (!siteKey || siteKey === 'YOUR_SITE_KEY_HERE') {
    console.log('[ReCaptchaProvider] Skipping - no valid site key')
    return <>{children}</>
  }

  console.log('[ReCaptchaProvider] Initializing with site key')

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head',
      }}
      language="tr"
    >
      {children}
    </GoogleReCaptchaProvider>
  )
}
