import React, { useState } from "react";
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
  generateAdminReport,
  reviewResource,
} from "../../data/userEndPoint";
import { searchResources } from "../../data/resourceEndpoint";
import { buildApiUrl } from "../../lib/api";

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

  const [reportType, setReportType] = useState("usage");
  const [userRole, setUserRole] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportResult, setReportResult] = useState(null);
  const [reportError, setReportError] = useState(null);

  const reportMutation = useMutation({
    mutationFn: (filters) => generateAdminReport(filters),
    onSuccess: (result) => {
      setReportError(null);
      setReportResult(result.data);
    },
    onError: (error) => {
      setReportResult(null);
      setReportError(error.message || "Failed to generate report");
    },
  });

  const buildReportFilters = () => {
    const filters = {
      reportType,
      startDate,
      endDate,
    };
    if (userRole) filters.userRole = userRole;
    if (resourceType) filters.resourceType = resourceType;
    if (subject) filters.subject = subject;
    if (gradeLevel) filters.gradeLevel = gradeLevel;
    return filters;
  };

  const handleGenerateReport = (event) => {
    event.preventDefault();
    reportMutation.mutate(buildReportFilters());
  };

  const handleExportCsv = async () => {
    try {
      const queryParams = new URLSearchParams({
        ...buildReportFilters(),
        format: "csv",
      }).toString();
      const response = await fetch(
        buildApiUrl(`/admin/reports/generate?${queryParams}`),
        {
          method: "GET",
          credentials: "include",
        },
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `admin-report-${reportType}-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setReportError(error.message || "Failed to download report");
    }
  };

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
            Review approvals, circulation, and user activity across the library.
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                Generate Custom Report
              </h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Choose a report type, filter by role or subject, and generate a
                summary for your admin dashboard.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Report Builder
            </span>
          </div>

          <form
            onSubmit={handleGenerateReport}
            className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            <label className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              Report Type
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="usage">Usage</option>
                <option value="performance">Performance</option>
                <option value="security">Security</option>
                <option value="curriculum">Curriculum</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              User Role
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="">All roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              Resource Type
              <select
                value={resourceType}
                onChange={(e) => setResourceType(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              >
                <option value="">All resources</option>
                <option value="video">Video</option>
                <option value="reading">Reading</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              Subject
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Math, Science, English"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            <label className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              Grade Level
              <input
                type="number"
                min="1"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="7"
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            <label className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              Start Date
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>

            <label className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
              End Date
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
              />
            </label>
          </form>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={handleGenerateReport}
              disabled={reportMutation.isLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reportMutation.isLoading ? "Generating..." : "Generate Report"}
            </button>
            <button
              onClick={handleExportCsv}
              disabled={reportMutation.isLoading}
              className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
            >
              Export as CSV
            </button>
          </div>

          {reportError ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
              {reportError}
            </div>
          ) : null}

          {reportResult ? (
            <div className="mt-6 rounded-3xl border border-zinc-200 bg-slate-50 p-6 dark:border-zinc-700 dark:bg-zinc-950">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                    {reportResult.reportType} report
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white">
                    Report summary
                  </h3>
                </div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {reportResult.filters.startDate ||
                  reportResult.filters.endDate
                    ? `${reportResult.filters.startDate || "Any date"} → ${reportResult.filters.endDate || "Any date"}`
                    : "Date range: all time"}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {Object.entries(reportResult.report || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </p>
                      {Array.isArray(value) ? (
                        <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {value.length ? (
                            value.map((item, index) => (
                              <li key={index}>
                                {typeof item === "object"
                                  ? JSON.stringify(item)
                                  : item}
                              </li>
                            ))
                          ) : (
                            <li className="text-zinc-400">No results</li>
                          )}
                        </ul>
                      ) : typeof value === "object" && value !== null ? (
                        <div className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {Object.entries(value).map(([subKey, subValue]) => (
                            <div
                              key={subKey}
                              className="flex justify-between gap-3"
                            >
                              <span>{subKey.replace(/([A-Z])/g, " $1")}</span>
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {subValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                          {String(value)}
                        </p>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}
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
