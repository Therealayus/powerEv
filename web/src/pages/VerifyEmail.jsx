import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendVerificationOtp, verifyEmail } from '../api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { completeVerification } = useAuth();
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !otp.trim()) {
      setError('Enter email and 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { data } = await verifyEmail(email.trim(), otp.trim());
      if (data.user?.role !== 'partner' && data.user?.role !== 'admin') {
        setError('Partner or admin account required.');
        setLoading(false);
        return;
      }
      completeVerification({ token: data.token, user: data.user });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Enter your email');
      return;
    }
    setResendLoading(true);
    try {
      await sendVerificationOtp(email.trim());
      setError('');
      alert('New code sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send code');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-card border border-border p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white mb-2">Verify your email</h1>
          <p className="text-slate-400 text-sm mb-6">Enter the 6-digit code sent to your email</p>
          <form onSubmit={handleVerify} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2">
                {error}
              </div>
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
              readOnly={!!emailFromUrl}
            />
            <input
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full text-accent hover:underline text-sm disabled:opacity-50"
            >
              {resendLoading ? 'Sending...' : 'Resend code'}
            </button>
          </form>
          <p className="mt-6 text-center text-slate-400 text-sm">
            <Link to="/login" className="text-accent hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
