import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard, getAdminDashboard } from '../api';
import StatCard from '../components/StatCard';
import PartnerFilter from '../components/PartnerFilter';

export default function Dashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get('partner') || undefined;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const fetchDashboard = isAdmin ? () => getAdminDashboard(partnerId) : getDashboard;

  useEffect(() => {
    fetchDashboard()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [isAdmin, partnerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error) return <div className="text-red-400 bg-red-500/10 rounded-card px-4 py-3">{error}</div>;
  if (!data) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400 text-sm">
            {isAdmin ? (partnerId ? 'Partner view' : 'Platform overview') : 'Overview of your stations and revenue'}
          </p>
        </div>
        {isAdmin && <PartnerFilter />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard label="Stations" value={data.stationCount} gradient="linear-gradient(135deg, #22C55E, #16A34A)" />
        <StatCard label="Total sessions" value={data.sessionCount} gradient="linear-gradient(135deg, #3B82F6, #2563EB)" />
        <StatCard
          label="Total revenue"
          value={`$${data.totalRevenue.toFixed(2)}`}
          valueClassName="text-primary"
          gradient="linear-gradient(135deg, #22C55E, #15803D)"
        />
      </div>

      <div className="bg-card rounded-card border border-border overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-white">Recent sessions</h2>
          <Link to="/sessions" className="text-accent hover:underline text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="p-6">
          {data.recentSessions?.length ? (
            <div className="space-y-3">
              {data.recentSessions.map((s) => (
                <div
                  key={s._id}
                  className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-border/50 last:border-0"
                >
                  <div>
                    <p className="font-medium text-white">{s.stationId?.name || '—'}</p>
                    <p className="text-slate-400 text-sm">
                      {s.endTime ? new Date(s.endTime).toLocaleString() : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-slate-300">{(s.unitsConsumed ?? 0).toFixed(2)} kWh</span>
                    <span className="text-primary font-semibold">${(s.cost ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">
              No sessions yet. Add stations and they will appear when users charge.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
