import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowRight, CheckCircle2, EyeOff, Eye } from 'lucide-react';
import { auth } from '../api/auth';
import AuthModal from './AuthModal';

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
    <AuthModal
      eyebrow="Get started"
      title="Create an account"
      subtitle="It only takes a minute - then you can check out in one step."
      onClose={handleClose}
      footer={
        <p className="text-[13.5px] text-ink-500">
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
            className="font-semibold text-primary transition-colors hover:text-primary-dark hover:underline"
          >
            Log in
          </button>
        </p>
      }
    >
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
            <div className="pointer-events-none absolute bottom-0 left-0 top-0 flex items-center pl-4">
              <span className="border-r border-ink-200 pr-3 font-semibold text-ink-900">
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
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-ink-400 transition-colors hover:text-primary"
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
          className="btn-primary btn-lg w-full transition-transform duration-200 hover:-translate-y-px active:translate-y-0"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
    </AuthModal>
  );
};

export default SignupPage;
