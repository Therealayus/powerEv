import { useState, useEffect } from 'react';
import { getMySessions } from '../api';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMySessions()
      .then((res) => setSessions(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load sessions'))
      .finally(() => setLoading(false));
  }, []);

  const formatDuration = (start, end) => {
    if (!start || !end) return '—';
    const ms = new Date(end) - new Date(start);
    const m = Math.floor(ms / 60000);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m} min`;
  };

  const totalRevenue = sessions.reduce((sum, s) => sum + (s.cost ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error) return <div className="text-red-400 bg-red-500/10 rounded-card px-4 py-3">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Charging sessions</h1>
      <p className="text-slate-400 text-sm mb-8">Completed sessions at your stations</p>

      {sessions.length > 0 && (
        <div className="bg-card rounded-card border border-border p-6 mb-8 shadow-lg">
          <p className="text-slate-400 text-sm">Total revenue (this list)</p>
          <p className="text-3xl font-bold text-primary mt-1">${totalRevenue.toFixed(2)}</p>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="bg-card rounded-card border border-border p-12 text-center text-slate-400 shadow-lg">
          <p className="text-lg font-medium text-white mb-2">No sessions yet</p>
          <p>Sessions from your stations will appear here once users charge.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((s) => (
            <div
              key={s._id}
              className="bg-card rounded-card border border-border p-6 shadow-lg hover:border-border/80 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xl">🔌</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{s.stationId?.name || 'Station'}</h3>
                    <p className="text-slate-400 text-sm mt-1">{s.stationId?.address}</p>
                    <p className="text-slate-500 text-sm mt-2">
                      {s.endTime ? new Date(s.endTime).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-8 text-sm">
                  <div>
                    <p className="text-slate-400">Units</p>
                    <p className="text-white font-semibold">{(s.unitsConsumed ?? 0).toFixed(2)} kWh</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Revenue</p>
                    <p className="text-primary font-semibold">${(s.cost ?? 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Duration</p>
                    <p className="text-white font-semibold">{formatDuration(s.startTime, s.endTime)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
