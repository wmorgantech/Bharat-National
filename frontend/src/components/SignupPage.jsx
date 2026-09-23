import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, ArrowRight, CheckCircle2, EyeOff, Eye, ShieldCheck, Truck, Headset } from 'lucide-react';
import { auth } from '../api/auth';
import Logo from '../assets/logo.jpeg';

const PERKS = [
  { Icon: ShieldCheck, label: 'Genuine products, brand warranty' },
  { Icon: Truck, label: 'Fast delivery across major cities' },
  { Icon: Headset, label: 'Lifetime service support' },
];

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    mobilenumber: '',
    password: '',
  });

  useEffect(() => {
    if (location.state?.mobilenumber) {
      setFormData(prev => ({
        ...prev,
        mobilenumber: location.state.mobilenumber,
      }));
    }
  }, [location]);

  const handleClose = () => navigate(location.state?.redirectTo || -1);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'mobilenumber') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: cleaned }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return false;
    }
    if (!formData.mobilenumber) {
      toast.error('Please enter mobile number');
      return false;
    }
    if (formData.mobilenumber.length !== 10) {
      toast.error('Mobile number must be 10 digits');
      return false;
    }
    if (!formData.password) {
      toast.error('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        mobilenumber: formData.mobilenumber,
        password: formData.password,
      };

      await auth.signup(submitData);

      toast.success('Account created! You can now log in.');
      navigate('/login', {
        state: {
          mobilenumber: formData.mobilenumber,
          redirectTo: location.state?.redirectTo || '/',
        },
      });
    } catch (error) {
      if (error.message?.toLowerCase().includes('already exists')) {
        toast.info('Account already exists. Please log in.');
        navigate('/login', {
          state: {
            mobilenumber: formData.mobilenumber,
            redirectTo: location.state?.redirectTo || '/',
          },
        });
      } else {
        toast.error(error.message || 'Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Shared field styling comes from the design system so inputs match the
  // rest of the storefront rather than carrying their own heavier treatment.
  const fieldClass = 'field py-3 text-[15px]';

  const labelClass = 'field-label';

  return (
    /* An ordinary page, matching Login. The previous fixed-overlay shell
       floated this card above the header and footer. */
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
          {/* ---- Brand panel (desktop only) ---- */}
          <aside className="anim-aside relative hidden lg:flex flex-col justify-between p-10 bg-ink-50 border-r border-ink-200">
            <div>
              <span className="anim-logo grid h-14 w-14 place-items-center overflow-hidden rounded-xl border border-ink-200 bg-white">
                <img src={Logo} alt="" aria-hidden="true" className="h-[85%] w-[85%] object-contain" />
              </span>
              <div className="anim-brand">
                <h2 className="mt-7 font-display text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
                  Create your Bharat National account
                </h2>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink-600">
                  One account for orders, service requests and faster checkout.
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
          <div className="anim-panel px-6 sm:px-10 py-9 sm:py-12">
            {/* Mobile-only brand mark */}
            <div className="lg:hidden flex justify-center mb-6">
              <span className="anim-logo grid h-14 w-14 place-items-center overflow-hidden rounded-xl border border-ink-200 bg-white">
                <img src={Logo} alt="" aria-hidden="true" className="h-[85%] w-[85%] object-contain" />
              </span>
            </div>

          {/* Header */}
          <div className="text-center lg:text-left mb-8">
            <span className="eyebrow">Get started</span>
            <h1 className="mt-2 font-display text-[26px] sm:text-[30px] font-bold tracking-[-0.02em] text-ink-900">
              Create an account
            </h1>
            <p className="mt-2 text-[14.5px] text-ink-500">
              It only takes a minute — then you can check out in one step.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-5">
              <label className={labelClass}>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${fieldClass} px-4`}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            {/* Mobile */}
            <div className="mb-5">
              <label className={labelClass}>Mobile Number</label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pointer-events-none">
                  <span className="text-ink-900 font-semibold pr-3 border-r border-ink-200">
                    +91
                  </span>
                </div>
                <input
                  type="tel"
                  name="mobilenumber"
                  value={formData.mobilenumber}
                  onChange={handleInputChange}
                  className={`${fieldClass} pl-[70px] pr-11`}
                  placeholder="98765 43210"
                  maxLength={10}
                  disabled={loading}
                />
                {formData.mobilenumber.length === 10 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CheckCircle2 size={19} className="text-primary" />
                  </div>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="mb-7">
              <label className={labelClass}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`${fieldClass} px-4 pr-11`}
                  placeholder="At least 6 characters"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-ink-500 hover:text-primary transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-lg w-full"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-ink-200 text-center lg:text-left">
            <p className="text-sm text-ink-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() =>
                  navigate('/login', {
                    state: {
                      mobilenumber: formData.mobilenumber,
                      redirectTo: location.state?.redirectTo || '/',
                    },
                  })
                }
                className="font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                Log in
              </button>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
