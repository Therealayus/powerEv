import { useState, useEffect } from 'react';
import { getMyStations, createStation, updateStation } from '../api';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    pricePerKwh: '',
    totalChargers: '4',
  });

  const loadStations = () => {
    getMyStations()
      .then((res) => setStations(res.data))
      .catch((err) => setError(err.response?.data?.message || err.message || 'Failed to load stations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStations();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: '',
      address: '',
      latitude: '',
      longitude: '',
      pricePerKwh: '',
      totalChargers: '4',
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
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Stations</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your charging locations</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-lg"
        >
          Add station
        </button>
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
                  <p className="text-primary font-medium mt-2">${Number(s.pricePerKwh).toFixed(2)}/kWh · {s.availableChargers}/{s.totalChargers} available</p>
                </div>
              </div>
              <button
                onClick={() => openEdit(s)}
                className="text-accent hover:text-white hover:bg-accent/20 px-4 py-2 rounded-xl text-sm font-medium transition"
              >
                Edit
              </button>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-card border border-border w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">{editing ? 'Edit station' : 'Add station'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Price per kWh"
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
    </div>
  );
}
