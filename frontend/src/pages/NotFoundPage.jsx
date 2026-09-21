// src/pages/NotFoundPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ArrowLeft,
  Search,
  ShoppingBag,
  AlertTriangle,
  Compass,
  MapPin,
  Star,
  Sparkles,
  Zap,
  Package,
  Users,
  Settings,
  HelpCircle,
} from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setGlowPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const suggestions = [
    { icon: Home, label: "Go to Home", path: "/", color: "from-emerald-500 to-teal-500" },
    { icon: ShoppingBag, label: "Browse Products", path: "/products", color: "from-blue-500 to-indigo-500" },
    { icon: Search, label: "Search Products", path: "/products", color: "from-purple-500 to-pink-500" },
    { icon: Compass, label: "Explore Categories", path: "/categories", color: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              backgroundColor: `rgba(16, 185, 129, ${Math.random() * 0.3 + 0.1})`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse delay-2000" />

      {/* Mouse Follow Glow */}
      <div
        className="fixed pointer-events-none w-96 h-96 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-3xl transition-all duration-300 ease-out z-0"
        style={{
          transform: `translate(${glowPosition.x - 192}px, ${glowPosition.y - 192}px)`,
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="max-w-4xl w-full">
          {/* 404 Number with Animation */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 blur-3xl opacity-30 animate-pulse" />
              <h1 className="text-[120px] md:text-[180px] lg:text-[220px] font-black bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x relative z-10">
                404
              </h1>
            </div>
            <div className="relative mt-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white relative px-4 inline-block bg-slate-800/50 backdrop-blur-sm">
                Page Not Found
              </h2>
            </div>
          </div>

          {/* Animated Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 animate-ping">
                <AlertTriangle className="w-20 h-20 text-emerald-500/20" />
              </div>
              <div className="relative animate-bounce-slow">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                  <AlertTriangle className="w-12 h-12 text-emerald-400" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 animate-spin-slow">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-spin-slow">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Message */}
          <p className="text-center text-gray-400 text-base md:text-lg mb-12 max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off into the digital wilderness.
          </p>

          {/* Suggestions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {suggestions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 hover:border-white/20 transition-all duration-300 hover:scale-105"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-gray-400">Click to explore</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Back to Home Button */}
          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="group relative inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </span>
            </button>
          </div>

          {/* Decorative Elements */}
          <div className="absolute bottom-10 left-10 animate-float-slow">
            <Star className="w-4 h-4 text-amber-400/50" />
          </div>
          <div className="absolute top-32 right-20 animate-float-delayed">
            <Sparkles className="w-5 h-5 text-emerald-400/50" />
          </div>
          <div className="absolute bottom-20 right-32 animate-float">
            <MapPin className="w-6 h-6 text-blue-400/30" />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-10px) translateX(10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 4s ease-in-out infinite 1s;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;