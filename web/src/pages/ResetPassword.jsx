import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api';
import Alert from '../components/Alert';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromUrl);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !otp.trim() || !newPassword) {
      setError('Fill email, code and new password');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim(), otp.trim(), newPassword);
      setSuccess(true);
      setError('');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-card border border-border p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white mb-2">Set new password</h1>
          <p className="text-slate-400 text-sm mb-6">Enter the code from your email and choose a new password</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && <Alert type="success" message="Password reset. Redirecting to sign in..." />}
            {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
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
            <input
              type="password"
              placeholder="New password (min 6)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-primary hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Resetting...' : success ? 'Done' : 'Reset password'}
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
