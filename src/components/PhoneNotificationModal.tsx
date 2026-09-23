import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Clock, 
  RefreshCw, 
  X, 
  AlertCircle,
  Bell,
  MessageSquare,
  MessageCircle,
  Sparkles,
  ExternalLink,
  KeyRound
} from 'lucide-react';
import { PhoneNotificationClient, PhoneStatusResponse } from '../services/phoneNotificationClient';

interface PhoneNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhoneVerified?: (phone: string) => void;
}

export const PhoneNotificationModal: React.FC<PhoneNotificationModalProps> = ({
  isOpen,
  onClose,
  onPhoneVerified
}) => {
  const [phone, setPhone] = useState<string>('');
  const [phoneDigits, setPhoneDigits] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [step, setStep] = useState<'input_phone' | 'input_otp' | 'verified'>('input_phone');
  const [channel, setChannel] = useState<'WHATSAPP' | 'SMS'>('WHATSAPP');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Fallback and Direct Link states
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [whatsappDirectUrl, setWhatsappDirectUrl] = useState<string | null>(null);
  const [isOAuthError, setIsOAuthError] = useState<boolean>(false);

  // Status for verified phone
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [verifiedInfo, setVerifiedInfo] = useState<PhoneStatusResponse | null>(null);

  // Test Alert state
  const [testSending, setTestSending] = useState<boolean>(false);
  const [lastSentAlert, setLastSentAlert] = useState<{
    messageText: string;
    timestamp: string;
    channel: string;
  } | null>(null);

  // Load existing verified phone on mount or open
  useEffect(() => {
    if (!isOpen) return;
    const saved = PhoneNotificationClient.getSavedPhone();
    if (saved) {
      setVerifiedPhone(saved);
      setPhone(saved);
      const digits = saved.replace(/^\+91/, '').replace(/\D/g, '').slice(0, 10);
      setPhoneDigits(digits);
      setStep('verified');
      checkStatus(saved);
    } else {
      setStep('input_phone');
    }
  }, [isOpen]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // 30-Second Cooldown timer for Resend OTP button
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const checkStatus = async (phoneNumber: string) => {
    try {
      const res = await PhoneNotificationClient.getPhoneStatus(phoneNumber);
      setVerifiedInfo(res);
    } catch (e) {
      console.warn('Could not fetch phone status:', e);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setDevOtp(null);
    setWhatsappDirectUrl(null);
    setIsOAuthError(false);

    // Min and Max 10 digits validation
    const cleanDigits = phoneDigits.replace(/\D/g, '');
    if (!cleanDigits) {
      setError('Please enter your 10-digit mobile number.');
      return;
    }
    if (cleanDigits.length < 10) {
      setError(`Minimum 10 digits required for mobile number (currently entered ${cleanDigits.length} digits).`);
      return;
    }
    if (cleanDigits.length > 10) {
      setError(`Maximum 10 digits allowed for mobile number (currently entered ${cleanDigits.length} digits).`);
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    const fullPhone = `+91${cleanDigits}`;
    setPhone(fullPhone);
    setLoading(true);

    try {
      // Trigger OTP request through Meta WhatsApp API or SMS
      const res = await PhoneNotificationClient.verifyPhone(fullPhone, undefined, channel);
      if (res.success) {
        setStep('input_otp');
        setCountdown(res.expiresInSeconds || 300);
        setResendCooldown(30); // 30-second cooldown period before Resend OTP button becomes active
        setSuccessMsg(res.message);
        if (res.devOtp) setDevOtp(res.devOtp);
        if (res.whatsappDirectUrl) setWhatsappDirectUrl(res.whatsappDirectUrl);
        if (res.isOAuthError) setIsOAuthError(true);
      } else {
        setError(res.message || `Failed to dispatch code via ${channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'}.`);
      }
    } catch (err: any) {
      setError(err.message || 'Network error while contacting notification gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading || !phone) return;
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await PhoneNotificationClient.verifyPhone(phone, undefined, channel);
      if (res.success) {
        setCountdown(res.expiresInSeconds || 300);
        setResendCooldown(30); // Reset 30-second cooldown period
        setSuccessMsg(`A new 6-digit verification code has been dispatched via ${channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'}.`);
        if (res.devOtp) setDevOtp(res.devOtp);
        if (res.whatsappDirectUrl) setWhatsappDirectUrl(res.whatsappDirectUrl);
        if (res.isOAuthError) setIsOAuthError(true);
      } else {
        setError(res.message || 'Failed to resend verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error while contacting notification gateway.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      // Validate OTP via verifyPhone API endpoint before enabling alerts
      const res = await PhoneNotificationClient.verifyPhone(phone, otp.trim());
      if (res.success && res.verified) {
        setVerifiedPhone(res.phone);
        setStep('verified');
        setSuccessMsg(res.message || 'Verification code validated successfully! 24/7 seat release alerts are now enabled.');
        checkStatus(res.phone);
        if (onPhoneVerified) onPhoneVerified(res.phone);
      } else {
        setError(res.message || 'Invalid or expired verification code. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestAlert = async (alertChannel: 'WHATSAPP' | 'SMS' | 'BOTH' = 'WHATSAPP') => {
    if (!verifiedPhone) return;
    setTestSending(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await PhoneNotificationClient.sendTestAlert({
        phone: verifiedPhone,
        trainNumber: '12012',
        trainName: 'Kalka Shatabdi Express',
        fromStation: 'CDG',
        toStation: 'NDLS',
        journeyDate: new Date().toISOString().split('T')[0],
        travelClass: 'CC',
        quota: 'GN',
        availableBerths: 4,
        channel: alertChannel
      });

      if (res.success) {
        setLastSentAlert({
          messageText: res.messageText,
          timestamp: new Date().toLocaleTimeString(),
          channel: alertChannel
        });
        const chanName = alertChannel === 'WHATSAPP' ? 'WhatsApp' : alertChannel === 'SMS' ? 'SMS' : 'WhatsApp + Web Push';
        setSuccessMsg(`Sample seat alert delivered via ${chanName} to ${verifiedPhone}!`);
        checkStatus(verifiedPhone);
      } else {
        setError(res.error || 'Failed to dispatch sample alert');
      }
    } catch (err: any) {
      setError(err.message || 'Error sending test alert.');
    } finally {
      setTestSending(false);
    }
  };

  const handleResetPhone = () => {
    PhoneNotificationClient.clearVerifiedPhone();
    setVerifiedPhone(null);
    setVerifiedInfo(null);
    setOtp('');
    setDevOtp(null);
    setWhatsappDirectUrl(null);
    setIsOAuthError(false);
    setSuccessMsg(null);
    setError(null);
    setStep('input_phone');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            {channel === 'WHATSAPP' ? (
              <MessageCircle className="w-6 h-6 text-emerald-400" />
            ) : (
              <Smartphone className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center space-x-2">
              <span>WhatsApp & SMS Alerts</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Meta Cloud API
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Verify your mobile number to receive instant seat alerts directly on WhatsApp or SMS.
            </p>
          </div>
        </div>

        {/* Success / Error Banners */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && !isOAuthError && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Phone Input & Channel Selection */}
        {step === 'input_phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            
            {/* Delivery Channel Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Verification Channel
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setChannel('WHATSAPP')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    channel === 'WHATSAPP'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp (Meta API)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('SMS')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    channel === 'SMS'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <span>Standard SMS</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Mobile Number
                </label>
                <span className={`text-[11px] font-mono font-bold ${phoneDigits.length === 10 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {phoneDigits.length}/10 digits
                </span>
              </div>

              <div className="flex items-stretch gap-2">
                {/* Fixed Country Code Section: India +91 */}
                <div 
                  className="flex items-center space-x-2 px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 select-none shrink-0 shadow-inner"
                  title="Fixed to India (+91)"
                >
                  <span className="text-base leading-none" role="img" aria-label="India">🇮🇳</span>
                  <span className="text-xs font-bold text-white font-mono">+91</span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/60">
                    India
                  </span>
                </div>

                {/* 10-Digit Mobile Number Input */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="9876543210"
                    value={phoneDigits}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneDigits(val);
                      if (error) setError(null);
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 tracking-wider"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-0.5">
                <span className={phoneDigits.length === 10 ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                  {phoneDigits.length === 10
                    ? '✓ 10-digit mobile number ready'
                    : phoneDigits.length === 0
                    ? 'Enter 10-digit Indian mobile number'
                    : `${10 - phoneDigits.length} digit${10 - phoneDigits.length === 1 ? '' : 's'} remaining`}
                </span>
                {phoneDigits.length === 10 && !/^[6-9]/.test(phoneDigits) && (
                  <span className="text-amber-400/90 text-[10px]">
                    Must start with 6-9
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 pt-1">
                {channel === 'WHATSAPP' 
                  ? 'A 6-digit verification code will be dispatched to your WhatsApp via Meta Cloud API.'
                  : 'A 6-digit verification code will be sent to your mobile phone via SMS.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || phoneDigits.length !== 10}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Dispatching Code...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>Send Verification Code via {channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 'input_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[11px]">
                  Verification code requested via {channel === 'WHATSAPP' ? 'WhatsApp' : 'SMS'} for:
                </span>
                <div className="font-mono font-bold text-white text-sm">{phone}</div>
              </div>
              <button
                type="button"
                onClick={() => setStep('input_phone')}
                className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* If devOtp / OAuth helper card is present */}
            {devOtp && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Your Verification Code
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-extrabold text-[11px] border border-amber-500/40 transition-colors cursor-pointer"
                  >
                    Auto-fill Code
                  </button>
                </div>

                <div className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-slate-950/80 border border-amber-500/20">
                  <span className="font-mono text-2xl font-black tracking-[0.35em] text-white">
                    {devOtp}
                  </span>
                </div>

                {isOAuthError && (
                  <div className="text-[11px] text-amber-300/80 leading-relaxed space-y-1">
                    <p>
                      <strong>Meta WhatsApp API Note:</strong> Meta returned <code className="bg-amber-950/80 px-1 py-0.5 rounded text-amber-200">OAuthException</code> because the token is not an official Meta System User token.
                    </p>
                    <p className="text-slate-400 text-[10px]">
                      Automated cloud WhatsApp delivery requires a Meta Graph token (starts with <code className="text-emerald-400">EAA...</code>) from developers.facebook.com. You can use the generated verification code above to verify immediately!
                    </p>
                  </div>
                )}

                {whatsappDirectUrl && (
                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-slate-950" />
                    <span>Open Code in WhatsApp Web / App</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-950 ml-1" />
                  </a>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Enter 6-Digit Verification Code
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  {otp.length}/6 digits
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.4em] font-mono text-xl py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
              <div className="flex items-center space-x-1.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Expires in: <strong className="text-slate-200">{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</strong></span>
              </div>

              {/* 30-Second Cooldown Resend OTP Button */}
              {resendCooldown > 0 ? (
                <div 
                  className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 select-none"
                  title="Please wait for the 30-second cooldown before requesting a new code"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
                  <span>Resend in <strong className="text-amber-400 font-mono font-bold">{resendCooldown}s</strong></span>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleResendOtp}
                  className="flex items-center space-x-1.5 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-bold transition-all cursor-pointer shadow-sm"
                  title="Request a new 6-digit verification code"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-time seat alerts will be enabled immediately once this code is verified.</span>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-950" />
                  <span>Verify & Activate Alerts</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Verified Phone & Test Alert Actions */}
        {step === 'verified' && verifiedPhone && (
          <div className="space-y-5">
            {/* Active Status Box */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                    Phone Verified & Active
                  </span>
                </div>
                <button
                  onClick={handleResetPhone}
                  className="text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Change Number
                </button>
              </div>

              <div className="font-mono text-xl font-black text-white">
                {verifiedPhone}
              </div>

              <p className="text-xs text-emerald-200/90 leading-relaxed">
                When Indian Railways Current Booking berths become available, an instant notification will be delivered directly to your device!
              </p>
            </div>

            {/* Test Action Buttons */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Dispatch Sample Alert</span>
                <span className="text-[11px] text-slate-400 font-medium">Verify delivery</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => handleSendTestAlert('WHATSAPP')}
                  disabled={testSending}
                  className="py-2.5 px-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>{testSending ? 'Sending...' : 'Test WhatsApp'}</span>
                </button>

                <button
                  onClick={() => handleSendTestAlert('SMS')}
                  disabled={testSending}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  <span>{testSending ? 'Sending...' : 'Test SMS'}</span>
                </button>
              </div>

              <button
                onClick={() => handleSendTestAlert('BOTH')}
                disabled={testSending}
                className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <Bell className="w-4 h-4 text-slate-950" />
                <span>{testSending ? 'Sending...' : 'Test WhatsApp/SMS + Web Push'}</span>
              </button>
            </div>

            {/* Last Sent Alert preview */}
            {lastSentAlert && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-400 text-[10px]">
                  <span className="font-bold text-emerald-400">Dispatched Payload</span>
                  <span className="font-mono">{new Date(lastSentAlert.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-200 font-mono text-[11px] leading-relaxed">
                  {lastSentAlert.messageText}
                </p>
              </div>
            )}

            {/* History logs if any */}
            {verifiedInfo?.alertHistory && verifiedInfo.alertHistory.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Sent Notifications ({verifiedInfo.alertHistory.length})
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1 text-[11px]">
                  {verifiedInfo.alertHistory.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-2 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-between">
                      <span className="truncate pr-2 text-slate-300">{item.message}</span>
                      <span className="font-mono text-[10px] text-emerald-400 shrink-0">{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Done & Return to Radar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
