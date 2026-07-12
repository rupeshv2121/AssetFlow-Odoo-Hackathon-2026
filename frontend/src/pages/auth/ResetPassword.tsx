import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Boxes } from "lucide-react";
import * as authService from "@/services/authService";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/login", { replace: true }), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-sky-50 via-white to-white px-4">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-indigo-200/50 blur-3xl" />

      <Link
        to="/"
        aria-label="Back to home"
        className="fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-md bg-white/60 px-3 py-2 text-sm text-gray-700 shadow-md backdrop-blur-md hover:bg-white hover:text-sky-700"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back</span>
      </Link>

      <div className="relative w-full max-w-sm rounded-2xl border border-sky-100/60 bg-white/90 p-8 shadow-xl shadow-sky-100/60 backdrop-blur-md">
        <div className="mb-4 flex justify-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm">
            <Boxes size={18} />
          </span>
        </div>

        <h1 className="text-center text-xl font-bold text-gray-900">Set a new password</h1>

        {!token ? (
          <div className="mt-6 space-y-3 text-center">
            <p className="text-sm text-red-600">This link is missing a reset token.</p>
            <Link to="/forgot-password" className="text-sm font-semibold text-sky-700 hover:text-sky-800 hover:underline">
              Request a new link
            </Link>
          </div>
        ) : success ? (
          <p className="mt-6 text-center text-sm text-gray-700">
            Password reset. Redirecting you to sign in...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">New password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Resetting..." : "Reset password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
