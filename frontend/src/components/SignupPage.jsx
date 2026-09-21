import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X, UserPlus, ArrowRight, CheckCircle2, EyeOff, Eye } from 'lucide-react';
import { auth } from '../api/auth';

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
          
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div 
                className="absolute inset-0 rounded-2xl blur-xl opacity-40"
                style={{ backgroundColor: 'var(--primary, #00897B)' }}
              ></div>
              <div 
                className="relative w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--primary, #00897B), #00695C)' }}
              >
                <UserPlus size={24} className="text-white" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Create Account
            </h2>
            <p className="text-sm text-gray-500">
              Join Bharat National Computers today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary,#00897B)] focus:bg-white focus:ring-1 focus:ring-[var(--primary,#00897B)]/30 transition-all text-base font-medium placeholder:text-gray-400"
                  placeholder="John Doe"
                  disabled={loading}
                  autoFocus
                />
                {formData.name.trim().length > 1 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CheckCircle2 size={20} style={{ color: 'var(--primary, #00897B)' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-4 pointer-events-none border-r border-gray-200">
                  <span className="text-gray-700 font-semibold pr-3">+91</span>
                </div>
                <input
                  type="tel"
                  name="mobilenumber"
                  value={formData.mobilenumber}
                  onChange={handleInputChange}
                  className="w-full pl-16 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary,#00897B)] focus:bg-white focus:ring-1 focus:ring-[var(--primary,#00897B)]/30 transition-all text-base font-medium placeholder:text-gray-400"
                  placeholder="98765 43210"
                  maxLength={10}
                  disabled={loading}
                />
                {formData.mobilenumber.length === 10 && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <CheckCircle2 size={20} style={{ color: 'var(--primary, #00897B)' }} />
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[var(--primary,#00897B)] focus:bg-white focus:ring-1 focus:ring-[var(--primary,#00897B)]/30 transition-all text-base font-medium placeholder:text-gray-400 pr-11"
                  placeholder="At least 6 characters"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                loading ||
                !formData.name.trim() ||
                formData.mobilenumber.length !== 10 ||
                !formData.password
              }
              className="group relative w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden mt-6"
              style={{ 
                background: 'linear-gradient(135deg, var(--primary, #00897B), #00695C)',
                boxShadow: '0 10px 30px -10px rgba(0, 137, 123, 0.5)'
              }}
            >
              <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() =>
                  navigate('/login', { state: { redirectTo: location.state?.redirectTo } })
                }
                className="font-bold hover:underline"
                style={{ color: 'var(--primary, #00897B)' }}
              >
                Sign In
              </button>
            </p>
            <p className="mt-4 text-xs text-gray-400 leading-relaxed">
              By creating an account, you agree to our{' '}
              <span className="underline cursor-pointer hover:text-gray-700">Terms</span> and{' '}
              <span className="underline cursor-pointer hover:text-gray-700">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;