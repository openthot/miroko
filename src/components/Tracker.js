'use client';

import { useEffect } from 'react';

export default function Tracker() {
  useEffect(() => {
    // Basic hit counter using counterAPI
    fetch('https://api.counterapi.dev/v1/miroko_app/hits/up')
      .then(res => res.json())
      .then(data => {
        console.log('[Tracking] Site hits:', data.count);
      })
      .catch(err => console.error('[Tracking] CounterAPI error:', err));

    // Basic user details tracking using ipapi
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        console.log('[Tracking] User details:', {
          ip: data.ip,
          city: data.city,
          region: data.region,
          country: data.country_name,
          org: data.org
        });
      })
      .catch(err => console.error('[Tracking] IPAPI error:', err));
  }, []);

  return null; // Silent tracking component
}
