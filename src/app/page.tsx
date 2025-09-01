// src/app/page.tsx
'use client';

import { useState } from 'react';
import { getFCMToken } from '@/lib/firebase';

export default function Home() {
  const [status, setStatus] = useState('');

  const subscribe = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('Push notifications not supported');
      return;
    }

    try {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('Permission denied');
        return;
      }

      const token = await getFCMToken();
      if (!token) {
        setStatus('Failed to get token');
        return;
      }

      const res = await fetch('/api/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (res.ok) {
        setStatus('Subscribed successfully!');
      } else {
        setStatus('Failed to register token');
      }
    } catch (error) {
      console.error(error);
      setStatus('Error subscribing');
    }
  };

  const sendTestNotification = async () => {
    const res = await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Test Notification', body: 'Hello from Next.js!' }),
    });

    const data = await res.json();
    setStatus(data.message || data.error);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">
          FCM Notifications with Next.js
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={subscribe}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Subscribe to Notifications
          </button>
          <button
            onClick={sendTestNotification}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
          >
            Send Test Notification
          </button>
        </div>
        {status && (
          <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Status:</span> {status}
          </p>
        )}
      </div>
    </div>
  );
}