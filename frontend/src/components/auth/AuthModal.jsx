import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Calendar,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  Check,
  RefreshCw,
  Sparkles,
  ExternalLink,
  FileText,
  Trash2,
  Save,
} from 'lucide-react';
import { useAuthStore, calculateAge } from '../../store/useAuthStore';
import { useLibraryStore } from '../../store/useLibraryStore';
import { checkUsernameApi } from '../../services/authApi';
import { SpotifySettings } from '../settings/SpotifySettings';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    modalMode,
    setModalMode,
    authNotice,
    login,
    register,
    requestPasswordReset,
    resendVerification,
    checkVerificationStatus,
    acceptDpdpConsent,
    dpdpConsentAccepted,
    updateProfileDetails,
    deleteAccountPermanently,
    logout,
    authActionLoading,
    error,
    successMessage,
    clearError,
    requireCaptcha,
    captchaSolved,
    setCaptchaSolved,
    rateLimitBlocked,
    user,
    profile,
  } = useAuthStore();

  const setActiveView = useLibraryStore((state) => state.setActiveView);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile Edit fields
  const [editUsername, setEditUsername] = useState('');
  const [editGender, setEditGender] = useState('prefer-not-to-say');
  const [editDob, setEditDob] = useState('');
  const [confirmDeleteCheck, setConfirmDeleteCheck] = useState(false);

  // DPDP Act 2023 Statutory Consent Checkboxes
  const [consentData, setConsentData] = useState(false);
  const [consentTerms, setConsentTerms] = useState(false);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });

  // CAPTCHA puzzle state
  const [captchaPuzzle, setCaptchaPuzzle] = useState({ num1: 4, num2: 7, answer: 11 });
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);

  // Reset form when modal closes or switches modes
  useEffect(() => {
    if (!isAuthModalOpen) {
      clearError();
      setUsernameStatus({ checking: false, available: null, message: '' });
      setCaptchaInput('');
      setCaptchaError(false);
      setConsentData(false);
      setConsentTerms(false);
      setConfirmDeleteCheck(false);
    }
  }, [isAuthModalOpen, clearError]);

  // Pre-fill profile fields when opening profile mode
  useEffect(() => {
    if (modalMode === 'profile' && (profile || user)) {
      setEditUsername(profile?.username || user?.displayName || user?.email?.split('@')[0] || '');
      setEditGender(profile?.gender || 'prefer-not-to-say');
      setEditDob('');
      setConfirmDeleteCheck(false);
    }
  }, [modalMode, profile, user]);

  // Generate CAPTCHA puzzle when challenge required
  useEffect(() => {
    if (requireCaptcha && !captchaSolved) {
      const n1 = Math.floor(Math.random() * 8) + 2;
      const n2 = Math.floor(Math.random() * 8) + 1;
      setCaptchaPuzzle({ num1: n1, num2: n2, answer: n1 + n2 });
      setCaptchaInput('');
      setCaptchaError(false);
    }
  }, [requireCaptcha, captchaSolved]);

  // Debounced Username availability check
  useEffect(() => {
    if (modalMode !== 'register' || !username.trim()) {
      setUsernameStatus({ checking: false, available: null, message: '' });
      return;
    }

    const clean = username.trim().toLowerCase();
    if (clean.length < 3) {
      setUsernameStatus({ checking: false, available: false, message: 'Minimum 3 characters' });
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(clean)) {
      setUsernameStatus({ checking: false, available: false, message: 'Only letters, numbers, and underscores' });
      return;
    }

    setUsernameStatus((prev) => ({ ...prev, checking: true }));
    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameApi(clean);
        setUsernameStatus({
          checking: false,
          available: res.available,
          message: res.message || (res.available ? 'Username available' : 'Username taken'),
        });
      } catch {
        setUsernameStatus({ checking: false, available: null, message: '' });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, modalMode]);

  if (!isAuthModalOpen) return null;

  // Live Password policy indicators
  const hasMinLength = password.length >= 8;
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const isPasswordValid = hasMinLength && hasNumber && hasSpecial;
  const doPasswordsMatch = password && confirmPassword && password === confirmPassword;

  // Age calculations
  const calculatedAge = dateOfBirth ? calculateAge(dateOfBirth) : null;
  const isUnder13 = calculatedAge !== null && calculatedAge < 13;
  const isMinor = calculatedAge !== null && calculatedAge >= 13 && calculatedAge < 18;

  // Handle CAPTCHA resolution
  const handleVerifyCaptcha = (e) => {
    e.preventDefault();
    if (parseInt(captchaInput, 10) === captchaPuzzle.answer) {
      setCaptchaSolved(true);
      setCaptchaError(false);
    } else {
      setCaptchaError(true);
      setCaptchaSolved(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (modalMode === 'login') {
      await login(email, password);
    } else if (modalMode === 'register') {
      if (isUnder13) return;
      if (!isPasswordValid || !doPasswordsMatch) return;
      if (usernameStatus.available === false) return;
      if (!consentData || !consentTerms) return;

      await register({
        email,
        password,
        confirmPassword,
        username,
        dateOfBirth,
        gender,
      });
    } else if (modalMode === 'forgot_password') {
      await requestPasswordReset(email);
    }
  };

  // Profile Update Submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    clearError();
    const updates = {
      username: editUsername.trim().toLowerCase(),
      gender: editGender,
    };
    if (editDob) {
      updates.dateOfBirth = editDob;
    }
    await updateProfileDetails(updates);
  };

  // Permanent Account Deletion
  const handleDeleteAccountPermanent = async () => {
    if (!confirmDeleteCheck) return;
    clearError();
    await deleteAccountPermanently();
  };

  // Maximum selectable date is today
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className={`relative w-full ${modalMode === 'profile' ? 'max-w-3xl' : 'max-w-md'} bg-[#0D0D0E] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300`}>
        {/* Subtle Titanium Ambient Flare */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-zinc-400 to-transparent opacity-60" />

        {/* Modal Header (shown for login, register, verify, forgot, consent) */}
        {modalMode !== 'profile' && (
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-200">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white tracking-wide">
                  {modalMode === 'login' && 'Sign In to Jennie'}
                  {modalMode === 'register' && 'Create Your Account'}
                  {modalMode === 'verify_notice' && 'Email Verification'}
                  {modalMode === 'forgot_password' && 'Reset Password'}
                  {modalMode === 'dpdp_consent' && 'Data Protection & Consent'}
                  {modalMode === 'delete_account_confirm' && 'Delete Account Permanently'}
                </h2>
                <p className="text-xs text-zinc-400">
                  {modalMode === 'login' && 'Experience sound in pure studio fidelity'}
                  {modalMode === 'register' && 'Join the private high-fidelity listening club'}
                  {modalMode === 'verify_notice' && 'Verify your email to activate full listening access'}
                  {modalMode === 'forgot_password' && 'Enter your email for instant recovery'}
                  {modalMode === 'dpdp_consent' && 'Digital Personal Data Protection Act, 2023 Statutory Notice'}
                  {modalMode === 'delete_account_confirm' && 'Right to Erasure under DPDP Act, 2023'}
                </p>
              </div>
            </div>
            <button
              onClick={closeAuthModal}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Auth Action Notice (e.g. Sign in to stream music) */}
        {authNotice && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-zinc-900 border border-zinc-700/80 flex items-center gap-2.5 text-xs text-zinc-200 shadow-md">
            <Sparkles className="w-4 h-4 shrink-0 text-zinc-300" />
            <span className="font-medium">{authNotice}</span>
          </div>
        )}

        {/* Rate limit warning banner */}
        {rateLimitBlocked && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-xs text-red-400">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
            <span>Too many attempts. Please try again in a few minutes.</span>
          </div>
        )}

        {/* Error banner */}
        {error && !rateLimitBlocked && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2.5 text-xs text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success message banner */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-400">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            MODE: VERIFY NOTICE
           ════════════════════════════════════════════════════════════ */}
        {modalMode === 'verify_notice' && (
          <div className="p-6 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-200 animate-pulse">
              <Mail className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Check Your Inbox</h3>
              <p className="text-xs text-white/60 max-w-sm mx-auto leading-relaxed">
                We sent a secure verification link to{' '}
                <span className="text-white font-medium">{user?.email || email}</span>.
                Please click the link in your email to authenticate your account.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={checkVerificationStatus}
                disabled={authActionLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs tracking-wider uppercase transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-white/5"
              >
                {authActionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                I've Verified My Email
              </button>

              <button
                type="button"
                onClick={resendVerification}
                disabled={authActionLoading}
                className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
              >
                Resend Verification Link
              </button>
            </div>

            <div className="text-[11px] text-white/40">
              Signed in as wrong email?{' '}
              <button
                type="button"
                onClick={() => setModalMode('login')}
                className="text-zinc-300 hover:text-white hover:underline"
              >
                Switch Account
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            MODE: FORGOT PASSWORD
           ════════════════════════════════════════════════════════════ */}
        {modalMode === 'forgot_password' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-white/60 uppercase tracking-wider mb-1.5">
                Account Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authActionLoading || !email}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs tracking-wider uppercase transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              {authActionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setModalMode('login')}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════════════════════════
            MODE: DPDP CONSENT APPROVAL (Statutory Notice for Logged-In Users)
           ════════════════════════════════════════════════════════════ */}
        {modalMode === 'dpdp_consent' && (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-zinc-800/80 border border-zinc-700/80 flex items-center justify-center text-zinc-200 shadow-lg">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-semibold text-white">
                Statutory Data Protection Notice &amp; Consent
              </h3>
              <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                Under Section 5 of India's <strong className="text-white font-medium">Digital Personal Data Protection (DPDP) Act, 2023</strong>, we require your explicit agreement before processing your personal information.
              </p>
            </div>

            {/* Transparent Data Collection Summary */}
            <div className="space-y-3 bg-white/[0.02] border border-white/10 rounded-xl p-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Email ID: <span className="font-mono text-white/80">{user?.email || 'Your account email'}</span></span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed pl-5">
                  <strong className="text-white/70">Why we need it:</strong> Strictly for secure multi-factor authentication, account recovery, and essential security notices. <strong className="text-emerald-400">We never sell, rent, or monetize your email with advertisers.</strong>
                </p>
              </div>

              <div className="h-px bg-white/5 my-2" />

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-white font-medium">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Date of Birth</span>
                </div>
                <p className="text-[11px] text-white/50 leading-relaxed pl-5">
                  <strong className="text-white/70">Why we need it:</strong> Required under DPDP Act 2023 (Section 9) and COPPA to verify age and enforce child protections. <strong className="text-zinc-200">Your birthdate is encrypted at rest using AES-256-GCM cipher</strong>; your raw DOB is never exposed publicly.
                </p>
              </div>
            </div>

            {/* Unbundled Consent Affirmation Check */}
            <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-white/80 leading-relaxed">
              <p>
                Do you consent to Jennie Music processing your <strong className="text-white">Email Address</strong> and <strong className="text-white">Date of Birth</strong> for these purposes, and agree to our{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('privacy');
                    closeAuthModal();
                  }}
                  className="text-zinc-300 underline hover:text-white inline font-medium"
                >
                  Privacy Policy
                </button>{' '}
                and{' '}
                <button
                  type="button"
                  onClick={() => {
                    setActiveView('terms');
                    closeAuthModal();
                  }}
                  className="text-zinc-300 underline hover:text-white inline font-medium"
                >
                  Terms &amp; Conditions
                </button>?
              </p>
            </div>

            {/* Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={acceptDpdpConsent}
                disabled={authActionLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs tracking-wider uppercase transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-white/5"
              >
                {authActionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                I Agree &amp; Proceed
              </button>

              <button
                type="button"
                onClick={logout}
                disabled={authActionLoading}
                className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-xs font-medium transition-colors"
              >
                Decline &amp; Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            MODE: PROFILE & ACCOUNT SETTINGS (Change details & manage account)
           ════════════════════════════════════════════════════════════ */}
        {/* ════════════════════════════════════════════════════════════
            MODE: PROFILE & ACCOUNT SETTINGS (Spotify-style Settings)
           ════════════════════════════════════════════════════════════ */}
        {modalMode === 'profile' && (
          <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            <SpotifySettings
              onClose={closeAuthModal}
              onOpenCookieSettings={() => {
                closeAuthModal();
                setActiveView('cookies');
              }}
            />
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            MODE: DELETE ACCOUNT CONFIRMATION (Permanent Right to Erasure)
           ════════════════════════════════════════════════════════════ */}
        {modalMode === 'delete_account_confirm' && (
          <div className="p-6 space-y-5 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shadow-xl shadow-red-500/10">
              <Trash2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-bold text-white">Permanently Delete Account?</h3>
              <p className="text-xs text-white/60 leading-relaxed max-w-sm mx-auto">
                Under Section 12 of India's <strong className="text-white font-medium">DPDP Act, 2023</strong> (Right to Erasure), all your account data, credentials, and encrypted records will be deleted permanently.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-left text-xs space-y-2 text-white/70">
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold">&bull;</span>
                <span>Your login credentials and account profile will be purged forever.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold">&bull;</span>
                <span>Your encrypted date of birth and listening history will be erased from our database.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold">&bull;</span>
                <span className="text-red-400 font-medium">This operation is irreversible and cannot be recovered.</span>
              </div>
            </div>

            <label className="flex items-start gap-2.5 text-left cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={confirmDeleteCheck}
                onChange={(e) => setConfirmDeleteCheck(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-red-500 focus:ring-red-500 accent-red-500 cursor-pointer shrink-0"
              />
              <span className="text-xs text-white/80 group-hover:text-white leading-tight">
                I understand this action is permanent and irrevocably erases all my account data.
              </span>
            </label>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleDeleteAccountPermanent}
                disabled={authActionLoading || !confirmDeleteCheck}
                className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs tracking-wider uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                {authActionLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete My Account Permanently
              </button>

              <button
                type="button"
                onClick={() => setModalMode('profile')}
                disabled={authActionLoading}
                className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-colors"
              >
                Cancel &amp; Keep Account
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            MODE: LOGIN OR REGISTER
           ════════════════════════════════════════════════════════════ */}
        {(modalMode === 'login' || modalMode === 'register') && (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* 1. Email Field */}
            <div>
              <label className="block text-[11px] font-medium text-white/60 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-zinc-400 transition-colors"
                />
              </div>

              {/* DPDP Purpose Notice for Email */}
              {modalMode === 'register' && (
                <div className="mt-1.5 p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-white/50 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white/80">Purpose of Email:</strong> Used strictly for secure authentication, password recovery, and DPDP-mandated security notices. We <strong className="text-emerald-400">never sell</strong> or share your email with advertisers.
                  </span>
                </div>
              )}
            </div>

            {/* 2. Username Field (Register Only) */}
            {modalMode === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-medium text-white/60 uppercase tracking-wider">
                    Username
                  </label>
                  {usernameStatus.checking ? (
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> checking...
                    </span>
                  ) : usernameStatus.available === true ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> available
                    </span>
                  ) : usernameStatus.available === false ? (
                    <span className="text-[10px] text-red-400">{usernameStatus.message}</span>
                  ) : null}
                </div>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    maxLength={20}
                    placeholder="audiophile_01"
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-zinc-400 transition-colors font-mono"
                  />
                </div>
              </div>
            )}

            {/* 3. Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-medium text-white/60 uppercase tracking-wider">
                  Password
                </label>
                {modalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setModalMode('forgot_password')}
                    className="text-[11px] text-zinc-300 hover:text-white hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-zinc-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Policy Indicator (Register Mode) */}
              {modalMode === 'register' && password && (
                <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
                  <div
                    className={`flex items-center gap-1 ${
                      hasMinLength ? 'text-emerald-400' : 'text-white/30'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasMinLength ? 'bg-emerald-400' : 'bg-white/20'
                      }`}
                    />
                    8+ chars
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      hasNumber ? 'text-emerald-400' : 'text-white/30'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasNumber ? 'bg-emerald-400' : 'bg-white/20'
                      }`}
                    />
                    1 number
                  </div>
                  <div
                    className={`flex items-center gap-1 ${
                      hasSpecial ? 'text-emerald-400' : 'text-white/30'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        hasSpecial ? 'bg-emerald-400' : 'bg-white/20'
                      }`}
                    />
                    1 symbol
                  </div>
                </div>
              )}
            </div>

            {/* 4. Confirm Password (Register Only) */}
            {modalMode === 'register' && (
              <div>
                <label className="block text-[11px] font-medium text-white/60 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/20 focus:outline-none focus:border-zinc-400 transition-colors"
                  />
                  {confirmPassword && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {doPasswordsMatch ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. Date of Birth & Age-Gating (Register Only) */}
            {modalMode === 'register' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-medium text-white/60 uppercase tracking-wider">
                    Date of Birth
                  </label>
                  {calculatedAge !== null && (
                    <span
                      className={`text-[10px] font-medium ${
                        isUnder13
                          ? 'text-red-400'
                          : isMinor
                          ? 'text-zinc-300'
                          : 'text-emerald-400'
                      }`}
                    >
                      Age: {calculatedAge} {isMinor ? '(Minor tier)' : ''}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                  <input
                    type="date"
                    required
                    max={todayStr}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-zinc-400 transition-colors [color-scheme:dark]"
                  />
                </div>

                {/* DPDP Purpose Notice for Date of Birth */}
                <div className="mt-1.5 p-2 rounded-lg bg-white/[0.03] border border-white/5 text-[11px] text-white/50 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white/80">Purpose of Date of Birth:</strong> Required under DPDP Act 2023 (Sec. 9) &amp; COPPA for legal age verification and child safeguards. Your raw birthdate is <strong className="text-zinc-300">AES-256-GCM encrypted at rest</strong> and never made public.
                  </span>
                </div>

                {/* COPPA Under-13 Hard Block Warning */}
                {isUnder13 && (
                  <div className="mt-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-400 flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      Under the Children's Online Privacy Protection Act (COPPA), accounts cannot be
                      created for users under 13.
                    </span>
                  </div>
                )}

                {/* Minor Tier Safe Mode Notice */}
                {isMinor && (
                  <div className="mt-2 p-2 rounded-lg bg-zinc-800/60 border border-zinc-700/60 text-[11px] text-zinc-300 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                    <span>Minor Protection active: Explicit content filtered & private profile enabled.</span>
                  </div>
                )}
              </div>
            )}

            {/* 6. Gender Selection (Register Only - Optional) */}
            {modalMode === 'register' && (
              <div>
                <label className="block text-[11px] font-medium text-white/60 uppercase tracking-wider mb-1.5">
                  Gender <span className="text-white/30 lowercase">(optional)</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-[#121214] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-zinc-400 transition-colors"
                >
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other / Non-binary</option>
                </select>
              </div>
            )}

            {/* Security Challenge (CAPTCHA) when required */}
            {modalMode === 'login' && requireCaptcha && !captchaSolved && (
              <div className="p-3.5 rounded-xl bg-white/5 border border-zinc-700/60 space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                  <Shield className="w-4 h-4 text-zinc-400" />
                  <span>Security Verification Required</span>
                </div>
                <p className="text-[11px] text-white/60">
                  Multiple login attempts detected. Please solve this check:
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-white px-3 py-1.5 bg-black/40 rounded-lg border border-white/10">
                    {captchaPuzzle.num1} + {captchaPuzzle.num2} = ?
                  </span>
                  <input
                    type="number"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Result"
                    className="w-20 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white text-center focus:outline-none focus:border-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyCaptcha}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    Verify
                  </button>
                </div>
                {captchaError && (
                  <p className="text-[10px] text-red-400">Incorrect answer. Please try again.</p>
                )}
              </div>
            )}

            {/* DPDP Act 2023 Statutory Consent & Terms Checkboxes (Register Only) */}
            {modalMode === 'register' && (
              <div className="pt-2 space-y-2.5 border-t border-white/5">
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={consentData}
                    onChange={(e) => setConsentData(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-zinc-100 focus:ring-zinc-400 focus:ring-offset-0 focus:ring-1 accent-zinc-300 cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] text-white/70 group-hover:text-white leading-snug">
                    I consent to Jennie Music processing my <strong className="text-white font-medium">Email Address</strong> and <strong className="text-white font-medium">Date of Birth</strong> (AES-256-GCM encrypted) strictly for account security and age-tier verification under the <strong className="text-zinc-300">DPDP Act, 2023</strong>.
                  </span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={consentTerms}
                    onChange={(e) => setConsentTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/5 text-zinc-100 focus:ring-zinc-400 focus:ring-offset-0 focus:ring-1 accent-zinc-300 cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] text-white/70 group-hover:text-white leading-snug">
                    I have read and agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveView('terms');
                        closeAuthModal();
                      }}
                      className="text-zinc-300 underline hover:text-white inline font-medium"
                    >
                      Terms &amp; Conditions
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveView('privacy');
                        closeAuthModal();
                      }}
                      className="text-zinc-300 underline hover:text-white inline font-medium"
                    >
                      Privacy Policy
                    </button>.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                authActionLoading ||
                rateLimitBlocked ||
                (modalMode === 'login' && requireCaptcha && !captchaSolved) ||
                (modalMode === 'register' && (isUnder13 || !isPasswordValid || !doPasswordsMatch || !consentData || !consentTerms))
              }
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs tracking-wider uppercase transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              {authActionLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : modalMode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>

            {/* Toggle between Login and Register */}
            <div className="text-center pt-2 text-xs text-white/40">
              {modalMode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setModalMode('register')}
                    className="text-zinc-300 hover:text-white hover:underline font-medium ml-1"
                  >
                    Create Account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setModalMode('login')}
                    className="text-zinc-300 hover:text-white hover:underline font-medium ml-1"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>

            {/* Security & Encryption reassurance footer */}
            <div className="pt-3 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] text-white/30 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>AES-256-GCM Encrypted &bull; DPDP Act 2023 &amp; COPPA Compliant &bull; Zero Ad Tracking</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
