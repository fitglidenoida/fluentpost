'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

interface FacebookSDKProps {
  appId: string
  version?: string
}

export default function FacebookSDK({ appId, version = 'v18.0' }: FacebookSDKProps) {
  useEffect(() => {
    // Only initialize if appId is provided
    if (!appId || appId === 'your-facebook-app-id-here') {
      console.log('Facebook SDK: App ID not configured, skipping initialization')
      return
    }

    // Initialize Facebook SDK
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: appId,
        cookie: true,
        xfbml: true,
        version: version
      })
      
      // Log page view event
      window.FB.AppEvents.logPageView()
      
      console.log('Facebook SDK initialized successfully with App ID:', appId)
    }

    // Load Facebook SDK
    const loadFacebookSDK = () => {
      const script = document.createElement('script')
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
    }

    // Check if SDK is already loaded
    if (!document.getElementById('facebook-jssdk')) {
      loadFacebookSDK()
    }

    // Cleanup function
    return () => {
      // Remove the script if component unmounts
      const existingScript = document.getElementById('facebook-jssdk')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [appId, version])

  return null // This component doesn't render anything
}
