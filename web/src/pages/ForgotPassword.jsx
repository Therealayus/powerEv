import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api';
import Alert from '../components/Alert';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Enter your email');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send code. Is the backend running on port 5000?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-card border border-border p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-white mb-2">Forgot password?</h1>
          <p className="text-slate-400 text-sm mb-6">Enter your email and we'll send a reset code</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert type="error" message={error} onDismiss={() => setError('')} />}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send reset code'}
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
