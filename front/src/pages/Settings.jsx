import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, LockKeyhole, MoonStar, Save, Settings2, SunMedium } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getSystemSettings,
  upsertSystemSetting,
  updateMyPassword,
} from "../data/userEndPoint";
import { DEFAULT_BORROWING_POLICY } from "../lib/systemSettings";

export default function Settings() {
  const queryClient = useQueryClient();
  const { user, isDarkMode, toggleDarkMode } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordFeedback, setPasswordFeedback] = useState({ type: "", message: "" });
  const [policyData, setPolicyData] = useState(DEFAULT_BORROWING_POLICY);

  const isAdmin = user?.role === "admin";
  const { data: settings = [] } = useQuery({
    queryKey: ["system-settings"],
    queryFn: getSystemSettings,
    enabled: isAdmin,
  });

  const policyRecord = settings.find((item) => item.settingKey === "borrowing_policy");

  useEffect(() => {
    if (policyRecord?.settingValue) {
      setPolicyData(policyRecord.settingValue);
    }
  }, [policyRecord]);

  const passwordMutation = useMutation({
    mutationFn: updateMyPassword,
    onSuccess: () => {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordFeedback({
        type: "success",
        message: "Password updated successfully.",
      });
    },
    onError: (error) => {
      setPasswordFeedback({ type: "error", message: error.message });
    },
  });

  const settingsMutation = useMutation({
    mutationFn: upsertSystemSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordFeedback({ type: "error", message: "New passwords do not match." });
      return;
    }

    setPasswordFeedback({ type: "", message: "" });
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/25">
            <Settings2 size={30} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Settings
            </h1>
            <p className="mt-1 text-zinc-500 dark:text-zinc-400">
              Manage account security, display preferences, and system policies where your role allows it.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card
            icon={isDarkMode ? MoonStar : SunMedium}
            title="Appearance"
            description="Switch the library workspace between light and dark display modes."
          >
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white dark:bg-white dark:text-zinc-900"
            >
              {isDarkMode ? <SunMedium size={16} /> : <MoonStar size={16} />}
              Use {isDarkMode ? "light" : "dark"} mode
            </button>
          </Card>

          <Card
            icon={Bell}
            title="Notifications"
            description="New uploads, approvals, and circulation updates will continue to appear from the top bar across the app."
          >
            <div className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              Notification delivery is currently enabled for your account.
            </div>
          </Card>
        </div>

        <Card
          icon={LockKeyhole}
          title="Security"
          description="Change your password without leaving the dashboard."
        >
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <PasswordField
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(value) =>
                setPasswordForm((current) => ({ ...current, currentPassword: value }))
              }
            />
            <PasswordField
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(value) =>
                setPasswordForm((current) => ({ ...current, newPassword: value }))
              }
            />
            <PasswordField
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(value) =>
                setPasswordForm((current) => ({ ...current, confirmPassword: value }))
              }
            />

            {passwordFeedback.message ? (
              <div
                className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                  passwordFeedback.type === "success"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                }`}
              >
                {passwordFeedback.message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save size={16} />
              {passwordMutation.isPending ? "Updating..." : "Update password"}
            </button>
          </form>
        </Card>
      </section>

      {isAdmin ? (
        <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                System Borrowing Policy
              </h2>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                These rules apply across digital access and physical circulation.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {Object.entries(policyData).map(([role, limits]) => (
              <div
                key={role}
                className="rounded-3xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700 dark:bg-zinc-800/70"
              >
                <div className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-emerald-600">
                  {role}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <PolicyField
                    label="Digital Limit"
                    value={limits.digitalLimit}
                    onChange={(value) =>
                      updateRolePolicy(role, "digitalLimit", value, setPolicyData)
                    }
                  />
                  <PolicyField
                    label="Physical Limit"
                    value={limits.physicalLimit}
                    onChange={(value) =>
                      updateRolePolicy(role, "physicalLimit", value, setPolicyData)
                    }
                  />
                  <PolicyField
                    label="Digital Days"
                    value={limits.digitalDays}
                    onChange={(value) =>
                      updateRolePolicy(role, "digitalDays", value, setPolicyData)
                    }
                  />
                  <PolicyField
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

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() =>
                settingsMutation.mutate({
                  settingKey: "borrowing_policy",
                  settingValue: policyData,
                  description: "Role-based borrowing configuration",
                })
              }
              disabled={settingsMutation.isPending}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Save size={16} />
              {settingsMutation.isPending ? "Saving..." : "Save policy"}
            </button>
            <button
              type="button"
              onClick={() => setPolicyData(DEFAULT_BORROWING_POLICY)}
              className="rounded-2xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Reset defaults
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Card({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-[2rem] border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-5 flex items-start gap-4">
        <div className="rounded-2xl bg-zinc-100 p-3 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <Icon size={22} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function PasswordField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-200">
        {label}
      </span>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
    </label>
  );
}

function PolicyField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
      />
    </label>
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
