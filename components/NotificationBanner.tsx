'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export default function NotificationBanner() {
  const [status, setStatus] = useState<'checking' | 'off' | 'on' | 'unsupported'>('checking')

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
    } else if (Notification.permission === 'granted') {
      setStatus('on')
    } else {
      setStatus('off')
    }
  }, [])

  async function turnOn() {
    const registration = await navigator.serviceWorker.register('/sw.js')
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      setStatus('off')
      return
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const keys = subscription.toJSON().keys!
    await supabase.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      { onConflict: 'endpoint' }
    )

    setStatus('on')
  }

  if (status === 'checking') return null

  if (status === 'unsupported') {
    return (
      <div className="reminder-banner">
        <span>On iPhone, add this site to your home screen first, then reminders will work.</span>
      </div>
    )
  }

  if (status === 'on') {
    return null
  }

  return (
    <div className="reminder-banner">
      <span>Get a reminder before things are due.</span>
      <button onClick={turnOn}>Turn on reminders</button>
    </div>
  )
}
