import React, { useState, useRef, useEffect } from 'react';
import { Shield, Phone, CheckCircle2, X, AlertTriangle, Send, KeyRound, RefreshCw, Mail, Lock } from 'lucide-react';

interface Props {
    flatNo: string;
    ownerName: string;
    onVerified: () => void;
    onCancel: () => void;
}

const CODE_LENGTH = 6;
const PIN_LENGTH = 4;
const RESEND_COOLDOWN = 60;
const SUPABASE_URL = 'https://bhdrlzaqejkrqsozbcbr.supabase.co';

type SendMethod = 'sms' | 'email';
type Step = 'checking' | 'pin-entry' | 'input' | 'otp' | 'pin-setup';

const OtpVerification: React.FC<Props> = ({ flatNo, ownerName, onVerified, onCancel }) => {
    const [step, setStep] = useState<Step>('checking');
    const [method, setMethod] = useState<SendMethod>('sms');

    // Inputs
    const [phoneInput, setPhoneInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [otpInput, setOtpInput] = useState('');
    const [pinInput, setPinInput] = useState('');
    const [confirmPinInput, setConfirmPinInput] = useState('');

    // State
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [hasPin, setHasPin] = useState(false);

    // Refs
    const phoneInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const otpInputRef = useRef<HTMLInputElement>(null);
    const pinInputRef = useRef<HTMLInputElement>(null);

    // Check for PIN on mount
    useEffect(() => {
        const checkPin = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${SUPABASE_URL}/functions/v1/check-pin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ flatNo }),
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.hasPin && !data.isLocked) {
                        setHasPin(true);
                        setStep('pin-entry');
                    } else {
                        // No PIN or locked -> go to OTP flow
                        if (data.isLocked) setError('Account locked due to too many failed attempts. Please verify via OTP.');
                        setStep('input');
                    }
                } else {
                    setStep('input');
                }
            } catch (err) {
                console.error(err);
                setStep('input');
            } finally {
                setIsLoading(false);
            }
        };
        checkPin();
    }, [flatNo]);

    // Resend timer
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
        if ((step === 'pin-entry' || step === 'pin-setup') && pinInputRef.current) pinInputRef.current.focus();
    }, [step, method]);

    const isInputValid = () => {
        if (method === 'sms') return phoneInput.replace(/\D/g, '').slice(-10).length === 10;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim());
    };

    const handleSendOtp = async () => {
        setError('');
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
                setError(data.error || 'Failed to send code.');
                setIsLoading(false);
                return;
            }

            setStep('otp');
            setResendCooldown(RESEND_COOLDOWN);
        } catch (err) {
            setError('Network error.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError('');
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
                // If user already has PIN (and forgot it), or no PIN -> offer to set PIN
                setStep('pin-setup');
                setPinInput('');
                setConfirmPinInput('');
            } else {
                setError(data.error || 'Invalid code.');
            }
        } catch (err) {
            setError('Network error.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyPin = async () => {
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flatNo, pin: pinInput }),
            });
            const data = await res.json();

            if (data.verified) {
                if (data.isDefault) {
                    setStep('pin-setup');
                    setPinInput('');
                    setConfirmPinInput('');
                    setError('Default PIN detected. Please set a personal PIN.');
                } else {
                    onVerified();
                }
            } else {
                setError(data.error || 'Incorrect PIN.');
                // If confirmed locked, force OTP
                if (data.error && data.error.includes('locked')) {
                    setTimeout(() => {
                        setStep('input');
                        setPinInput('');
                    }, 2000);
                } else {
                    setPinInput('');
                }
            }
        } catch (err) {
            setError('Network error.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSetPin = async () => {
        if (pinInput.length !== PIN_LENGTH) { setError('PIN must be 4 digits'); return; }
        if (pinInput !== confirmPinInput) { setError('PINs do not match'); return; }

        setError('');
        setIsLoading(true);
        try {
            const res = await fetch(`${SUPABASE_URL}/functions/v1/set-pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flatNo, pin: pinInput }),
            });

            if (res.ok) {
                onVerified();
            } else {
                setError('Failed to set PIN.');
            }
        } catch (err) {
            setError('Network error.');
        } finally {
            setIsLoading(false);
        }
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
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                        <X size={18} className="text-slate-400" />
                    </button>
                </div>

                {step === 'checking' && (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <RefreshCw size={24} className="text-indigo-500 animate-spin" />
                        <p className="text-xs text-slate-400 font-bold">Checking security setting...</p>
                    </div>
                )}

                {step === 'pin-entry' && (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Enter Access PIN</h2>
                            <p className="text-xs text-slate-500 dark:text-white/60">Enter the 4-digit PIN for your flat</p>
                        </div>
                        <div className="mb-6">
                            <input
                                ref={pinInputRef}
                                type="password"
                                inputMode="numeric"
                                value={pinInput}
                                onChange={(e) => { setPinInput(e.target.value.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH)); setError(''); }}
                                onKeyDown={(e) => e.key === 'Enter' && pinInput.length === PIN_LENGTH && handleVerifyPin()}
                                placeholder="• • • •"
                                className="w-full h-16 bg-slate-50 dark:bg-white/5 rounded-2xl text-center text-3xl font-black tracking-[1em] outline-none focus:ring-2 ring-indigo-500/50"
                                maxLength={PIN_LENGTH}
                            />
                        </div>
                        {error && <p className="text-xs text-rose-500 font-bold text-center mb-4">{error}</p>}
                        <button
                            onClick={handleVerifyPin}
                            disabled={pinInput.length !== PIN_LENGTH || isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl mb-4 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Verifying...' : 'Unlock Portal'}
                        </button>
                        <button onClick={() => { setStep('input'); setPinInput(''); }} className="w-full text-xs text-slate-400 font-bold hover:text-indigo-500">
                            Forgot PIN? verify via OTP
                        </button>
                    </>
                )}

                {step === 'input' && (
                    <>
                        <div className="flex gap-2 mb-5 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
                            <button onClick={() => setMethod('sms')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${method === 'sms' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>SMS</button>
                            <button onClick={() => setMethod('email')} className={`flex-1 py-2 rounded-xl text-xs font-bold ${method === 'email' ? 'bg-white shadow text-indigo-600' : 'text-slate-400'}`}>Email</button>
                        </div>
                        <div className="mb-4">
                            <input
                                ref={method === 'sms' ? phoneInputRef : emailInputRef}
                                type={method === 'sms' ? 'tel' : 'email'}
                                value={method === 'sms' ? phoneInput : emailInput}
                                onChange={(e) => method === 'sms' ? setPhoneInput(e.target.value) : setEmailInput(e.target.value)}
                                placeholder={method === 'sms' ? "Phone Number" : "Email Address"}
                                className="w-full h-14 bg-slate-50 dark:bg-white/5 rounded-2xl px-4 font-bold outline-none focus:ring-2 ring-indigo-500/50"
                            />
                        </div>
                        {error && <p className="text-xs text-rose-500 font-bold mb-4">{error}</p>}
                        <button onClick={handleSendOtp} disabled={!isInputValid() || isLoading} className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl">
                            {isLoading ? 'Sending...' : 'Send Code'}
                        </button>
                    </>
                )}

                {step === 'otp' && (
                    <>
                        <p className="text-xs text-center text-slate-500 mb-4">Code sent to {maskedRecipient()}</p>
                        <input
                            ref={otpInputRef}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.slice(0, CODE_LENGTH))}
                            className="w-full h-16 bg-slate-50 dark:bg-white/5 rounded-2xl text-center text-2xl font-black tracking-[0.5em] mb-4 outline-none focus:ring-2 ring-emerald-500"
                            placeholder="• • • • • •"
                        />
                        {error && <p className="text-xs text-rose-500 font-bold text-center mb-4">{error}</p>}
                        <button onClick={handleVerifyOtp} disabled={otpInput.length !== CODE_LENGTH || isLoading} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl">
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </button>
                    </>
                )}

                {step === 'pin-setup' && (
                    <>
                        <div className="text-center mb-6">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Set Quick Access PIN</h2>
                            <p className="text-xs text-slate-500 dark:text-white/60">Set a 4-digit PIN for faster access next time</p>
                        </div>
                        <div className="space-y-4 mb-6">
                            <input
                                ref={pinInputRef}
                                type="number"
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value.slice(0, PIN_LENGTH))}
                                placeholder="New PIN"
                                className="w-full h-14 bg-slate-50 dark:bg-white/5 rounded-2xl text-center text-xl font-bold tracking-widest outline-none focus:ring-2 ring-indigo-500/50"
                            />
                            <input
                                type="number"
                                value={confirmPinInput}
                                onChange={(e) => setConfirmPinInput(e.target.value.slice(0, PIN_LENGTH))}
                                placeholder="Confirm PIN"
                                className="w-full h-14 bg-slate-50 dark:bg-white/5 rounded-2xl text-center text-xl font-bold tracking-widest outline-none focus:ring-2 ring-indigo-500/50"
                            />
                        </div>
                        {error && <p className="text-xs text-rose-500 font-bold text-center mb-4">{error}</p>}
                        <button
                            onClick={handleSetPin}
                            disabled={pinInput.length !== PIN_LENGTH || pinInput !== confirmPinInput || isLoading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Saving...' : 'Set PIN & Enter'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default OtpVerification;
