import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Bookmark,
  Clock,
  Library,
  Loader2,
  RefreshCcw,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { returnBorrow, updateReadingProgress } from "../data/resourceEndpoint";
import { getAdminSummary } from "../data/userEndPoint";
import { useLearningDashboard } from "../hooks/useResources";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role || "student";
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { dashboard, isLoading } = useLearningDashboard();
  const { data: adminSummary } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: getAdminSummary,
    enabled: role === "admin",
  });

  const returnMutation = useMutation({
    mutationFn: returnBorrow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["borrows"] });
    },
  });

  const progressMutation = useMutation({
    mutationFn: ({ resourceId, progressPercent }) =>
      updateReadingProgress(resourceId, { progressPercent }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning-dashboard"] });
    },
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading your library workspace...
        </div>
      </div>
    );
  }

  const summary = adminSummary?.data;
  const activeBorrows = dashboard?.activeBorrows || [];
  const bookmarks = dashboard?.bookmarks || [];
  const progressEntries = dashboard?.progressEntries || [];
  const recentNotifications = dashboard?.notifications || [];

  const config = {
    student: {
      tag: "Reading Room",
      accentColor: "emerald",
      metrics: [
        {
          label: "Active Borrows",
          value: activeBorrows.length,
          trend: `${bookmarks.length} saved`,
          icon: BookOpen,
          tone: "emerald",
        },
        {
          label: "Bookmarks",
          value: bookmarks.length,
          trend: "Quick access",
          icon: Bookmark,
          tone: "royal",
        },
        {
          label: "Reading Progress",
          value:
            progressEntries.length > 0
              ? `${Math.round(
                  progressEntries.reduce(
                    (sum, item) => sum + (item.progressPercent || 0),
                    0,
                  ) / progressEntries.length,
                )}%`
              : "0%",
          trend: "Across your shelf",
          icon: TrendingUp,
          tone: "amber",
        },
      ],
      primaryTitle: "Your hybrid library shelf is ready",
      primaryDesc:
        "Borrow digital books, track physical returns, and continue reading from where you stopped.",
      primaryAction: () => navigate("/catalog"),
      primaryActionLabel: "Open catalog",
    },
    teacher: {
      tag: "Teaching Collection",
      accentColor: "royal",
      metrics: [
        {
          label: "Borrowed Items",
          value: activeBorrows.length,
          trend: `${bookmarks.length} saved`,
          icon: Library,
          tone: "royal",
        },
        {
          label: "Reading Lists",
          value: dashboard?.history?.length || 0,
          trend: "Class support",
          icon: BookOpen,
          tone: "violet",
        },
        {
          label: "Recent Notices",
          value: recentNotifications.length,
          trend: "Workflow",
          icon: AlertCircle,
          tone: "amber",
        },
      ],
      primaryTitle: "Guide learning with live library data",
      primaryDesc:
        "See student-facing recommendations, manage your uploaded resources, and follow class reading progress.",
      primaryAction: () => navigate("/teacher/resources/manage"),
      primaryActionLabel: "Manage resources",
    },
    librarian: {
      tag: "Library Stewardship",
      accentColor: "violet",
      metrics: [
        {
          label: "Open Borrows",
          value: activeBorrows.length,
          trend: "Circulation",
          icon: Library,
          tone: "violet",
        },
        {
          label: "Pending Alerts",
          value: recentNotifications.filter((item) => !item.read).length,
          trend: "Unread",
          icon: AlertCircle,
          tone: "rose",
        },
      ],
      primaryTitle: "Circulation and approvals in one desk",
      primaryDesc:
        "Manage physical stock, track overdue returns, and review pending teaching materials through one workspace.",
      primaryAction: () => navigate("/librarian/catalog"),
      primaryActionLabel: "Open catalog desk",
    },
    admin: {
      tag: "Library System Overview",
      accentColor: "indigo",
      metrics: [
        {
          label: "Members",
          value: summary?.totalUsers || 0,
          trend: `${summary?.totalStudents || 0} students`,
          icon: Users,
          tone: "indigo",
        },
        {
          label: "Active Borrows",
          value: summary?.activeBorrows || 0,
          trend: `${summary?.pendingResources || 0} pending`,
          icon: Shield,
          tone: "emerald",
        },
        {
          label: "Unread Notifications",
          value: summary?.unreadNotifications || 0,
          trend: "System wide",
          icon: AlertCircle,
          tone: "amber",
        },
      ],
      primaryTitle: "The hybrid library is under control",
      primaryDesc:
        "Review approvals, borrowing activity, and policy settings across digital access and physical circulation.",
      primaryAction: () => navigate("/admin/reports"),
      primaryActionLabel: "Open admin reports",
    },
  }[role];

  const firstName = user?.firstName || "Student";

  return (
    <div className="space-y-8 md:space-y-10">
      <header className="rounded-3xl border border-zinc-200/80 bg-white/85 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/85 md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-600">
              {config.tag}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-5xl">
              Welcome back, {firstName}
            </h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Your hybrid school library workspace is synced with live borrowing
              and reading activity.
            </p>
          </div>

          <button
            onClick={config.primaryAction}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
          >
            {config.primaryActionLabel}
            <ArrowRight size={16} />
          </button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {config.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-5 flex items-center gap-2 font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            <Clock size={20} className="text-emerald-600" />
            Active Circulation
          </h3>

          <div className="space-y-3">
            {activeBorrows.length ? (
              activeBorrows.slice(0, 4).map((borrow) => (
                <article
                  key={borrow.transactionId}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-800/70 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                      {borrow.resource?.title || "Library resource"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {borrow.borrowType} borrow
                      {borrow.dueAt
                        ? ` | due ${new Date(borrow.dueAt).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {borrow.borrowType === "physical" ? (
                      <button
                        onClick={() =>
                          returnMutation.mutate(borrow.transactionId)
                        }
                        className="rounded-xl border border-zinc-200 px-3 py-2 text-xs font-bold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200"
                      >
                        Mark returned
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          progressMutation.mutate({
                            resourceId: borrow.resourceId,
                            progressPercent: 100,
                          })
                        }
                        className="rounded-xl border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-900/40 dark:text-emerald-300"
                      >
                        Complete reading
                      </button>
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
                No active borrow transactions yet. Open the catalog to borrow
                digital or physical resources.
              </div>
            )}
          </div>
        </div>

        <aside className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-7 text-white shadow-2xl shadow-emerald-900/25 md:p-8">
          <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10">
            <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
              Library Insight
            </span>
            <h3 className="mt-4 font-serif text-3xl font-bold leading-tight">
              {config.primaryTitle}
            </h3>
            <p className="mt-3 max-w-sm text-sm text-emerald-50/85">
              {config.primaryDesc}
            </p>

            <div className="mt-6 space-y-3">
              {recentNotifications.slice(0, 3).map((note) => (
                <div
                  key={note.notificationId}
                  className="rounded-2xl border border-white/15 bg-white/10 p-3 text-sm"
                >
                  <p className="font-bold">{note.title || "Library update"}</p>
                  <p className="mt-1 text-emerald-50/80">{note.message}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            <Bookmark size={18} className="text-emerald-600" />
            Saved Resources
          </h3>
          <div className="space-y-3">
            {bookmarks.length ? (
              bookmarks.slice(0, 4).map((bookmark) => (
                <div
                  key={bookmark.bookmarkId}
                  className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-800/70"
                >
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {bookmark.resource?.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {bookmark.resource?.subject || "General"}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/saved-resources")}
                    className="text-xs font-bold text-emerald-600"
                  >
                    Open
                  </button>
                </div>
              ))
            ) : (
              <EmptyPanel text="Bookmarks you save from the catalog will appear here." />
            )}
          </div>
          {bookmarks.length ? (
            <button
              onClick={() => navigate("/saved-resources")}
              className="mt-4 text-sm font-bold text-emerald-600"
            >
              View all saved resources
            </button>
          ) : null}
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            <RefreshCcw size={18} className="text-emerald-600" />
            Reading Progress
          </h3>
          <div className="space-y-3">
            {progressEntries.length ? (
              progressEntries.slice(0, 4).map((entry) => (
                <div
                  key={entry.progressId}
                  className="rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-800/70"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {entry.resource?.title}
                    </p>
                    <span className="text-sm font-bold text-emerald-600">
                      {entry.progressPercent || 0}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${entry.progressPercent || 0}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <EmptyPanel text="Reading progress updates will appear after you start tracking a resource." />
            )}
          </div>
        </div>
      </section>

      {role === "teacher" && (
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-5 flex items-center gap-2 font-serif text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            <BookOpen size={18} className="text-emerald-600" />
            Teaching Tools
          </h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <QuickActionCard
              title="Upload Video Lesson"
              description="Share recorded lessons with your students"
              action={() => navigate("/teacher/upload-videos")}
              icon={Library}
              color="emerald"
            />
            <QuickActionCard
              title="Manage Videos"
              description="Edit, preview, and organize your video collection"
              action={() => navigate("/teacher/videos/manage")}
              icon={BookOpen}
              color="sky"
            />
            <QuickActionCard
              title="Create Exercise"
              description="Build interactive quizzes for your class"
              action={() => navigate("/exercise")}
              icon={TrendingUp}
              color="violet"
            />
          </div>
        </section>
      )}
    </div>
  );
}

const toneMap = {
  emerald: {
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    trend:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  sky: {
    badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
    trend: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  },
  amber: {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    trend:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  },
  violet: {
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
    trend:
      "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  },
  rose: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
    trend: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  },
  indigo: {
    badge:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
    trend:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  },
  royal: {
    badge:
      "bg-royal-100 text-royal-700 dark:bg-royal-900/30 dark:text-royal-300",
    trend:
      "bg-royal-100 text-royal-700 dark:bg-royal-900/30 dark:text-royal-300",
  },
};

const MetricCard = ({ label, value, trend, icon: Icon, tone }) => {
  const classes = toneMap[tone] || toneMap.emerald;

  return (
    <article className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-6">
      <div
        className={`grid h-11 w-11 place-items-center rounded-xl ${classes.badge}`}
      >
        <Icon size={20} />
      </div>
      <p className="mt-4 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <h4 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {value}
        </h4>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-bold ${classes.trend}`}
        >
          {trend}
        </span>
      </div>
    </article>
  );
};

const EmptyPanel = ({ text }) => (
  <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-5 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
    {text}
  </div>
);

const QuickActionCard = ({ title, description, action, icon: Icon, color }) => {
  const colorMap = {
    emerald:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-300 dark:border-emerald-900/40 dark:hover:bg-emerald-950/30",
    sky: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 dark:bg-sky-950/20 dark:text-sky-300 dark:border-sky-900/40 dark:hover:bg-sky-950/30",
    violet:
      "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-950/20 dark:text-violet-300 dark:border-violet-900/40 dark:hover:bg-violet-950/30",
  };

  const classes = colorMap[color] || colorMap.emerald;

  return (
    <button
      onClick={action}
      className={`group rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 hover:shadow-lg ${classes}`}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/60 dark:bg-zinc-800/60">
          <Icon size={18} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
            {title}
          </h4>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};
