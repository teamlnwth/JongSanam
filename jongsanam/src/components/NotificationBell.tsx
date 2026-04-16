'use client'

import { useState, useEffect } from 'react'
import { getNotifications, markNotificationAsRead } from '@/app/actions'
import { formatDistanceToNow } from 'date-fns'
import { th } from 'date-fns/locale'
import Link from 'next/link'

type Notification = {
  id: string
  message: string
  type: string
  read: boolean
  link: string | null
  createdAt: Date
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  
  const fetchNotifs = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch {
       // user might not be logged in or error
    }
  }

  useEffect(() => {
    fetchNotifs()
    // Poll every 15 seconds
    const interval = setInterval(fetchNotifs, 15000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleRead = async (id: string, link: string | null) => {
    if (notifications.find(n => n.id === id && !n.read)) {
      await markNotificationAsRead(id)
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
    }
    if (!link) {
      setIsOpen(false)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-extrabold text-slate-800">การแจ้งเตือน</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-bold">
                  {unreadCount} ใหม่
                </span>
              )}
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium">
                  <span className="text-3xl mb-2 block opacity-50">📭</span>
                  ไม่มีการแจ้งเตือน
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notifications.map(n => {
                    const content = (
                      <div className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 ${n.read ? 'opacity-70' : 'bg-blue-50/30'}`}>
                        <div className="shrink-0 text-2xl">
                          {n.type === 'NEW_JOIN' ? '🎉' : n.type === 'POST_CANCEL' ? '🚨' : n.type === 'KICKED' ? '👢' : '💬'}
                        </div>
                        <div>
                          <p className={`text-sm ${!n.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                            {n.message}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: th })}
                          </p>
                        </div>
                        {!n.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 self-center ml-auto shrink-0 animate-pulse"></div>
                        )}
                      </div>
                    )

                    return (
                      <li key={n.id}>
                        {n.link ? (
                          <Link href={n.link} onClick={() => handleRead(n.id, n.link)}>
                            {content}
                          </Link>
                        ) : (
                          <div onClick={() => handleRead(n.id, null)} className="cursor-pointer">
                            {content}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
