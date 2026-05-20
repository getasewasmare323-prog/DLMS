import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Book,
  Users,
  BarChart,
  FileText,
  Search,
  X,
  Star,
  LayoutGrid,
  Bookmark,
  GraduationCap,
  LogOut,
  Settings,
  UserCircle2,
  Video,
  Repeat,
  Clock3,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const roleColors = {
  student: {
    primary: "emerald",
    bg: "bg-emerald-600",
    bgLight: "bg-emerald-50",
    bgDark: "bg-emerald-900/30",
    text: "text-emerald-700",
    textLight: "text-emerald-300",
    shadow: "shadow-[0_14px_24px_-14px_rgba(5,150,105,0.85)]",
    gradientFrom: "from-emerald-50",
    gradientTo: "to-lime-50",
  },
  teacher: {
    primary: "royal",
    bg: "bg-royal-600",
    bgLight: "bg-royal-50",
    bgDark: "bg-royal-900/30",
    text: "text-royal-700",
    textLight: "text-royal-300",
    shadow: "shadow-[0_14px_24px_-14px_rgba(14,165,233,0.85)]",
    gradientFrom: "from-royal-50",
    gradientTo: "to-sky-50",
  },
  librarian: {
    primary: "violet",
    bg: "bg-violet-600",
    bgLight: "bg-violet-50",
    bgDark: "bg-violet-900/30",
    text: "text-violet-700",
    textLight: "text-violet-300",
    shadow: "shadow-[0_14px_24px_-14px_rgba(124,58,237,0.85)]",
    gradientFrom: "from-violet-50",
    gradientTo: "to-fuchsia-50",
  },
  admin: {
    primary: "indigo",
    bg: "bg-indigo-600",
    bgLight: "bg-indigo-50",
    bgDark: "bg-indigo-900/30",
    text: "text-indigo-700",
    textLight: "text-indigo-300",
    shadow: "shadow-[0_14px_24px_-14px_rgba(79,70,229,0.85)]",
    gradientFrom: "from-indigo-50",
    gradientTo: "to-purple-50",
  },
};

const SidebarLink = ({ to, icon: Icon, label, onClick, roleColor }) => {
  const colors = roleColors[roleColor] || roleColors.student;

  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300 ${
          isActive
            ? `${colors.bg} text-white ${colors.shadow}`
            : `text-zinc-600 hover:${colors.bgLight} hover:${colors.text} dark:text-zinc-300 dark:hover:${colors.bgDark} dark:hover:${colors.textLight}`
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`grid h-9 w-9 place-items-center rounded-xl transition-all ${
              isActive
                ? "bg-white/20"
                : `bg-zinc-100 text-zinc-500 group-hover:${colors.bgLight} group-hover:${colors.text} dark:bg-zinc-800 dark:text-zinc-300 dark:group-hover:${colors.bgDark}`
            }`}
          >
            <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
          </div>

          <span className="text-sm font-semibold tracking-tight">{label}</span>

          {isActive && <Bookmark size={14} className="ml-auto fill-current" />}
        </>
      )}
    </NavLink>
  );
};

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const displayName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Student";
  const roleColor = user?.role || "student";
  const colors = roleColors[roleColor] || roleColors.student;

  const navGroups = [
    {
      title: "Main Library",
      items: [
        {
          to: "/dashboard",
          icon: LayoutGrid,
          label: "Library Home",
          roles: ["admin", "student", "teacher", "librarian"],
        },
        {
          to: "/catalog",
          icon: Search,
          label: "Catalog Search",
          roles: ["student", "teacher", "librarian", "admin"],
        },
        {
          to: "/catalog/classroom-materials",
          icon: FileText,
          label: "Classroom Materials",
          roles: ["student", "teacher"],
        },
        {
          to:
            roleColor === "teacher"
              ? "/teacher/resources/manage"
              : "/librarian/catalog",
          icon: Book,
          label:
            roleColor === "teacher" ? "My Resource Desk" : "Catalog Operations",
          roles: ["teacher", "librarian"],
        },
        {
          to: "/librarian/circulation",
          icon: Repeat,
          label: "Circulation Desk",
          roles: ["librarian"],
        },
      ],
    },
    {
      title: "Reading Rooms",
      items: [
        {
          to: "/my-borrows",
          icon: Clock3,
          label: "My Borrows",
          roles: ["student", "teacher"],
        },
        {
          to: "/my-reservations",
          icon: Bookmark,
          label: "My Reservations",
          roles: ["student", "teacher"],
        },
        {
          to: "/saved-resources",
          icon: Star,
          label: "Saved Resources",
          roles: ["student", "teacher"],
        },
        {
          to: "/reading-lists",
          icon: Book,
          label: "Reading Lists",
          roles: ["student", "teacher"],
        },
        {
          to: "/exercises",
          icon: GraduationCap,
          label: "Exercises",
          roles: ["student"],
        },
        {
          to: "/catalog/videos",
          icon: Video,
          label: "Video Lessons",
          roles: ["student"],
        },
      ],
    },
    {
      title: "Collection Building",
      items: [
        {
          to: "/teacher/exercises",
          icon: GraduationCap,
          label: "Exercise Desk",
          roles: ["teacher"],
        },
        {
          to: "/librarian/register-books",
          icon: Book,
          label: "Register Books",
          roles: ["librarian"],
        },
        {
          to: "/teacher/upload-docs",
          icon: FileText,
          label: "Upload Documents",
          roles: ["teacher"],
        },
        {
          to: "/teacher/upload-videos",
          icon: Video,
          label: "Upload Videos",
          roles: ["teacher"],
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          to: "/notifications",
          icon: Bell,
          label: "Notifications",
          roles: ["student", "teacher"],
        },
        {
          to: "/profile",
          icon: UserCircle2,
          label: "My Profile",
          roles: ["student", "teacher", "librarian", "admin"],
        },
        {
          to: "/settings",
          icon: Settings,
          label: "Settings",
          roles: ["student", "teacher", "librarian", "admin"],
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          to: "/admin/users",
          icon: Users,
          label: "User Access",
          roles: ["admin"],
        },
        {
          to: "/admin/reports",
          icon: BarChart,
          label: "Analytics",
          roles: ["admin"],
        },
        {
          to: "/admin/settings",
          icon: Settings,
          label: "System Settings",
          roles: ["admin"],
        },
      ],
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[50] bg-zinc-950/45 backdrop-blur-sm md:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-[60] flex h-full w-72 flex-col border-r border-zinc-200/80 bg-white/95 px-4 py-5 backdrop-blur-xl transition-transform duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/95 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-7 flex items-center justify-between px-2">
          <button
            onClick={() => navigate("/dashboard")}
            className={`flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1 text-left transition-colors hover:${colors.bgLight} dark:hover:bg-zinc-800`}
          >
            <span
              className={`grid h-11 w-11 place-items-center rounded-2xl ${colors.bg} text-white shadow-lg ${colors.shadow.replace("shadow", "shadow")}`}
            >
              <img
                src="/logo-smart-access.svg"
                alt="SMART ACCESS logo"
                className="h-11 w-11 rounded-2xl object-cover"
              />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-serif  font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                SMART ACCESS
              </span>
              <span
                className={`block truncate text-[9px] font-black uppercase tracking-[0.18em] ${colors.text}`}
              >
                Digital Library System
              </span>
            </span>
          </button>

          <button
            onClick={toggleSidebar}
            className="rounded-xl p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="custom-scrollbar flex-1 space-y-6 overflow-y-auto pr-1 pb-6">
          {navGroups.map((group) => {
            const allowedItems = group.items.filter((item) =>
              item.roles.includes(user.role),
            );
            if (allowedItems.length === 0) return null;

            return (
              <section key={group.title} className="space-y-2">
                <p className="px-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {allowedItems.map((item) => (
                    <SidebarLink
                      key={item.to}
                      {...item}
                      roleColor={roleColor}
                      onClick={() => window.innerWidth < 768 && toggleSidebar()}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div
            className={`relative overflow-hidden rounded-3xl border border-${colors.primary}-100 bg-gradient-to-br ${colors.gradientFrom} ${colors.gradientTo} p-4 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-900`}
          >
            <div
              className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-${colors.primary}-200/50 blur-2xl dark:bg-${colors.primary}-500/10`}
            />
            <div className="relative z-10 flex items-center gap-3">
              <div
                className={`grid h-10 w-10 place-items-center rounded-xl ${colors.bgLight} ${colors.text} dark:${colors.bgDark}`}
              >
                <span className="text-sm font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {displayName}
                </p>
                <p
                  className={`truncate text-xs capitalize ${colors.textLight}`}
                >
                  {user?.role}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium ${colors.text} hover:${colors.bgLight} dark:hover:${colors.bgDark}`}
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
