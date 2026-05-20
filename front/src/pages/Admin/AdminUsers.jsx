import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { DeleteIcon, Shield, User } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { deleteUser, updateUserRole } from "../../data/userEndPoint";
import { useAllUsers } from "../../hooks/useResources";

const roleOptions = ["student", "teacher", "librarian", "admin"];

export default function AdminUsers() {
  const navigate = useNavigate();
  const { data, error, isLoading } = useAllUsers();
  const queryClient = useQueryClient();
  const users = useMemo(() => data?.data?.users || [], [data]);
  const [drafts, setDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const handleRoleChange = (userId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [userId]: {
        role: current[userId]?.role ?? users.find((item) => item.userId === userId)?.role,
        classLevel:
          current[userId]?.classLevel ??
          users.find((item) => item.userId === userId)?.classLevel ??
          "",
        [field]: value,
      },
    }));
  };

  const handleSave = async (userId) => {
    const draft = drafts[userId];
    if (!draft) return;

    setSavingId(userId);
    const response = await updateUserRole(userId, {
      role: draft.role,
      classLevel: draft.role === "student" ? draft.classLevel || null : null,
    });
    setSavingId(null);

    if (response.status === "success") {
      toast.success("User access updated.");
      setDrafts((current) => {
        const next = { ...current };
        delete next[userId];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
      return;
    }

    toast.error(response.error || "Could not update user access.");
  };

  const handleDelete = async (event, userId) => {
    event.preventDefault();
    const isConfirmed = window.confirm("Are you sure you want to delete this user?");
    if (!isConfirmed) return;

    const result = await deleteUser(userId);
    if (result.status === "ok") {
      toast.success("User successfully deleted.");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
      return;
    }

    toast.error("Could not delete user.");
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[50vh] place-items-center rounded-[2rem] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="text-zinc-500 dark:text-zinc-400">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        {error.message || "Failed to load users"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toaster />
      <div className="flex items-center justify-between rounded-2xl border border-brand-100 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            User Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Change roles, assign student grades, and manage library access.
          </p>
        </div>
        <div className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          {users.length} users
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Name
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Role
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Grade
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Save
              </th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.map((u) => {
              const draft = drafts[u.userId] || {};
              const selectedRole = draft.role ?? u.role;
              const selectedGrade = draft.classLevel ?? u.classLevel ?? "";
              const isDirty =
                selectedRole !== u.role ||
                String(selectedGrade || "") !== String(u.classLevel || "");

              return (
                <tr
                  key={u.userId}
                  className="transition-colors hover:bg-brand-50/20 dark:hover:bg-zinc-800/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-zinc-800 dark:text-brand-400">
                        {u.role === "admin" ? <Shield size={18} /> : <User size={18} />}
                      </div>
                      <span className="font-semibold text-zinc-900 dark:text-white">
                        <button
                          onClick={() => navigate(`/admin/users/${u.userId}`)}
                          className="text-left hover:text-emerald-600"
                        >
                          {[u.firstName, u.lastName].filter(Boolean).join(" ")}
                        </button>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                    {u.email}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={selectedRole}
                      onChange={(e) =>
                        handleRoleChange(u.userId, "role", e.target.value)
                      }
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-emerald-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="number"
                      min="9"
                      max="12"
                      disabled={selectedRole !== "student"}
                      value={selectedRole === "student" ? selectedGrade : ""}
                      onChange={(e) =>
                        handleRoleChange(u.userId, "classLevel", e.target.value)
                      }
                      placeholder={selectedRole === "student" ? "9-12" : "-"}
                      className="w-24 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 outline-none focus:border-emerald-400 disabled:cursor-not-allowed disabled:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:disabled:bg-zinc-800/60"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleSave(u.userId)}
                      disabled={!isDirty || savingId === u.userId}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:disabled:bg-zinc-700"
                    >
                      {savingId === u.userId ? "Saving..." : "Save"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      onClick={(e) => handleDelete(e, u.userId)}
                    >
                      <DeleteIcon size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
