import React, { useState, useEffect } from 'react';
import { Bell, MessageSquare, AtSign, CheckCircle, User, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  message: string;
  type: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

// Demo notifications with different types
const demoNotifications: Notification[] = [
  {
    id: 'demo-notif-1',
    message: 'John_Doe answered your question "How to center a div in CSS?"',
    type: 'answer',
    link: '/question/demo-1',
    is_read: false,
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
  },
  {
    id: 'demo-notif-2',
    message: 'Sarah_Dev mentioned you in a comment: "@CSSMaster great explanation!"',
    type: 'mention',
    link: '/question/demo-2',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: 'demo-notif-3',
    message: 'Your answer to "React useState not updating immediately" was accepted',
    type: 'accepted',
    link: '/question/demo-2',
    is_read: false,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
  },
  {
    id: 'demo-notif-4',
    message: 'CodeMaster answered your question "Best practices for API error handling"',
    type: 'answer',
    link: '/question/demo-3',
    is_read: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
  },
  {
    id: 'demo-notif-5',
    message: 'ReactPro commented on your answer about state management',
    type: 'comment',
    link: '/question/demo-9',
    is_read: true,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
  },
  {
    id: 'demo-notif-6',
    message: 'DevOpsGuru mentioned you: "@username check out this CI/CD approach"',
    type: 'mention',
    link: '/question/demo-20',
    is_read: true,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: 'demo-notif-7',
    message: 'Your question "Understanding closures in JavaScript" received a new answer',
    type: 'answer',
    link: '/question/demo-19',
    is_read: true,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
  },
  {
    id: 'demo-notif-8',
    message: 'JSExpert accepted your answer about async/await patterns',
    type: 'accepted',
    link: '/question/demo-13',
    is_read: true,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  }
];

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    // Always use demo notifications for now
    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.is_read).length);
    return;

    // This code will be used when Supabase is properly connected:
    if (supabase && user) {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        setNotifications(data || []);
        setUnreadCount(data?.filter(n => !n.is_read).length || 0);
      } catch (error) {
        console.log('Notifications table not set up yet. Using demo mode.');
        setNotifications(demoNotifications);
        setUnreadCount(demoNotifications.filter(n => !n.is_read).length);
      }
    }
  };

  const markAsRead = async (notificationId: string) => {
    // Demo mode - just update local state
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    return;

    // This code will be used when Supabase is properly connected:
    if (supabase) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('id', notificationId);

        if (error) throw error;

        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.log('Database not available. Using demo mode.');
        setNotifications(prev =>
          prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const markAllAsRead = async () => {
    // Demo mode - mark all as read
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    return;

    // This code will be used when Supabase is properly connected:
    if (supabase && user) {
      try {
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('recipient_id', user.id)
          .eq('is_read', false);

        if (error) throw error;

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      } catch (error) {
        console.log('Database not available. Using demo mode.');
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-purple-600" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white hover:bg-gray-50';
    
    switch (type) {
      case 'answer':
        return 'bg-blue-50 hover:bg-blue-100';
      case 'comment':
        return 'bg-green-50 hover:bg-green-100';
      case 'mention':
        return 'bg-purple-50 hover:bg-purple-100';
      case 'accepted':
        return 'bg-green-50 hover:bg-green-100';
      default:
        return 'bg-gray-50 hover:bg-gray-100';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Notification dropdown */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            {/* Notifications list */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${getNotificationBgColor(notification.type, notification.is_read)}`}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                      setIsOpen(false);
                      // In a real app, you would navigate to notification.link
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </div>
                      </div>
                      {!notification.is_read && (
                        <div className="flex-shrink-0">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}