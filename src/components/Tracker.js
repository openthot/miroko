'use client';

import { useEffect } from 'react';

export default function Tracker() {
  useEffect(() => {
    // Basic hit counter using counterAPI
    fetch('https://api.counterapi.dev/v1/miroko_app/hits/up')
      .then(res => res.json())
      .catch(err => console.error('[Tracking] CounterAPI error:', err));

    // Basic user details tracking using ipapi
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        // Tracker fetch resolves silently
      })
      .catch(err => console.error('[Tracking] IPAPI error:', err));
  }, []);

  return null; // Silent tracking component
}
