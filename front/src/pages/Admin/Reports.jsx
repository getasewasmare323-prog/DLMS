import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookMarked,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  getBorrowingOverview,
  getAdminSummary,
  reviewResource,
} from "../../data/userEndPoint";
import { searchResources } from "../../data/resourceEndpoint";

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <div className="flex items-start justify-between rounded-2xl border border-brand-100 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
    <div>
      <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <h3 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-white">
        {value}
      </h3>
    </div>
    <div className={`rounded-2xl p-3 ${colorClass}`}>
      <Icon size={24} />
    </div>
  </div>
);

export default function Reports() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: getAdminSummary,
  });
  const { data: borrowData, isLoading: borrowLoading } = useQuery({
    queryKey: ["borrowing-overview"],
    queryFn: getBorrowingOverview,
  });
  const { data: pendingResources = [], isLoading: resourcesLoading } = useQuery(
    {
      queryKey: ["pending-resource-search"],
      queryFn: () => searchResources({ status: "pending" }),
    },
  );

  const summary = data?.data;
  const reviewMutation = useMutation({
    mutationFn: ({ resourceId, payload }) =>
      reviewResource(resourceId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pending-resource-search"] });
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
    },
  });

  if (isLoading || borrowLoading || resourcesLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading system summary...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Hybrid Library Reports
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Review approvals, circulation, and user activity across the
            library.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Resources"
          value={summary?.totalResources || 0}
          icon={BookMarked}
          colorClass="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400"
        />
        <StatCard
          label="Total Users"
          value={summary?.totalUsers || 0}
          icon={Users}
          colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          label="Active Borrows"
          value={summary?.activeBorrows || 0}
          icon={ShieldCheck}
          colorClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          label="Pending Resources"
          value={summary?.pendingResources || 0}
          icon={MessageSquare}
          colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-6 text-lg font-bold text-zinc-900 dark:text-white">
            User Roles
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Students",
                count: summary?.totalStudents || 0,
                color: "bg-emerald-500",
              },
              {
                label: "Teachers",
                count: summary?.totalTeachers || 0,
                color: "bg-blue-500",
              },
              {
                label: "Librarians",
                count: summary?.totalLibrarians || 0,
                color: "bg-amber-500",
              },
              {
                label: "Admins",
                count: summary?.totalAdmins || 0,
                color: "bg-purple-500",
              },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {item.label}
                  </span>
                  <span className="text-zinc-500">{item.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={`h-full ${item.color}`}
                    style={{
                      width: `${summary?.totalUsers ? Math.max((item.count / summary.totalUsers) * 100, 6) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-6 text-lg font-bold text-zinc-900 dark:text-white">
            Borrowing Overview
          </h3>
          <div className="space-y-5 text-sm">
            <ActivityRow label="Active" value={borrowData?.active || 0} />
            <ActivityRow label="Overdue" value={borrowData?.overdue || 0} />
            <ActivityRow label="Returned" value={borrowData?.returned || 0} />
            <ActivityRow
              label="By Type"
              value={
                (borrowData?.byType || [])
                  .map((item) => `${item.borrowType}:${item.count}`)
                  .join(" | ") || "No data"
              }
            />
          </div>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Pending Resource Approvals
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Approve or reject teacher uploads before they enter the student
                catalog.
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              {pendingResources.length} pending
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {pendingResources.length ? (
              pendingResources.map((resource) => (
                <div
                  key={resource.resourceId}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-800/60"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">
                        {resource.title}
                      </p>
                      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {resource.subject || "General"}{" "}
                        {resource.gradeLevel
                          ? `| Grade ${resource.gradeLevel}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          reviewMutation.mutate({
                            resourceId: resource.resourceId,
                            payload: { status: "approved" },
                          })
                        }
                        className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          reviewMutation.mutate({
                            resourceId: resource.resourceId,
                            payload: { status: "rejected" },
                          })
                        }
                        className="rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-600 dark:border-red-900/30 dark:text-red-400"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-5 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
                No resources are waiting for approval right now.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const ActivityRow = ({ label, value }) => (
  <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-4 dark:bg-zinc-800/50">
    <span className="font-medium text-zinc-700 dark:text-zinc-300">
      {label}
    </span>
    <span className="text-lg font-bold text-zinc-900 dark:text-white">
      {value}
    </span>
  </div>
);
