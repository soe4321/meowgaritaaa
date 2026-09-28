import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Check, ExternalLink, CheckCircle2, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'ADMIN_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-forest-600" />;
      case 'PENDING_ADMIN':
      case 'PENDING_FACULTY':
      case 'SUBMITTED':
        return <Clock className="w-4 h-4 text-mustard-600" />;
      case 'CORRECTION_REQUIRED':
      case 'RETURNED_FOR_CORRECTION':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Bell className="w-4 h-4 text-forest-700" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl border border-ivory-300 shadow-elevated z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-ivory-50 border-b border-ivory-200">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-forest-800" />
              <h4 className="text-sm font-serif font-bold text-charcoal-900">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 bg-terracotta-600 text-white text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-forest-800 hover:text-forest-900 font-medium flex items-center gap-1 hover:underline"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-ivory-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-charcoal-400">
                No notifications right now.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 transition-colors ${
                    item.isRead ? 'bg-white hover:bg-ivory-50/50' : 'bg-forest-50/30 hover:bg-forest-50/50'
                  }`}
                  onClick={() => !item.isRead && markAsRead(item.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0 p-1.5 rounded-md bg-white border border-ivory-200 shadow-xs">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-medium ${item.isRead ? 'text-charcoal-800' : 'text-forest-950 font-semibold'}`}>
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-terracotta-500 shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-charcoal-600 line-clamp-2 leading-relaxed font-sans">
                        {item.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-charcoal-400">
                        <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        {item.link && (
                          <Link
                            to={item.link}
                            onClick={onClose}
                            className="text-forest-700 hover:text-forest-900 font-medium inline-flex items-center gap-1 hover:underline"
                          >
                            View details <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-ivory-50 border-t border-ivory-200 text-center">
            <Link
              to="/notifications"
              onClick={onClose}
              className="text-xs font-medium text-forest-800 hover:text-forest-900 hover:underline"
            >
              View all notification history →
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
