import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  FileBarChart,
  Loader2,
  Save,
  Settings2,
  Building,
  Calendar,
  Clock,
  Bell,
  DollarSign,
  CheckCircle,
  Globe,
} from "lucide-react";
import {
  getSystemSettings,
  upsertSystemSetting,
} from "../../data/userEndPoint";
import {
  DEFAULT_BORROWING_POLICY,
  DEFAULT_SCHOOL_INFO,
  DEFAULT_ACADEMIC_SETTINGS,
  DEFAULT_LIBRARY_HOURS,
  DEFAULT_NOTIFICATION_SETTINGS,
  DEFAULT_FINE_SETTINGS,
  DEFAULT_APPROVAL_WORKFLOW,
  DEFAULT_LOCALIZATION_SETTINGS,
} from "../../lib/systemSettings";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const {
    data: settings = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["system-settings"],
    queryFn: getSystemSettings,
  });

  const policyRecord = settings.find(
    (item) => item.settingKey === "borrowing_policy",
  );
  const [policyData, setPolicyData] = useState(DEFAULT_BORROWING_POLICY);
  const [schoolInfo, setSchoolInfo] = useState(DEFAULT_SCHOOL_INFO);
  const [academicSettings, setAcademicSettings] = useState(
    DEFAULT_ACADEMIC_SETTINGS,
  );
  const [libraryHours, setLibraryHours] = useState(DEFAULT_LIBRARY_HOURS);
  const [notificationSettings, setNotificationSettings] = useState(
    DEFAULT_NOTIFICATION_SETTINGS,
  );
  const [fineSettings, setFineSettings] = useState(DEFAULT_FINE_SETTINGS);
  const [approvalWorkflow, setApprovalWorkflow] = useState(
    DEFAULT_APPROVAL_WORKFLOW,
  );
  const [localizationSettings, setLocalizationSettings] = useState(
    DEFAULT_LOCALIZATION_SETTINGS,
  );

  useEffect(() => {
    if (policyRecord?.settingValue) {
      setPolicyData(policyRecord.settingValue);
    }

    const schoolRecord = settings.find(
      (item) => item.settingKey === "school_info",
    );
    if (schoolRecord?.settingValue) {
      setSchoolInfo(schoolRecord.settingValue);
    }

    const academicRecord = settings.find(
      (item) => item.settingKey === "academic_settings",
    );
    if (academicRecord?.settingValue) {
      setAcademicSettings(academicRecord.settingValue);
    }

    const hoursRecord = settings.find(
      (item) => item.settingKey === "library_hours",
    );
    if (hoursRecord?.settingValue) {
      setLibraryHours(hoursRecord.settingValue);
    }

    const notificationRecord = settings.find(
      (item) => item.settingKey === "notification_settings",
    );
    if (notificationRecord?.settingValue) {
      setNotificationSettings({
        ...DEFAULT_NOTIFICATION_SETTINGS,
        ...notificationRecord.settingValue,
      });
    }

    const fineRecord = settings.find(
      (item) => item.settingKey === "fine_settings",
    );
    if (fineRecord?.settingValue) {
      setFineSettings(fineRecord.settingValue);
    }

    const approvalRecord = settings.find(
      (item) => item.settingKey === "approval_workflow",
    );
    if (approvalRecord?.settingValue) {
      setApprovalWorkflow(approvalRecord.settingValue);
    }

    const localizationRecord = settings.find(
      (item) => item.settingKey === "localization_settings",
    );
    if (localizationRecord?.settingValue) {
      setLocalizationSettings(localizationRecord.settingValue);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: upsertSystemSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <Loader2 className="mx-auto mb-3 animate-spin" size={30} />
          Loading system settings...
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
      <header className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30">
            <Settings2 size={30} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-600">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
              System Settings
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              Manage borrowing rules and platform-wide library policy values.
            </p>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            <FileBarChart size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Borrowing Policy
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Configure circulation limits and borrowing periods by role.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {Object.entries(policyData).map(([role, limits]) => (
            <div
              key={role}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-lg bg-emerald-100 px-3 py-1 text-sm font-semibold capitalize text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {role}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SettingNumberField
                  label="Digital Limit"
                  value={limits.digitalLimit}
                  onChange={(value) =>
                    updateRolePolicy(role, "digitalLimit", value, setPolicyData)
                  }
                />
                <SettingNumberField
                  label="Physical Limit"
                  value={limits.physicalLimit}
                  onChange={(value) =>
                    updateRolePolicy(
                      role,
                      "physicalLimit",
                      value,
                      setPolicyData,
                    )
                  }
                />
                <SettingNumberField
                  label="Digital Days"
                  value={limits.digitalDays}
                  onChange={(value) =>
                    updateRolePolicy(role, "digitalDays", value, setPolicyData)
                  }
                />
                <SettingNumberField
                  label="Physical Days"
                  value={limits.physicalDays}
                  onChange={(value) =>
                    updateRolePolicy(role, "physicalDays", value, setPolicyData)
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() =>
              saveMutation.mutate({
                settingKey: "borrowing_policy",
                settingValue: policyData,
                description: "Role-based borrowing configuration",
              })
            }
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending ? "Saving..." : "Save policy"}
          </button>
          <button
            onClick={() => setPolicyData(DEFAULT_BORROWING_POLICY)}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      {/* School Information Settings */}
      <section className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Building size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              School Information
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Configure school details and contact information.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <SettingTextField
            label="School Name"
            value={schoolInfo.schoolName}
            onChange={(value) =>
              setSchoolInfo((prev) => ({ ...prev, schoolName: value }))
            }
          />
          <SettingTextField
            label="School Address"
            value={schoolInfo.schoolAddress}
            onChange={(value) =>
              setSchoolInfo((prev) => ({ ...prev, schoolAddress: value }))
            }
          />
          <SettingTextField
            label="School Phone"
            value={schoolInfo.schoolPhone}
            onChange={(value) =>
              setSchoolInfo((prev) => ({ ...prev, schoolPhone: value }))
            }
          />
          <SettingTextField
            label="School Email"
            value={schoolInfo.schoolEmail}
            onChange={(value) =>
              setSchoolInfo((prev) => ({ ...prev, schoolEmail: value }))
            }
          />
          <SettingTextField
            label="Principal Name"
            value={schoolInfo.principalName}
            onChange={(value) =>
              setSchoolInfo((prev) => ({ ...prev, principalName: value }))
            }
          />
          <SettingTextField
            label="Librarian Name"
            value={schoolInfo.librarianName}
            onChange={(value) =>
              setSchoolInfo((prev) => ({ ...prev, librarianName: value }))
            }
          />
          <SettingTextField
            label="Website"
            value={schoolInfo.website}
            onChange={(value) =>
              setSchoolInfo((prev) => ({ ...prev, website: value }))
            }
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() =>
              saveMutation.mutate({
                settingKey: "school_info",
                settingValue: schoolInfo,
                description: "School contact and information details",
              })
            }
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending ? "Saving..." : "Save school info"}
          </button>
          <button
            onClick={() => setSchoolInfo(DEFAULT_SCHOOL_INFO)}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      {/* Academic Settings */}
      <section className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-purple-100 p-3 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            <Calendar size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Academic Settings
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Configure academic year, grade levels, and curriculum subjects.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <SettingTextField
            label="Current Academic Year"
            value={academicSettings.currentAcademicYear}
            onChange={(value) =>
              setAcademicSettings((prev) => ({
                ...prev,
                currentAcademicYear: value,
              }))
            }
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Current Semester
            </label>
            <select
              value={academicSettings.semester}
              onChange={(e) =>
                setAcademicSettings((prev) => ({
                  ...prev,
                  semester: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            >
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Grade Levels
            </label>
            <input
              type="text"
              value={academicSettings.gradeLevels.join(", ")}
              onChange={(e) => {
                const grades = e.target.value
                  .split(",")
                  .map((g) => parseInt(g.trim()))
                  .filter((g) => !isNaN(g));
                setAcademicSettings((prev) => ({
                  ...prev,
                  gradeLevels: grades,
                }));
              }}
              placeholder="9, 10, 11, 12"
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Subjects (comma-separated)
            </label>
            <textarea
              value={academicSettings.subjects.join(", ")}
              onChange={(e) => {
                const subjects = e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s);
                setAcademicSettings((prev) => ({ ...prev, subjects }));
              }}
              rows={3}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() =>
              saveMutation.mutate({
                settingKey: "academic_settings",
                settingValue: academicSettings,
                description: "Academic year and curriculum configuration",
              })
            }
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-5 py-3 text-sm font-bold text-white hover:bg-purple-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending ? "Saving..." : "Save academic settings"}
          </button>
          <button
            onClick={() => setAcademicSettings(DEFAULT_ACADEMIC_SETTINGS)}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      {/* Library Hours */}
      <section className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-orange-100 p-3 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
            <Clock size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Library Hours
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Set operating hours for each day of the week.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {Object.entries(libraryHours).map(([day, hours]) => (
            <div
              key={day}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize text-zinc-900 dark:text-white">
                  {day}
                </span>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hours.closed}
                    onChange={(e) =>
                      setLibraryHours((prev) => ({
                        ...prev,
                        [day]: { ...prev[day], closed: e.target.checked },
                      }))
                    }
                    className="rounded border-zinc-300 dark:border-zinc-600"
                  />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    Closed
                  </span>
                </label>
              </div>
              {!hours.closed && (
                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      value={hours.open}
                      onChange={(e) =>
                        setLibraryHours((prev) => ({
                          ...prev,
                          [day]: { ...prev[day], open: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      value={hours.close}
                      onChange={(e) =>
                        setLibraryHours((prev) => ({
                          ...prev,
                          [day]: { ...prev[day], close: e.target.value },
                        }))
                      }
                      className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() =>
              saveMutation.mutate({
                settingKey: "library_hours",
                settingValue: libraryHours,
                description: "Library operating hours configuration",
              })
            }
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending ? "Saving..." : "Save library hours"}
          </button>
          <button
            onClick={() => setLibraryHours(DEFAULT_LIBRARY_HOURS)}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      {/* Notification Settings */}
      <section className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-green-100 p-3 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <Bell size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Notification Settings
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Configure email notifications and automated reminders.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {Object.entries(notificationSettings).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div>
                <span className="font-medium text-zinc-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                </span>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {key === "emailNotifications" &&
                    "Send email notifications for system events"}
                  {key === "newResourceNotifications" &&
                    "Notify users about new resources"}
                  {key === "overdueReminders" &&
                    "Send reminders for overdue books"}
                  {key === "returnReminders" &&
                    "Send reminders before due dates"}
                  {key === "exerciseNotifications" &&
                    "Send email announcements for teacher exercises"}
                  {key === "weeklyReports" && "Send weekly usage reports"}
                  {key === "monthlyReports" && "Send monthly usage reports"}
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setNotificationSettings((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:bg-gray-700 dark:border-gray-600 dark:peer-focus:ring-green-800"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() =>
              saveMutation.mutate({
                settingKey: "notification_settings",
                settingValue: notificationSettings,
                description: "Email notification preferences",
              })
            }
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-green-600 px-5 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending
              ? "Saving..."
              : "Save notification settings"}
          </button>
          <button
            onClick={() =>
              setNotificationSettings(DEFAULT_NOTIFICATION_SETTINGS)
            }
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      {/* Fine Settings */}
      <section className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-red-100 p-3 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            <DollarSign size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Fine & Penalty Settings
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Configure overdue fines and penalty policies.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <SettingNumberField
            label="Daily Overdue Fine (ETB)"
            value={fineSettings.dailyOverdueFine}
            onChange={(value) =>
              setFineSettings((prev) => ({ ...prev, dailyOverdueFine: value }))
            }
          />
          <SettingNumberField
            label="Maximum Fine Amount (ETB)"
            value={fineSettings.maxOverdueFine}
            onChange={(value) =>
              setFineSettings((prev) => ({ ...prev, maxOverdueFine: value }))
            }
          />
          <SettingNumberField
            label="Grace Period (Days)"
            value={fineSettings.gracePeriodDays}
            onChange={(value) =>
              setFineSettings((prev) => ({ ...prev, gracePeriodDays: value }))
            }
          />
          <SettingNumberField
            label="Fine Waiver Threshold (ETB)"
            value={fineSettings.fineWaiverThreshold}
            onChange={(value) =>
              setFineSettings((prev) => ({
                ...prev,
                fineWaiverThreshold: value,
              }))
            }
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() =>
              saveMutation.mutate({
                settingKey: "fine_settings",
                settingValue: fineSettings,
                description: "Overdue fine and penalty configuration",
              })
            }
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending ? "Saving..." : "Save fine settings"}
          </button>
          <button
            onClick={() => setFineSettings(DEFAULT_FINE_SETTINGS)}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      {/* Approval Workflow */}
      <section className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
            <CheckCircle size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Approval Workflow
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Configure resource approval requirements and automated workflows.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {Object.entries(approvalWorkflow).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div>
                <span className="font-medium text-zinc-900 dark:text-white capitalize">
                  {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                </span>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {key === "teacherUploadsRequireApproval" &&
                    "Require admin approval for teacher uploads"}
                  {key === "librarianUploadsRequireApproval" &&
                    "Require admin approval for librarian uploads"}
                  {key === "autoApproveTextbooks" &&
                    "Automatically approve textbook uploads"}
                  {key === "autoApproveVideos" &&
                    "Automatically approve video uploads"}
                  {key === "requireSubjectAlignment" &&
                    "Require resources to align with curriculum subjects"}
                  {key === "requireGradeLevelMatch" &&
                    "Require resources to match appropriate grade levels"}
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    setApprovalWorkflow((prev) => ({
                      ...prev,
                      [key]: e.target.checked,
                    }))
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:bg-gray-700 dark:border-gray-600 dark:peer-focus:ring-indigo-800"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() =>
              saveMutation.mutate({
                settingKey: "approval_workflow",
                settingValue: approvalWorkflow,
                description: "Resource approval and workflow configuration",
              })
            }
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending ? "Saving..." : "Save approval settings"}
          </button>
          <button
            onClick={() => setApprovalWorkflow(DEFAULT_APPROVAL_WORKFLOW)}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Reset to defaults
          </button>
        </div>
      </section>

      {/* Localization Settings */}
      <section className="rounded-2xl border border-brand-100 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-teal-100 p-3 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
            <Globe size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              Localization Settings
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Configure language, date format, and regional preferences.
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Primary Language
            </label>
            <select
              value={localizationSettings.primaryLanguage}
              onChange={(e) =>
                setLocalizationSettings((prev) => ({
                  ...prev,
                  primaryLanguage: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
            >
              <option value="en">English</option>
              <option value="am">አማርኛ (Amharic)</option>
            </select>
          </div>
          <SettingTextField
            label="Date Format"
            value={localizationSettings.dateFormat}
            onChange={(value) =>
              setLocalizationSettings((prev) => ({
                ...prev,
                dateFormat: value,
              }))
            }
          />
          <SettingTextField
            label="Currency"
            value={localizationSettings.currency}
            onChange={(value) =>
              setLocalizationSettings((prev) => ({ ...prev, currency: value }))
            }
          />
          <SettingTextField
            label="Timezone"
            value={localizationSettings.timezone}
            onChange={(value) =>
              setLocalizationSettings((prev) => ({ ...prev, timezone: value }))
            }
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            onClick={() =>
              saveMutation.mutate({
                settingKey: "localization_settings",
                settingValue: localizationSettings,
                description: "Language and regional configuration",
              })
            }
            disabled={saveMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saveMutation.isPending
              ? "Saving..."
              : "Save localization settings"}
          </button>
          <button
            onClick={() =>
              setLocalizationSettings(DEFAULT_LOCALIZATION_SETTINGS)
            }
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Reset to defaults
          </button>
        </div>
      </section>
    </div>
  );
}

function SettingNumberField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
      />
    </div>
  );
}

function SettingTextField({ label, value, onChange }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-600 dark:bg-zinc-700 dark:text-white"
      />
    </div>
  );
}

function updateRolePolicy(role, field, value, setPolicyData) {
  setPolicyData((current) => ({
    ...current,
    [role]: {
      ...current[role],
      [field]: Number.parseInt(value, 10) || 0,
    },
  }));
}
