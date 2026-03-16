import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyStations, getAdminStations, createStation, updateStation, getPartners, createAdminStation, updateAdminStation } from '../api';
import PartnerFilter from '../components/PartnerFilter';

export default function Stations() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get('partner') || undefined;
  const [stations, setStations] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [reassignModal, setReassignModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    pricePerKwh: '',
    totalChargers: '4',
    ownerId: '',
  });

  const isAdmin = user?.role === 'admin';
  const loadStations = () => {
    const api = isAdmin ? getAdminStations(partnerId) : getMyStations();
    api
      .then((res) => setStations(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load stations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStations();
  }, [isAdmin, partnerId]);

  useEffect(() => {
    if (isAdmin) {
      getPartners().then((res) => setPartners(res.data || [])).catch(() => setPartners([]));
    }
  }, [isAdmin]);

  const openCreate = () => {
    setEditing(null);
    const firstPartnerId = partners.length ? partners[0]._id : '';
    setForm({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      pricePerKwh: '',
      totalChargers: '4',
      ownerId: firstPartnerId,
    });
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      name: s.name,
      address: s.address,
      latitude: String(s.latitude),
      longitude: String(s.longitude),
      pricePerKwh: String(s.pricePerKwh),
      totalChargers: String(s.totalChargers || s.chargers?.length || 4),
      ownerId: s.ownerId?._id || s.ownerId || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isAdmin && !editing) {
        await createAdminStation({
          name: form.name,
          address: form.address,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          pricePerKwh: Number(form.pricePerKwh),
          totalChargers: parseInt(form.totalChargers, 10) || 4,
          ownerId: form.ownerId,
        });
      } else if (isAdmin && editing) {
        await updateAdminStation(editing._id, {
          name: form.name,
          address: form.address,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          pricePerKwh: form.pricePerKwh ? Number(form.pricePerKwh) : undefined,
          ownerId: form.ownerId || undefined,
        });
      } else if (editing) {
        await updateStation(editing._id, {
          name: form.name,
          address: form.address,
          latitude: form.latitude ? Number(form.latitude) : undefined,
          longitude: form.longitude ? Number(form.longitude) : undefined,
          pricePerKwh: form.pricePerKwh ? Number(form.pricePerKwh) : undefined,
        });
      } else {
        await createStation({
          name: form.name,
          address: form.address,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          pricePerKwh: Number(form.pricePerKwh),
          totalChargers: parseInt(form.totalChargers, 10) || 4,
        });
      }
      setModalOpen(false);
      loadStations();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save station');
    }
  };

  const handleReassign = async () => {
    if (!reassignModal?.stationId) return;
    if (!reassignModal?.ownerId) {
      setError('Please select a partner');
      return;
    }
    setError('');
    try {
      await updateAdminStation(reassignModal.stationId, { ownerId: reassignModal.ownerId });
      setReassignModal(null);
      loadStations();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reassign');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{isAdmin ? 'Stations' : 'My Stations'}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {isAdmin ? (partnerId ? 'Stations for selected partner' : 'All stations') : 'Manage your charging locations'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isAdmin && <PartnerFilter />}
          <button
            onClick={openCreate}
            className="bg-primary hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg"
          >
            Add station
          </button>
        </div>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
          {error}
        </div>
      )}
      <div className="grid gap-4">
        {stations.length === 0 ? (
          <div className="bg-card rounded-card border border-border p-8 text-center text-slate-400">
            No stations yet. Click &quot;Add station&quot; to create one.
          </div>
        ) : (
          stations.map((s) => (
            <div
              key={s._id}
              className="bg-card rounded-card border border-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg hover:border-primary/30 transition"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{s.name}</h3>
                  <p className="text-slate-400 text-sm mt-1">{s.address}</p>
                  {isAdmin && s.ownerId && (
                    <p className="text-slate-500 text-xs mt-1">Partner: {s.ownerId?.name || s.ownerId?.email || '—'}</p>
                  )}
                  <p className="text-primary font-medium mt-2">₹{Number(s.pricePerKwh).toFixed(2)}/kWh · {s.availableChargers}/{s.totalChargers} available</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <button
                    onClick={() => setReassignModal({ stationId: s._id, stationName: s.name, ownerId: s.ownerId?._id || s.ownerId || (partners[0]?._id ?? '') })}
                    className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 px-4 py-2 rounded-xl text-sm font-medium transition"
                  >
                    Reassign
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => openEdit(s)}
                    className="text-accent hover:text-white hover:bg-accent/20 px-4 py-2 rounded-xl text-sm font-medium transition"
                  >
                    Edit
                  </button>
                )}
                {!isAdmin && (
                  <button
                    onClick={() => openEdit(s)}
                    className="text-accent hover:text-white hover:bg-accent/20 px-4 py-2 rounded-xl text-sm font-medium transition"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-card border border-border w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">{editing ? 'Edit station' : 'Add station'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdmin && (
                <div>
                  <label className="block text-slate-400 text-sm mb-1">Partner (owner)</label>
                  <select
                    value={form.ownerId}
                    onChange={(e) => setForm((f) => ({ ...f, ownerId: e.target.value }))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    required={isAdmin}
                  >
                    <option value="">Select partner</option>
                    {partners.map((p) => (
                      <option key={p._id} value={p._id}>{p.name || p.email}</option>
                    ))}
                  </select>
                </div>
              )}
              <input
                type="text"
                placeholder="Station name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                placeholder="Address"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={form.latitude}
                  onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  required={!editing}
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={form.longitude}
                  onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                  required={!editing}
                />
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="Price per kWh (₹)"
                value={form.pricePerKwh}
                onChange={(e) => setForm((f) => ({ ...f, pricePerKwh: e.target.value }))}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              {!editing && (
                <input
                  type="number"
                  min="1"
                  placeholder="Number of chargers"
                  value={form.totalChargers}
                  onChange={(e) => setForm((f) => ({ ...f, totalChargers: e.target.value }))}
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-border text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition"
                >
                  {editing ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {reassignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-card border border-border w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-white mb-2">Reassign station</h2>
            <p className="text-slate-400 text-sm mb-4">{reassignModal.stationName}</p>
            <label className="block text-slate-400 text-sm mb-1">New partner</label>
            <select
              value={reassignModal.ownerId ?? ''}
              onChange={(e) => setReassignModal((r) => ({ ...r, ownerId: e.target.value }))}
              className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            >
              <option value="">Select partner</option>
              {partners.map((p) => (
                <option key={p._id} value={p._id}>{p.name || p.email}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setReassignModal(null); setError(''); }}
                className="flex-1 py-3 rounded-xl border border-border text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReassign}
                className="flex-1 bg-primary hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition"
              >
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
