import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileBarChart, Loader2, Save, Settings2 } from "lucide-react";
import { getSystemSettings, upsertSystemSetting } from "../../data/userEndPoint";
import { DEFAULT_BORROWING_POLICY } from "../../lib/systemSettings";

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { data: settings = [], isLoading, error } = useQuery({
    queryKey: ["system-settings"],
    queryFn: getSystemSettings,
  });

  const policyRecord = settings.find(
    (item) => item.settingKey === "borrowing_policy",
  );
  const [policyData, setPolicyData] = useState(DEFAULT_BORROWING_POLICY);

  useEffect(() => {
    if (policyRecord?.settingValue) {
      setPolicyData(policyRecord.settingValue);
    }
  }, [policyRecord]);

  const savePolicyMutation = useMutation({
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
                    updateRolePolicy(role, "physicalLimit", value, setPolicyData)
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
              savePolicyMutation.mutate({
                settingKey: "borrowing_policy",
                settingValue: policyData,
                description: "Role-based borrowing configuration",
              })
            }
            disabled={savePolicyMutation.isPending}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save size={16} />
            {savePolicyMutation.isPending ? "Saving..." : "Save policy"}
          </button>
          <button
            onClick={() => setPolicyData(DEFAULT_BORROWING_POLICY)}
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

function updateRolePolicy(role, field, value, setPolicyData) {
  setPolicyData((current) => ({
    ...current,
    [role]: {
      ...current[role],
      [field]: Number.parseInt(value, 10) || 0,
    },
  }));
}
