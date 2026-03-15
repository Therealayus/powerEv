/**
 * Stat card with optional gradient accent for dashboard
 */
export default function StatCard({ label, value, valueClassName = 'text-white', gradient }) {
  return (
    <div className="bg-card rounded-card border border-border p-6 relative overflow-hidden shadow-lg hover:shadow-xl transition">
      {gradient && (
        <div
          className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-20 -translate-y-1/2 translate-x-1/2"
          style={{ background: gradient }}
        />
      )}
      <div className="relative">
        <p className="text-slate-400 text-sm font-medium">{label}</p>
        <p className={`text-2xl md:text-3xl font-bold mt-1 ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}
