import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, CheckCircle2, EyeOff, Eye, ShieldCheck, Truck, Headset } from 'lucide-react';
import { auth } from '../api/auth';
import Logo from '../assets/logo.jpeg';

const PERKS = [
  { Icon: ShieldCheck, label: 'Genuine products, brand warranty' },
  { Icon: Truck, label: 'Delivered to your address' },
  { Icon: Headset, label: 'Lifetime service support' },
];

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
    // The auth helper already stored both tokens; this keeps the user object in
    // sync for screens that read it directly.
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
    /* An ordinary page, not a fixed overlay. The previous version was pinned
       with `fixed inset-0 z-[9000]`, which floated the whole card over the
       header and footer - that is what read as overlapping components. */
    <div className="bg-ink-50 py-10 md:py-16">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        <button
          type="button"
          onClick={handleClose}
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-500 transition-colors hover:text-primary"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="grid overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card lg:grid-cols-[0.9fr,1fr]">
          {/* ---- Brand panel (desktop) ---- */}
          <aside className="anim-aside relative hidden flex-col justify-between border-r border-ink-200 bg-ink-50 p-10 lg:flex">
            <div>
              <span className="anim-logo grid h-14 w-14 place-items-center overflow-hidden rounded-xl border border-ink-200 bg-white">
                <img
                  src={Logo}
                  alt=""
                  aria-hidden="true"
                  className="h-[85%] w-[85%] object-contain"
                />
              </span>

              <div className="anim-brand">
                <h2 className="mt-7 font-display text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
                  Welcome back to Bharat National Computers
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink-600">
                  Sign in to track orders, reorder quickly and manage your
                  service requests.
                </p>
              </div>
            </div>

            <ul className="anim-brand mt-10 space-y-4">
              {PERKS.map((perk) => (
                <li key={perk.label} className="flex items-center gap-3 text-[13.5px] text-ink-700">
                  <span className="icon-chip-sm">
                    <perk.Icon size={15} />
                  </span>
                  {perk.label}
                </li>
              ))}
            </ul>
          </aside>

          {/* ---- Form panel ---- */}
          <div className="anim-panel px-6 py-9 sm:px-10 sm:py-12">
            {/* Mobile-only brand mark */}
            <div className="mb-6 flex justify-center lg:hidden">
              <span className="anim-logo grid h-14 w-14 place-items-center overflow-hidden rounded-xl border border-ink-200 bg-white">
                <img
                  src={Logo}
                  alt=""
                  aria-hidden="true"
                  className="h-[85%] w-[85%] object-contain"
                />
              </span>
            </div>

            <div className="mb-8 text-center lg:text-left">
              <span className="eyebrow">Sign in</span>
              <h1 className="mt-2 font-display text-[26px] font-bold tracking-[-0.02em] text-ink-900 sm:text-[30px]">
                Welcome back
              </h1>
              <p className="mt-2 text-[14.5px] text-ink-500">
                Sign in with your mobile number and password to continue
              </p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Mobile Number */}
              <div className="mb-5">
                <label className="field-label">Mobile Number</label>
                <div className="relative">
                  <div className="pointer-events-none absolute bottom-0 left-0 top-0 flex items-center pl-3.5">
                    <span className="border-r border-ink-200 pr-3 text-sm font-semibold text-ink-700">
                      +91
                    </span>
                  </div>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, '');
                      if (cleaned.length <= 10) setMobileNumber(cleaned);
                    }}
                    className="field py-3 pl-[64px] pr-11 text-[15px]"
                    placeholder="98765 43210"
                    maxLength={10}
                    disabled={loading}
                  />
                  {mobileNumber.length === 10 && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <CheckCircle2 size={18} className="text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="mb-7">
                <label className="field-label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field py-3 pr-11 text-[15px]"
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-400 transition-colors hover:text-primary"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || mobileNumber.length !== 10 || !password}
                className="btn-primary btn-lg w-full"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[13.5px] text-ink-500 lg:text-left">
              New to BNC?{' '}
              <button
                type="button"
                onClick={() =>
                  navigate('/signup', {
                    state: { redirectTo: location.state?.redirectTo || '/' },
                  })
                }
                className="font-semibold text-primary hover:underline"
              >
                Create an account
              </button>
            </p>

            <div className="mt-6 border-t border-ink-200 pt-5 text-center lg:text-left">
              <p className="text-[11.5px] leading-relaxed text-ink-400">
                By continuing, you agree to our{' '}
                <span className="cursor-pointer underline transition-colors hover:text-ink-700">Terms</span>
                {' '}&amp;{' '}
                <span className="cursor-pointer underline transition-colors hover:text-ink-700">Privacy Policy</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
