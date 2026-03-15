import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPartnerById } from '../api';

export default function PartnerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPartnerById(id)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load partner'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error) return <div className="text-red-400 bg-red-500/10 rounded-card px-4 py-3">{error}</div>;
  if (!data) return null;

  const { name, email, stationCount, sessionCount, totalRevenue, users = [] } = data;

  return (
    <div>
      <Link to="/partners" className="text-slate-400 hover:text-white text-sm mb-4 inline-block">← Partners</Link>
      <h1 className="text-2xl font-bold text-white mb-2">{name || email}</h1>
      <p className="text-slate-400 text-sm mb-8">{email}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card rounded-card border border-border p-6">
          <p className="text-slate-400 text-sm">Stations</p>
          <p className="text-2xl font-bold text-white mt-1">{stationCount}</p>
        </div>
        <div className="bg-card rounded-card border border-border p-6">
          <p className="text-slate-400 text-sm">Total sessions</p>
          <p className="text-2xl font-bold text-white mt-1">{sessionCount}</p>
        </div>
        <div className="bg-card rounded-card border border-border p-6">
          <p className="text-slate-400 text-sm">Total revenue</p>
          <p className="text-2xl font-bold text-primary mt-1">₹{Number(totalRevenue).toFixed(2)}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-white mb-4">Users who charged at this partner&apos;s stations</h2>
      {users.length === 0 ? (
        <div className="bg-card rounded-card border border-border p-8 text-center text-slate-400">No charging history yet.</div>
      ) : (
        <div className="bg-card rounded-card border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-slate-400 font-medium text-sm">User</th>
                <th className="px-6 py-3 text-slate-400 font-medium text-sm">Email</th>
                <th className="px-6 py-3 text-slate-400 font-medium text-sm">Sessions</th>
                <th className="px-6 py-3 text-slate-400 font-medium text-sm">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.userId} className="border-b border-border/50 last:border-0">
                  <td className="px-6 py-4 text-white">{u.name}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">{u.email}</td>
                  <td className="px-6 py-4 text-white">{u.sessionCount}</td>
                  <td className="px-6 py-4 text-primary font-medium">₹{Number(u.revenue).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
