import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, Lock, ArrowRight, ArrowUpRight, CheckCircle2, EyeOff, Eye } from 'lucide-react';
import { auth } from '../api/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileNumber, setMobileNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.mobilenumber) {
      setMobileNumber(location.state.mobilenumber);
    }
  }, [location]);

  const handleClose = () => navigate(location.state?.redirectTo || -1);

  const afterSuccessfulLogin = async (token, userData) => {
    // store token & user (API helper already does this, but in case you still want this logic)
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new StorageEvent('storage'));
    toast.success('Login successful!');

    const pendingItem = localStorage.getItem('pendingCartItem');
    if (pendingItem) {
      const item = JSON.parse(pendingItem);
      const { addToCart } = await import('../utils/CartStorage');
      addToCart(item.product, item.quantity);
      localStorage.removeItem('pendingCartItem');
      window.dispatchEvent(new Event('cart:open'));
    }

    navigate(location.state?.redirectTo || '/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!mobileNumber || mobileNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const res = await auth.login(mobileNumber, password);
      // auth.login already stores token/user, but keep this for your cart logic & toast
      if (res.access_token) {
        await afterSuccessfulLogin(res.access_token, res.user);
      }
    } catch (error) {
      const msg = error?.message || 'Login failed';
      if (msg.toLowerCase().includes('not found')) {
        toast.info('This number is not registered. Please create an account.');
        setTimeout(() => {
          navigate('/signup', {
            state: {
              mobilenumber: mobileNumber,
              redirectTo: location.state?.redirectTo || '/',
            },
          });
        }, 800);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-[440px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-gray-100 text-gray-500 hover:text-gray-900 hover:rotate-90 transition-all duration-300 shadow-sm"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="px-6 sm:px-10 py-8 sm:py-10">
          {/* Lock Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl blur-xl opacity-40"
                style={{ backgroundColor: 'var(--primary, #00897B)' }}
              ></div>
              <div
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--primary, #00897B), #00695C)',
                }}
              >
                <Lock size={24} className="text-white" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500">
              Sign in with your mobile number and password to continue
            </p>
          </div>

          {/* Step Indicator (optional, now single step) */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div
              className="h-1.5 rounded-full w-10"
              style={{ backgroundColor: 'var(--primary, #00897B)' }}
            ></div>
          </div>

          {/* Mobile Input */}
          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Mobile Number
              </label>
              <div className="relative group">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pointer-events-none border-r border-gray-200">
                  <span className="text-gray-700 font-semibold pr-3">+91</span>
                </div>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '');
                    if (cleaned.length <= 10) setMobileNumber(cleaned);
                  }}
                  className="w-full pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary,#00897B)] focus:bg-white focus:ring-1 focus:ring-[var(--primary,#00897B)]/30 transition-all text-base font-medium placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="98765 43210"
                  maxLength={10}
                  disabled={loading}
                />
                {mobileNumber.length === 10 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CheckCircle2 size={20} style={{ color: 'var(--primary, #00897B)' }} />
                  </div>
                )}
              </div>
            </div>

          {/* Password Input */}
<div className="mb-6">
  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
    Password
  </label>
  <div className="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary,#00897B)] focus:bg-white focus:ring-1 focus:ring-[var(--primary,#00897B)]/30 transition-all text-base font-medium placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed pr-11"
      placeholder="Enter your password"
      disabled={loading}
    />
    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
      tabIndex={-1}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || mobileNumber.length !== 10 || !password}
              className="group relative w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, var(--primary, #00897B), #00695C)',
                boxShadow: '0 10px 30px -10px rgba(0, 137, 123, 0.5)',
              }}
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              By continuing, you agree to our{' '}
              <span className="underline cursor-pointer hover:text-gray-700">Terms</span>
              {' '} & {' '}
              <span className="underline cursor-pointer hover:text-gray-700">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;