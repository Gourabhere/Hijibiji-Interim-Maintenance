import React, { useState, useRef, useEffect } from 'react';
import { Shield, Phone, CheckCircle2, X, AlertTriangle, Send, KeyRound, RefreshCw, Mail } from 'lucide-react';

interface Props {
    flatNo: string;
    ownerName: string;
    onVerified: () => void;
    onCancel: () => void;
}

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;
const SUPABASE_URL = 'https://bhdrlzaqejkrqsozbcbr.supabase.co';

type SendMethod = 'sms' | 'email';

const OtpVerification: React.FC<Props> = ({ flatNo, ownerName, onVerified, onCancel }) => {
    const [step, setStep] = useState<'input' | 'otp'>('input');
    const [method, setMethod] = useState<SendMethod>('sms');
    const [phoneInput, setPhoneInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const otpInputRef = useRef<HTMLInputElement>(null);
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Auto-focus
    useEffect(() => {
        if (step === 'input') {
            if (method === 'sms' && phoneInputRef.current) phoneInputRef.current.focus();
            if (method === 'email' && emailInputRef.current) emailInputRef.current.focus();
        }
        if (step === 'otp' && otpInputRef.current) otpInputRef.current.focus();
    }, [step, method]);

    const isInputValid = () => {
        if (method === 'sms') return phoneInput.replace(/\D/g, '').slice(-10).length === 10;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim());
    };

    const handleSendOtp = async () => {
        setError('');

        if (method === 'sms') {
            const cleaned = phoneInput.trim().replace(/\D/g, '').slice(-10);
            if (cleaned.length < 10) {
                setError('Please enter a valid 10-digit phone number.');
                return;
            }
        } else {
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
                setError('Please enter a valid email address.');
                return;
            }
        }

        setIsLoading(true);
        try {
            const body: any = { flatNo, method };
            if (method === 'sms') body.phone = phoneInput.trim().replace(/\D/g, '').slice(-10);
            else body.email = emailInput.trim().toLowerCase();

            const res = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                setError(data.error || 'Failed to send code. Please try again.');
                setIsLoading(false);
                return;
            }

            setStep('otp');
            setResendCooldown(RESEND_COOLDOWN);
        } catch (err: any) {
            setError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError('');
        if (otpInput.length !== CODE_LENGTH) {
            setError(`Please enter the ${CODE_LENGTH}-digit code.`);
            return;
        }

        setIsLoading(true);
        try {
            const body: any = { code: otpInput };
            if (method === 'sms') body.phone = phoneInput.trim().replace(/\D/g, '').slice(-10);
            else body.email = emailInput.trim().toLowerCase();

            const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (data.verified) {
                onVerified();
            } else {
                setError(data.error || 'Invalid or expired code. Please try again.');
                setOtpInput('');
            }
        } catch (err: any) {
            setError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setError('');
        setOtpInput('');
        setIsLoading(true);

        try {
            const body: any = { flatNo, method };
            if (method === 'sms') body.phone = phoneInput.trim().replace(/\D/g, '').slice(-10);
            else body.email = emailInput.trim().toLowerCase();

            const res = await fetch(`${SUPABASE_URL}/functions/v1/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok || data.error) {
                setError(data.error || 'Failed to resend code.');
            } else {
                setResendCooldown(RESEND_COOLDOWN);
            }
        } catch (err: any) {
            setError('Network error. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isInputValid()) handleSendOtp();
    };

    const handleOtpKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && otpInput.length === CODE_LENGTH) handleVerifyOtp();
    };

    const maskedRecipient = () => {
        if (method === 'sms') {
            const p = phoneInput.replace(/\D/g, '').slice(-10);
            return `+91 ${p.slice(0, 2)}****${p.slice(-4)}`;
        }
        const e = emailInput.trim();
        const [local, domain] = e.split('@');
        return `${local.slice(0, 2)}***@${domain}`;
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 border border-slate-200 dark:border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-500/15 rounded-xl">
                            <Shield size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm text-slate-900 dark:text-white">Verification</h3>
                            <p className="text-[10px] text-slate-500 dark:text-white/50 font-bold uppercase tracking-wider">Flat {flatNo}</p>
                        </div>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <X size={18} className="text-slate-400" />
                    </button>
                </div>

                {step === 'input' ? (
                    <>
                        {/* Method Toggle */}
                        <div className="flex gap-2 mb-5 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
                            <button
                                onClick={() => { setMethod('sms'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${method === 'sms'
                                    ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60'
                                    }`}
                            >
                                <Phone size={14} /> SMS
                            </button>
                            <button
                                onClick={() => { setMethod('email'); setError(''); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${method === 'email'
                                    ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/60'
                                    }`}
                            >
                                <Mail size={14} /> Email
                            </button>
                        </div>

                        {/* Info Box */}
                        <div className="rounded-2xl p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-5">
                            <div className="flex items-start gap-3">
                                {method === 'sms' ? (
                                    <Phone size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                    <Mail size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                                )}
                                <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
                                    {method === 'sms'
                                        ? <>Enter your <strong>phone number</strong>. A verification code will be sent via SMS.</>
                                        : <>Enter your <strong>email address</strong>. A verification code will be sent to your inbox.</>
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Input Field */}
                        <div className="mb-4">
                            <label className="text-[9px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-wider mb-2 block">
                                {method === 'sms' ? 'Phone Number' : 'Email Address'}
                            </label>
                            {method === 'sms' ? (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-slate-400 dark:text-white/30 pl-1">+91</span>
                                    <input
                                        ref={phoneInputRef}
                                        type="tel"
                                        value={phoneInput}
                                        onChange={(e) => { setPhoneInput(e.target.value.replace(/[^0-9]/g, '')); setError(''); }}
                                        onKeyDown={handleInputKeyDown}
                                        placeholder="10-digit number"
                                        className="flex-1 h-14 bg-transparent neo-inset rounded-2xl px-4 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-lg placeholder:text-slate-300 dark:placeholder:text-white/20 font-bold text-slate-900 dark:text-white tracking-wider"
                                        maxLength={10}
                                        autoComplete="off"
                                    />
                                </div>
                            ) : (
                                <input
                                    ref={emailInputRef}
                                    type="email"
                                    value={emailInput}
                                    onChange={(e) => { setEmailInput(e.target.value); setError(''); }}
                                    onKeyDown={handleInputKeyDown}
                                    placeholder="your@email.com"
                                    className="w-full h-14 bg-transparent neo-inset rounded-2xl px-4 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-base placeholder:text-slate-300 dark:placeholder:text-white/20 font-bold text-slate-900 dark:text-white"
                                    autoComplete="off"
                                />
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <AlertTriangle size={14} className="text-rose-500 flex-shrink-0" />
                                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleSendOtp}
                            disabled={!isInputValid() || isLoading}
                            className={`w-full py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] text-sm ${isInputValid() && !isLoading
                                ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/20 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {isLoading ? (
                                <><RefreshCw size={16} className="animate-spin" /> Sending...</>
                            ) : (
                                <><Send size={16} /> Send Code via {method === 'sms' ? 'SMS' : 'Email'}</>
                            )}
                        </button>

                        {method === 'sms' && (
                            <p className="text-center text-[10px] text-slate-400 dark:text-white/30 mt-3">
                                SMS not working? Try <button onClick={() => { setMethod('email'); setError(''); }} className="text-indigo-500 font-bold hover:underline">Email</button> instead
                            </p>
                        )}

                        <button
                            onClick={onCancel}
                            className="w-full mt-3 py-3 text-slate-400 dark:text-white/40 font-bold text-xs uppercase tracking-wider hover:text-slate-600 dark:hover:text-white/60 transition-colors"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    /* Step 2: Enter OTP */
                    <>
                        <div className="rounded-2xl p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 mb-5">
                            <div className="flex items-start gap-3">
                                <KeyRound size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs text-slate-600 dark:text-white/70 leading-relaxed">
                                        A {CODE_LENGTH}-digit verification code has been sent to <strong>{maskedRecipient()}</strong>
                                    </p>
                                    <p className="text-[10px] text-slate-400 dark:text-white/40 mt-1">
                                        {method === 'sms' ? 'Check your SMS messages' : 'Check your email inbox (and spam)'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-[9px] text-slate-400 dark:text-white/40 font-bold uppercase tracking-wider mb-2 block text-center">
                                Enter Verification Code
                            </label>
                            <input
                                ref={otpInputRef}
                                type="text"
                                inputMode="numeric"
                                value={otpInput}
                                onChange={(e) => { setOtpInput(e.target.value.replace(/[^0-9]/g, '').slice(0, CODE_LENGTH)); setError(''); }}
                                onKeyDown={handleOtpKeyDown}
                                placeholder="• • • • • •"
                                className="w-full h-16 bg-transparent neo-inset rounded-2xl px-4 outline-none focus:ring-2 ring-emerald-500/50 transition-all text-2xl placeholder:text-slate-300 dark:placeholder:text-white/20 font-black text-slate-900 dark:text-white tracking-[0.5em] text-center"
                                maxLength={CODE_LENGTH}
                                autoComplete="one-time-code"
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <AlertTriangle size={14} className="text-rose-500 flex-shrink-0" />
                                <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">{error}</p>
                            </div>
                        )}

                        <button
                            onClick={handleVerifyOtp}
                            disabled={otpInput.length !== CODE_LENGTH || isLoading}
                            className={`w-full py-4 font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] text-sm ${otpInput.length === CODE_LENGTH && !isLoading
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-white/20 cursor-not-allowed shadow-none'
                                }`}
                        >
                            {isLoading ? (
                                <><RefreshCw size={16} className="animate-spin" /> Verifying...</>
                            ) : (
                                <><CheckCircle2 size={16} /> Verify & Open Portal</>
                            )}
                        </button>

                        {/* Resend & Back */}
                        <div className="flex items-center justify-between mt-4">
                            <button
                                onClick={() => { setStep('input'); setOtpInput(''); setError(''); }}
                                className="text-xs text-slate-400 dark:text-white/40 font-bold hover:text-slate-600 dark:hover:text-white/60 transition-colors"
                            >
                                ← Change {method === 'sms' ? 'number' : 'email'}
                            </button>
                            <button
                                onClick={handleResendOtp}
                                disabled={resendCooldown > 0 || isLoading}
                                className={`text-xs font-bold transition-colors ${resendCooldown > 0
                                    ? 'text-slate-300 dark:text-white/20 cursor-not-allowed'
                                    : 'text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300'
                                    }`}
                            >
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                            </button>
                        </div>

                        <button
                            onClick={onCancel}
                            className="w-full mt-3 py-3 text-slate-400 dark:text-white/40 font-bold text-xs uppercase tracking-wider hover:text-slate-600 dark:hover:text-white/60 transition-colors"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default OtpVerification;
