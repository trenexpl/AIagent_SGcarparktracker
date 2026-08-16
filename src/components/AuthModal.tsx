import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Lock, 
  Star, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Car
} from 'lucide-react';
import { UserAccount } from '../types/carpark';
import { storageService } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
  initialMode?: 'login' | 'signup';
  promptReason?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  promptReason,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    setTimeout(() => {
      try {
        if (mode === 'signup') {
          if (!name.trim()) {
            setErrorMsg('Please enter your driver name.');
            setIsLoading(false);
            return;
          }
          if (!email.trim() || !email.includes('@')) {
            setErrorMsg('Please enter a valid email address.');
            setIsLoading(false);
            return;
          }
          const res = storageService.signUp(name, email, password);
          if (!res.success || !res.user) {
            setErrorMsg(res.error || 'Failed to create account.');
            setIsLoading(false);
            return;
          }
          onAuthSuccess(res.user);
        } else {
          if (!email.trim()) {
            setErrorMsg('Please enter your email address.');
            setIsLoading(false);
            return;
          }
          const res = storageService.logIn(email, password);
          if (!res.success || !res.user) {
            setErrorMsg(res.error || 'Invalid credentials.');
            setIsLoading(false);
            return;
          }
          onAuthSuccess(res.user);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred.');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const handleFastDemoLogin = (emailPreset: string, namePreset: string) => {
    setErrorMsg(null);
    setIsLoading(true);
    setTimeout(() => {
      const res = storageService.logIn(emailPreset, 'password123');
      if (res.user) {
        onAuthSuccess(res.user);
      } else {
        const created = storageService.signUp(namePreset, emailPreset, 'password123');
        if (created.user) {
          onAuthSuccess(created.user);
        }
      }
      setIsLoading(false);
    }, 200);
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/30 text-amber-400 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
              Driver Account Required
            </span>
          </div>

          <h2 className="text-2xl font-black text-white">
            {mode === 'signup' ? 'Create Driver Account' : 'Log In to Account'}
          </h2>

          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
            {promptReason || 'Sign in to access your favorited carparks, cloud syncing, and subscription plans.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-4 p-1 bg-white/10 backdrop-blur-md rounded-xl flex items-center gap-1 border border-white/10">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Sign Up (New)
            </button>
          </div>
        </div>

        {/* Modal Body Form */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name / Driver Handle
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Tan"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@example.sg"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:border-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Processing...</span>
              ) : mode === 'signup' ? (
                <>
                  <span>Create Account &amp; Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for smooth evaluation */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-extrabold uppercase text-slate-400 block text-center">
              Or quick 1-click test login:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFastDemoLogin('sarah.tan@driver.sg', 'Sarah Tan')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 bg-slate-50 hover:bg-sky-50 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-black text-slate-900 group-hover:text-sky-700 flex items-center justify-between">
                  <span>Sarah Tan</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 font-bold text-slate-700">Free</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Free driver plan</div>
              </button>

              <button
                type="button"
                onClick={() => handleFastDemoLogin('kenji.pro@driver.sg', 'Kenji Tan (Pro)')}
                className="p-2.5 rounded-xl border border-amber-200 hover:border-amber-300 bg-amber-50/50 hover:bg-amber-50 text-left transition-all cursor-pointer group"
              >
                <div className="text-xs font-black text-slate-900 group-hover:text-amber-700 flex items-center justify-between">
                  <span>Kenji Tan</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 font-bold text-amber-900">Pro</span>
                </div>
                <div className="text-[10px] text-amber-700 mt-0.5">Pro unlimited plan</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
