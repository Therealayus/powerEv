/**
 * In-app alert banner. Matches app design: dark theme, primary green, accent blue, red for errors.
 * Use for errors, success, and info feedback.
 */
const typeStyles = {
  error: 'bg-red-500/10 border-red-500/30 text-red-400',
  success: 'bg-green-500/10 border-green-500/30 text-green-400',
  info: 'bg-accent/10 border-accent/30 text-accent',
};

export default function Alert({ type = 'error', message, onDismiss, className = '' }) {
  if (!message) return null;
  const styles = typeStyles[type] ?? typeStyles.error;

  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles} ${className}`}
    >
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/30"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
