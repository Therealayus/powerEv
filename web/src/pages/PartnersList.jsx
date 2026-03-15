import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPartners } from '../api';

export default function PartnersList() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getPartners()
      .then((res) => setPartners(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load partners'))
      .finally(() => setLoading(false));
  }, []);

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
      <h1 className="text-2xl font-bold text-white mb-2">Partners</h1>
      <p className="text-slate-400 text-sm mb-8">View partner details, users who charged at their stations, and revenue</p>
      <div className="grid gap-4">
        {partners.length === 0 ? (
          <div className="bg-card rounded-card border border-border p-8 text-center text-slate-400">No partners yet.</div>
        ) : (
          partners.map((p) => (
            <Link
              key={p._id}
              to={`/partners/${p._id}`}
              className="bg-card rounded-card border border-border p-6 flex items-center justify-between gap-4 shadow-lg hover:border-primary/30 transition"
            >
              <div>
                <h3 className="text-lg font-semibold text-white">{p.name || p.email}</h3>
                <p className="text-slate-400 text-sm mt-1">{p.email}</p>
              </div>
              <span className="text-slate-400">View details →</span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
