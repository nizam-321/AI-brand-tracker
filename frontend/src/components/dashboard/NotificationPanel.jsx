// src/components/dashboard/NotificationPanel.jsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

import {
  Bell,
  TrendingUp,
  MessageSquare,
  X,
  CheckCheck,
  AlertCircle,
  ThumbsUp,
} from 'lucide-react';

import { formatDate } from '@/lib/utils';

export default function NotificationPanel({ mentions = [], stats = null }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate notifications based on stats & mentions
  useEffect(() => {
    const newNotifications = [];

    if (!stats && (!mentions || mentions.length === 0)) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Spike alert
    if (stats?.spikes > 0) {
      newNotifications.push({
        id: `spike-${Date.now()}`,
        type: 'spike',
        title: 'Spike Detected',
        description: `${stats.spikes} unusual activity patterns detected`,
        icon: TrendingUp,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50/60',
        borderColor: 'border-amber-200',
        timestamp: new Date(),
        read: false,
      });
    }

    // High negative sentiment
    if (stats?.negative > 10) {
      newNotifications.push({
        id: `negative-${Date.now()}`,
        type: 'negative',
        title: 'High Negative Sentiment',
        description: `${stats.negative} negative mentions detected`,
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50/70',
        borderColor: 'border-red-200',
        timestamp: new Date(),
        read: false,
      });
    }

    // Positive trend
    if (stats?.positive > 20) {
      newNotifications.push({
        id: `positive-${Date.now()}`,
        type: 'positive',
        title: 'Positive Trend',
        description: `${stats.positive} positive mentions in the last hour`,
        icon: ThumbsUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50/70',
        borderColor: 'border-green-200',
        timestamp: new Date(),
        read: false,
      });
    }

    // Mentions (latest 5)
    if (mentions?.length > 0) {
      const recent = mentions.slice(0, 5).map((mention, idx) => {
        const emoji =
          mention.sentiment === 'positive'
            ? '🟢'
            : mention.sentiment === 'negative'
            ? '🔴'
            : '⚪';

        return {
          id: mention._id || `mention-${Date.now()}-${idx}`,
          type: 'mention',
          title: `${emoji} New Mention`,
          description: `${mention.source}: ${mention.text.slice(0, 80)}${
            mention.text.length > 80 ? '...' : ''
          }`,
          icon: MessageSquare,
          color:
            mention.sentiment === 'positive'
              ? 'text-green-600'
              : mention.sentiment === 'negative'
              ? 'text-red-600'
              : 'text-gray-600',
          bgColor:
            mention.sentiment === 'positive'
              ? 'bg-green-50/60'
              : mention.sentiment === 'negative'
              ? 'bg-red-50/60'
              : 'bg-gray-50',
          borderColor:
            mention.sentiment === 'positive'
              ? 'border-green-200'
              : mention.sentiment === 'negative'
              ? 'border-red-200'
              : 'border-gray-200',
          timestamp: new Date(mention.timestamp),
          read: false,
          mentionData: mention,
        };
      });

      newNotifications.push(...recent);
    }

    setNotifications(newNotifications);
    setUnreadCount(newNotifications.filter((n) => !n.read).length);
  }, [mentions, stats]);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <DropdownMenu>
      {/* Trigger */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-gray-700 hover:bg-gray-100 transition"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] text-[10px] h-5 px-1 bg-red-500 rounded-full text-white flex items-center justify-center font-semibold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent
        align="end"
        className="w-[400px] max-h-[550px] overflow-y-auto shadow-lg border border-gray-200 rounded-xl"
      >
        {/* HEADER */}
        <div className="px-4 py-3 border-b bg-gray-50/80 flex items-center justify-between">
          <div>
            <DropdownMenuLabel className="text-base font-semibold text-gray-900 p-0">
              Notifications
            </DropdownMenuLabel>
            <p className="text-xs text-gray-500">
              {unreadCount > 0
                ? `${unreadCount} unread`
                : 'You’re all caught up ✨'}
            </p>
          </div>

          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className="h-7 text-xs"
                >
                  <CheckCheck className="w-3 h-3 mr-1" />
                  Read all
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearAll();
                }}
                className="h-7 text-xs text-red-600 hover:bg-red-50"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* LIST */}
        {notifications.length === 0 ? (
          <div className="text-center py-14 px-4">
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-gray-700 font-medium">No Notifications</p>
            <p className="text-xs text-gray-500 mt-1">
              New alerts will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className={`px-4 py-3 cursor-pointer transition ${
                  !n.read ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-gray-50'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  markAsRead(n.id);
                }}
              >
                <div className="flex gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg ${n.bgColor} border ${n.borderColor} flex items-center justify-center`}
                  >
                    <n.icon className={`w-5 h-5 ${n.color}`} />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p
                        className={`text-sm font-medium ${
                          n.read ? 'text-gray-600' : 'text-gray-900'
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full mt-1 animate-pulse" />
                      )}
                    </div>

                    <p className="text-xs text-gray-600">{n.description}</p>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-400">
                        {formatDate(n.timestamp)}
                      </span>

                      {n.mentionData && (
                        <Badge variant="outline" className="text-[10px] px-2">
                          {n.mentionData.source}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}

        {/* FOOTER */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="py-2 text-center bg-gray-50">
              <p className="text-[11px] text-gray-500">
                Showing {Math.min(notifications.length, 10)} of{' '}
                {notifications.length}
              </p>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
