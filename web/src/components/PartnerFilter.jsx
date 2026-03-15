import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPartners } from '../api';

export default function PartnerFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [partners, setPartners] = useState([]);
  const partnerId = searchParams.get('partner') || '';

  useEffect(() => {
    getPartners()
      .then((res) => setPartners(res.data || []))
      .catch(() => setPartners([]));
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    if (v) setSearchParams({ partner: v });
    else setSearchParams({});
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-slate-400 text-sm whitespace-nowrap">Filter by partner:</label>
      <select
        value={partnerId}
        onChange={handleChange}
        className="bg-background border border-border rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[180px]"
      >
        <option value="">All partners</option>
        {partners.map((p) => (
          <option key={p._id} value={p._id}>
            {p.name || p.email}
          </option>
        ))}
      </select>
    </div>
  );
}
