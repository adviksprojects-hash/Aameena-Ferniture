"use client";

/**
 * @file NotificationBell.jsx
 * Admin & Manager review moderation notification bell.
 * Displays real-time badge count for new reviews, reported content,
 * low star ratings (1-2★), and detected duplicates.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Star,
  Flag,
  ShieldAlert,
  AlertTriangle,
  Check,
  CheckCircle2,
  X,
  Clock,
} from "lucide-react";
import {
  getReviewNotificationsAction,
  markReviewNotificationReadAction,
} from "../actions/reviewManagementActions.js";

export function NotificationBell({ onSelectReview }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getReviewNotificationsAction({ limit: 20 });
      if (res.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.warn("Failed to load notifications:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markReviewNotificationReadAction(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "REPORT":
        return <Flag className="w-3.5 h-3.5 text-rose-500" />;
      case "DUPLICATE":
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-500" />;
      case "LOW_RATING":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Star className="w-3.5 h-3.5 text-emerald-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        suppressHydrationWarning
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
        aria-label="Moderation Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-600 text-white font-bold text-[10px] flex items-center justify-center px-1 shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="p-3.5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-stone-900 dark:text-white">
                Moderation Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                  {unreadCount} new
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800 text-xs">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-stone-400">
                <Clock className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.reviewId && onSelectReview) {
                      onSelectReview(item.reviewId);
                      setIsOpen(false);
                    }
                  }}
                  className={`p-3 transition-colors flex items-start gap-2.5 cursor-pointer ${
                    item.isRead
                      ? "hover:bg-stone-50 dark:hover:bg-stone-800/40 opacity-75"
                      : "bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70"
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-semibold text-stone-900 dark:text-white truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-stone-400 shrink-0">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-600 dark:text-stone-400 line-clamp-2 mt-0.5">
                      {item.message}
                    </p>
                  </div>

                  {!item.isRead && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="p-1 rounded text-stone-400 hover:text-emerald-600 shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
