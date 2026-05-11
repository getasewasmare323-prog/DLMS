import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, Lock, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../data/userEndPoint";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (!tokenParam) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const data = await resetPassword(token, password);

      if (data.status === "ok") {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(202,138,4,0.18),_transparent_24%),linear-gradient(135deg,_#f7f4ea_0%,_#ffffff_48%,_#edf7f0_100%)] px-4 py-10 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(202,138,4,0.18),_transparent_24%),linear-gradient(135deg,_#f7f4ea_0%,_#ffffff_48%,_#edf7f0_100%)] px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto grid min-h-[90vh] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden rounded-[2rem] bg-[#7c2d12] p-10 text-white shadow-2xl lg:block">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-amber-200">
            SMART ACCESS
          </p>
          <h1 className="mt-6 font-serif text-5xl font-bold leading-tight">
            Set New Password
          </h1>
          <p className="mt-5 max-w-xl text-base text-amber-50/85">
            Choose a strong password for your account. Make sure it's at least 6
            characters long and contains a mix of letters, numbers, and symbols
            for better security.
          </p>
        </section>

        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="bg-[#1d4d2f] p-8 text-white">
            <img
              src="/logo-smart-access.svg"
              alt="SMART ACCESS logo"
              className="h-16 w-16 rounded-3xl object-cover"
            />
            <h1 className="mt-5 text-3xl font-bold">Reset Password</h1>
            <p className="mt-2 text-sm text-emerald-50/85">
              Enter your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-8">
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950/20 dark:text-green-400">
                <Lock size={18} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-12 outline-none transition-all focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-12 outline-none transition-all focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4d2f] py-3 font-bold text-white transition-all hover:bg-[#163b24] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock size={19} />
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
