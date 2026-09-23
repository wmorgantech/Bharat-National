import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Button from "../components/Button";
import { User, Lock, Eye, EyeOff, ShieldCheck, LayoutDashboard, Package } from "lucide-react";
import { loginAdmin } from "../api/admin";
import { setTokens } from "../api/http";
import Input from "../components/Input";

const HIGHLIGHTS = [
  { Icon: LayoutDashboard, label: "Orders, customers and enquiries in one place" },
  { Icon: Package, label: "Full catalogue control for products and brands" },
  { Icon: ShieldCheck, label: "Role-protected admin access" },
];

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return toast.error("Fix form errors");

    try {
      setLoading(true);

      const data = await loginAdmin(email, password);

      // Store the access token; the refresh token is an HttpOnly cookie
      if (data.access_token) {
        setTokens(data.access_token);
      }
      localStorage.setItem("admin", JSON.stringify(data.admin));
      localStorage.setItem("isAdminLoggedIn", "true");

      toast.success("Login successful!");

      setTimeout(() => navigate("/admin/"), 500);
      window.location.reload();

    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-4xl grid lg:grid-cols-[0.9fr,1fr] rounded-3xl overflow-hidden shadow-lift bg-white border border-ink-100">
        {/* ---- Brand panel (desktop only) ---- */}
        <aside className="relative hidden lg:flex flex-col justify-between p-10 text-white overflow-hidden bg-ink-900">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(60% 80% at 15% 0%, rgba(38,166,154,0.22) 0%, transparent 60%), radial-gradient(50% 70% at 100% 100%, rgba(0,137,123,0.18) 0%, transparent 60%)",
            }}
          />

          <div className="relative">
            <span className="grid place-items-center h-12 w-12 rounded-2xl bg-primary text-white font-bold shadow-glow">
              B
            </span>
            <h1 className="mt-7 text-[26px] font-semibold leading-tight tracking-tight">
              Bharat National Computers
            </h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-light">
              Admin Panel
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Sign in to manage the storefront catalogue, orders and customer
              enquiries.
            </p>
          </div>

          <ul className="relative mt-10 space-y-4">
            {HIGHLIGHTS.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-3 text-sm text-white/75"
              >
                <span className="grid place-items-center h-8 w-8 shrink-0 rounded-lg bg-white/10 text-primary-light">
                  <item.Icon size={15} />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </aside>

        {/* ---- Form panel ---- */}
        <div className="p-8 sm:p-10 lg:p-12">
          {/* Mobile-only brand mark */}
          <div className="lg:hidden flex justify-center mb-7">
            <span className="grid place-items-center h-14 w-14 rounded-2xl bg-primary text-white text-xl font-bold shadow-glow">
              B
            </span>
          </div>

          <div className="text-center lg:text-left">
            <span className="eyebrow">Sign in</span>
            <h2 className="mt-3 text-2xl sm:text-[28px] font-semibold tracking-tight text-ink-900">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              Enter your credentials to access the dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <Input
              name="email"
              label="Email Address"
              placeholder="admin@example.com"
              type="email"
              icon={<User size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="username"
            />

            <Input
              name="password"
              label="Password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              icon={<Lock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
              showToggle
              toggleState={showPassword}
              onToggle={() => setShowPassword((s) => !s)}
              toggleIconOn={<EyeOff size={18} />}
              toggleIconOff={<Eye size={18} />}
            />

            <Button type="submit" full size="lg" loading={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-8 pt-6 border-t border-ink-100 text-center lg:text-left text-[11px] text-ink-500">
            Protected area. Access is restricted to authorised administrators.
          </p>
        </div>
      </div>
    </div>
  );
}
