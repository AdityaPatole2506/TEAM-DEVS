import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, Info, AlertCircle, Award, Brain } from 'lucide-react';
import { applicantApi } from '../../services/api';
import toast from 'react-hot-toast';

const TYPE_ICONS: Record<string, any> = {
  SUCCESS: CheckCheck,
  INFO: Info,
  WARNING: AlertCircle,
  AI_ANALYSIS: Brain,
  AWARD: Award,
};

const TYPE_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-50 border-green-100',
  INFO: 'bg-blue-50 border-blue-100',
  WARNING: 'bg-orange-50 border-orange-100',
  AI_ANALYSIS: 'bg-purple-50 border-purple-100',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicantApi.getNotifications()
      .then(r => setNotifications(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try {
      await applicantApi.markNotificationRead(id);
      setNotifications(n => n.map(notif => notif.id === id ? { ...notif, isRead: true } : notif));
    } catch { toast.error('Failed to update'); }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="section-subtitle">{unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={async () => {
              for (const n of notifications.filter(n => !n.isRead)) await markRead(n.id);
            }}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-12">
          <Bell size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notif => {
            const Icon = TYPE_ICONS[notif.type] || Info;
            return (
              <div
                key={notif.id}
                onClick={() => !notif.isRead && markRead(notif.id)}
                className={`card border cursor-pointer transition-all ${TYPE_COLORS[notif.type] || 'bg-gray-50 border-gray-100'} ${!notif.isRead ? 'shadow-sm' : 'opacity-70'}`}
              >
                <div className="flex items-start gap-3">
                  <Icon size={18} className="flex-shrink-0 mt-0.5 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-gray-800">{notif.title}</span>
                      {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>}
                    </div>
                    <p className="text-gray-500 text-sm mt-0.5">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
