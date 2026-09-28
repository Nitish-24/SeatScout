import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  X, 
  AlertCircle,
  MessageCircle, 
  Mail,
  ShieldCheck,
  ArrowRight,
  Edit2
} from 'lucide-react';
import { PhoneNotificationClient } from '../services/phoneNotificationClient';

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
  const [phoneDigits, setPhoneDigits] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [enableWhatsapp, setEnableWhatsapp] = useState<boolean>(true);
  const [enableEmail, setEnableEmail] = useState<boolean>(true);

  const [savedPhone, setSavedPhone] = useState<string | null>(null);
  const [savedEmail, setSavedEmail] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing saved alert credentials on open
  useEffect(() => {
    if (!isOpen) return;
    const phone = PhoneNotificationClient.getSavedPhone();
    const em = PhoneNotificationClient.getSavedEmail();

    setSavedPhone(phone);
    setSavedEmail(em);

    if (phone) {
      const digits = phone.replace(/^\+91/, '').replace(/\D/g, '').slice(0, 10);
      setPhoneDigits(digits);
      setEnableWhatsapp(true);
    }
    if (em) {
      setEmail(em);
      setEnableEmail(true);
    }

    if (phone || em) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
    setError(null);
    setSuccessMsg(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const isConfigured = !isEditing && (savedPhone || savedEmail);

  const handleSaveAlerts = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!enableWhatsapp && !enableEmail) {
      setError('Please choose at least one alert option (WhatsApp or Email).');
      return;
    }

    let fullPhone = '';
    if (enableWhatsapp) {
      const cleanDigits = phoneDigits.replace(/\D/g, '');
      if (!cleanDigits) {
        setError('Please enter your 10-digit WhatsApp number.');
        return;
      }
      if (cleanDigits.length !== 10) {
        setError(`Please enter a valid 10-digit mobile number (${cleanDigits.length}/10 digits entered).`);
        return;
      }
      if (!/^[6-9]\d{9}$/.test(cleanDigits)) {
        setError('Mobile number must start with 6, 7, 8, or 9.');
        return;
      }
      fullPhone = `+91${cleanDigits}`;
    }

    let cleanEmail = '';
    if (enableEmail) {
      cleanEmail = email.trim();
      if (!cleanEmail) {
        setError('Please enter your email address.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        setError('Please enter a valid email address (e.g., name@example.com).');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await PhoneNotificationClient.activateAlerts({
        phone: fullPhone || undefined,
        email: cleanEmail || undefined
      });

      if (res.success) {
        setSavedPhone(fullPhone || null);
        setSavedEmail(cleanEmail || null);
        setIsEditing(false);
        setSuccessMsg('Your WhatsApp & Email alert preferences are now active!');
        if (fullPhone && onPhoneVerified) {
          onPhoneVerified(fullPhone);
        }
      } else {
        setError(res.message || 'Could not save alert preferences. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save alert preferences.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAlerts = () => {
    PhoneNotificationClient.clearAlertPreferences();
    setSavedPhone(null);
    setSavedEmail(null);
    setPhoneDigits('');
    setEmail('');
    setIsEditing(true);
    setError(null);
    setSuccessMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              WhatsApp & Email Alerts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Get notified immediately the second Indian Railways releases Current Booking seats.
            </p>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-start space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMsg}</span>
          </div>
        )}

        {/* ACTIVE STATE VIEW (Already configured) */}
        {isConfigured && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Seat Alerts Active
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold flex items-center space-x-1 cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
              </div>

              {/* Channels summary */}
              <div className="space-y-2 pt-1">
                {savedPhone && (
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200 dark:border-slate-800">
                    <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>WhatsApp:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{savedPhone}</span>
                  </div>
                )}

                {savedEmail && (
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200 dark:border-slate-800">
                    <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>Email:</span>
                    <span className="text-blue-600 dark:text-blue-400">{savedEmail}</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600 dark:text-emerald-200/80 leading-relaxed pt-1">
                Whenever Current Booking berths open on your monitored trains, you will immediately receive a direct booking alert!
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer text-center"
              >
                Done
              </button>

              <button
                type="button"
                onClick={handleClearAlerts}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer shrink-0"
              >
                Turn Off
              </button>
            </div>
          </div>
        )}

        {/* INPUT / EDIT FORM VIEW */}
        {!isConfigured && (
          <form onSubmit={handleSaveAlerts} className="space-y-4">
            
            {/* WHATSAPP ALERT OPTION */}
            <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
              enableWhatsapp 
                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40' 
                : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="enable-whatsapp" 
                  className="flex items-center space-x-2.5 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id="enable-whatsapp"
                    checked={enableWhatsapp}
                    onChange={(e) => setEnableWhatsapp(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900 dark:text-white">
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    <span>WhatsApp Alerts</span>
                  </div>
                </label>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                  Instant
                </span>
              </div>

              {enableWhatsapp && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-stretch gap-2">
                    {/* Fixed India Country Code */}
                    <div className="flex items-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 select-none shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>

                    {/* 10-Digit Mobile Input */}
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      placeholder="Enter 10-digit WhatsApp number"
                      value={phoneDigits}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneDigits(val);
                        if (error) setError(null);
                      }}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-1">
                    {phoneDigits.length === 10
                      ? '✓ 10-digit number ready'
                      : 'Enter your 10-digit Indian WhatsApp mobile number.'}
                  </div>
                </div>
              )}
            </div>

            {/* EMAIL ALERT OPTION */}
            <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
              enableEmail 
                ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-300 dark:border-blue-500/40' 
                : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 opacity-70'
            }`}>
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="enable-email" 
                  className="flex items-center space-x-2.5 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id="enable-email"
                    checked={enableEmail}
                    onChange={(e) => setEnableEmail(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-slate-900 dark:text-white">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span>Email Alerts</span>
                  </div>
                </label>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                  Detailed
                </span>
              </div>

              {enableEmail && (
                <div className="space-y-1.5 pt-1">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-1">
                    Receive long-form seat vacancy dossiers and direct IRCTC booking links.
                  </div>
                </div>
              )}
            </div>

            {/* Direct Activation Button (NO OTP) */}
            <button
              type="submit"
              disabled={loading || (!enableWhatsapp && !enableEmail)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {loading ? (
                <span>Activating Alerts...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Save & Activate Alerts</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            {savedPhone || savedEmail ? (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors py-1 cursor-pointer"
              >
                Cancel
              </button>
            ) : null}

          </form>
        )}

      </div>
    </div>
  );
};
