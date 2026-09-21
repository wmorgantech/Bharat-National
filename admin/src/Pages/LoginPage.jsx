import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import Button from "../components/Button";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { loginAdmin } from "../api/admin";
import Input from "../components/Input";

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

      // Store token and admin data
      if (data.access_token) {
        localStorage.setItem("authToken", data.access_token);
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-center text-2xl font-bold text-gray-800">
          Admin Login
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            name="email"
            placeholder="Email"
            type="email"
            icon={<User size={18} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <Input
            name="password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            icon={<Lock size={18} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            showToggle
            toggleState={showPassword}
            onToggle={() => setShowPassword((s) => !s)}
            toggleIconOn={<EyeOff size={18} />}
            toggleIconOff={<Eye size={18} />}
          />

          <Button type="submit" full disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}