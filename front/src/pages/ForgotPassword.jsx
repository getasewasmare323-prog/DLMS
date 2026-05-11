import React, { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Mail, ArrowLeft } from "lucide-react";
import { forgotPassword } from "../data/userEndPoint";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const data = await forgotPassword(email);

      if (data.status === "ok") {
        setSuccess("Password reset instructions have been sent to your email.");
        setEmail("");
      } else {
        setError(data.error || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(202,138,4,0.18),_transparent_24%),linear-gradient(135deg,_#f7f4ea_0%,_#ffffff_48%,_#edf7f0_100%)] px-4 py-10 dark:bg-zinc-950">
      <div className="mx-auto grid min-h-[90vh] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden rounded-[2rem] bg-[#7c2d12] p-10 text-white shadow-2xl lg:block">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-amber-200">
            SMART ACCESS
          </p>
          <h1 className="mt-6 font-serif text-5xl font-bold leading-tight">
            Reset Your Password
          </h1>
          <p className="mt-5 max-w-xl text-base text-amber-50/85">
            Enter your email address and we'll send you instructions to reset
            your password. Make sure to check your spam folder if you don't see
            the email.
          </p>
        </section>

        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
          <div className="bg-[#1d4d2f] p-8 text-white">
            <img
              src="/logo-smart-access.svg"
              alt="SMART ACCESS logo"
              className="h-16 w-16 rounded-3xl object-cover"
            />
            <h1 className="mt-5 text-3xl font-bold">Forgot Password</h1>
            <p className="mt-2 text-sm text-emerald-50/85">
              Enter your email to receive reset instructions
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
                <Mail size={18} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                placeholder="student@school.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d4d2f] py-3 font-bold text-white transition-all hover:bg-[#163b24] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail size={19} />
              {isLoading ? "Sending..." : "Send Reset Instructions"}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
