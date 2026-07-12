import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Boxes, ShieldCheck, Repeat2, BarChart3 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const FEATURES = [
  { icon: ShieldCheck, text: "Role-based access across every workflow" },
  { icon: Repeat2, text: "Conflict-free allocations, transfers & bookings" },
  { icon: BarChart3, text: "Real-time visibility with full audit trails" },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      const redirectTo = (location.state as { from?: string })?.from || "/dashboard";
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-700 to-sky-900 px-10 py-12 text-white lg:flex">
        <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

        <Link to="/" className="relative flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
            <Boxes size={18} />
          </span>
          <span className="text-lg font-bold text-white">AssetFlow</span>
        </Link>

        <div className="relative max-w-sm">
          <h2 className="text-3xl font-extrabold leading-tight">
            Welcome back to your asset command center
          </h2>
          <p className="mt-3 text-sm text-sky-100">
            Sign in to track, allocate, and maintain every asset your organization relies on.
          </p>

          <ul className="mt-8 space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon size={16} />
                </span>
                <span className="text-sm text-sky-50">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs font-medium text-sky-200">
          Built for the Odoo Hackathon &middot; Enterprise Asset Management
        </p>
      </div>

      {/* Form panel */}
      <div className="relative flex w-full flex-col items-center justify-center bg-white px-6 py-12 lg:w-1/2">
        <Link
          to="/"
          aria-label="Back to home"
          className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-sky-700 lg:left-8 lg:top-8"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-700 text-white shadow-sm">
                <Boxes size={18} />
              </span>
              <span className="text-lg font-bold text-gray-900">AssetFlow</span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Sign in to your account</h1>
          <p className="mt-1.5 text-sm text-gray-500">Enter your credentials to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-sky-700 hover:text-sky-800 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 transition-colors hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            New here?{" "}
            <Link to="/signup" className="font-semibold text-sky-700 hover:text-sky-800 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
