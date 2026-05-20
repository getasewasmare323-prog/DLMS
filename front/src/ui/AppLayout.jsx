import React, { useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  BookOpen,
  ChevronDown,
  Clock,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User,
} from "lucide-react";
import {
  getMyNotifications,
  markNotificationsRead,
} from "../data/userEndPoint";

const formatTimeAgo = (dateValue) => {
  const timestamp = new Date(dateValue).getTime();
  const diffMinutes = Math.max(1, Math.floor((Date.now() - timestamp) / 60000));

  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return `${Math.floor(diffMinutes / 1440)}d ago`;
};

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, isDarkMode, toggleDarkMode, logout } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  const displayName = useMemo(() => {
    const first = user?.firstName || "";
    const last = user?.lastName || "";
    return `${first} ${last}`.trim() || "Student";
  }, [user]);

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      const items = await getMyNotifications();
      if (isMounted) {
        setNotifications(items);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openNotifications = async () => {
    setIsNotificationsOpen((current) => !current);
    setIsUserMenuOpen(false);

    if (unreadCount > 0) {
      await markNotificationsRead();
      setNotifications((current) =>
        current.map((item) => ({ ...item, read: true })),
      );
    }
  };

  const quickStats = [
    {
      label: "Role",
      value: user?.role ? user.role.toUpperCase() : "MEMBER",
    },
    {
      label: "Grade",
      value: user?.classLevel ? `Grade ${user.classLevel}` : "All",
    },
  ];

  return (
    <div className="relative flex min-h-screen bg-app-base text-zinc-900 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex min-h-screen flex-1 flex-col md:ml-72">
        <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/80 px-4 py-3 backdrop-blur-2xl dark:border-zinc-800/70 dark:bg-zinc-900/80 sm:px-6">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-xl p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 md:hidden"
              >
                <Menu size={22} />
              </button>

              <div className="hidden items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2 shadow-sm shadow-zinc-100/80 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-none lg:flex lg:w-[26rem]">
                <Search size={17} className="text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search resources, subjects, teachers..."
                  className="w-full border-0 bg-transparent text-sm font-medium text-zinc-700 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-200"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900 sm:flex">
                {quickStats.map((item) => (
                  <div key={item.label} className="rounded-xl px-3 py-1.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400">
                      {item.label}
                    </p>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={toggleDarkMode}
                className="rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-600 transition-all hover:-translate-y-0.5 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={openNotifications}
                className="relative rounded-xl border border-zinc-200 bg-white p-2.5 text-zinc-600 transition-all hover:-translate-y-0.5 hover:text-emerald-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-emerald-600 px-1 text-[10px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white py-1.5 pl-2 pr-2 shadow-sm shadow-zinc-100 transition-all hover:-translate-y-0.5 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-none"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-black text-white">
                    {displayName.charAt(0)}
                  </span>
                  <span className="hidden text-left sm:block">
                    <span className="block text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {displayName}
                    </span>
                    <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-emerald-600">
                      {user?.role || "member"}
                    </span>
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-zinc-400 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:shadow-zinc-950/40">
                    <div className="border-b border-zinc-200 bg-zinc-50/90 p-5 dark:border-zinc-700 dark:bg-zinc-800/60">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-xl font-black text-white">
                          {displayName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-serif text-xl font-bold leading-none text-zinc-900 dark:text-zinc-100">
                            {displayName}
                          </h4>
                          <p className="mt-1 text-xs text-zinc-500">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 p-3">
                      <MenuOption
                        icon={User}
                        label="My Profile"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/profile");
                        }}
                      />
                      <MenuOption
                        icon={Settings}
                        label="Settings"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/settings");
                        }}
                      />
                      <MenuOption
                        icon={Bell}
                        label="Notifications"
                        dot={unreadCount > 0}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/notifications");
                        }}
                      />
                      {/* <MenuOption
                        icon={Clock}
                        label="Learning Activity"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate("/dashboard");
                        }}
                      /> */}

                      <button
                        onClick={logout}
                        className="mt-2 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <LogOut size={17} />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {isNotificationsOpen && (
          <NotificationPanel
            notificationRef={notificationRef}
            notifications={notifications}
            onClose={() => setIsNotificationsOpen(false)}
          />
        )}

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 md:pt-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

const MenuOption = ({ icon: Icon, label, onClick, dot }) => (
  <button
    onClick={onClick}
    className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
  >
    <span className="flex items-center gap-3 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
      <Icon size={17} className="text-zinc-500" />
      {label}
    </span>
    {dot && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
  </button>
);

const NotificationPanel = ({ notificationRef, notifications, onClose }) => {
  return (
    <aside
      ref={notificationRef}
      className="fixed right-4 top-20 z-[70] w-[22rem] overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/15 dark:border-zinc-700 dark:bg-zinc-900 sm:right-6"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/70">
        <p className="text-sm font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-300">
          Notifications
        </p>
        <button
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-xs font-bold text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
        >
          Close
        </button>
      </div>

      <div className="max-h-[24rem] space-y-2 overflow-y-auto p-3 custom-scrollbar">
        {notifications.length ? (
          notifications.map((item) => (
            <article
              key={item.notificationId}
              className={`rounded-2xl border p-3 ${
                item.read
                  ? "border-zinc-100 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-800/70"
                  : "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/50 dark:bg-emerald-950/30"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <BookOpen size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                    {item.title || "New class resource"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {item.message}
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-zinc-400">
                    {formatTimeAgo(item.createdAt)}
                  </p>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 p-5 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
            No notifications yet for your grade.
          </div>
        )}
      </div>
    </aside>
  );
};
