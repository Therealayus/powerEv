import { useState, useEffect } from 'react';
import { getTerms, updateTerms } from '../api';
import Alert from '../components/Alert';

export default function TermsEdit() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getTerms()
      .then(({ data }) => setContent(data?.content ?? ''))
      .catch(() => setContent(''))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateTerms(content);
      setMessage('Terms & Conditions updated successfully.');
    } catch (e) {
      setMessage(e.response?.data?.message || 'Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-white mb-4">Update Terms & Conditions</h1>
      <p className="text-slate-400 text-sm mb-4">
        Changes appear in the mobile app when users open Terms & Conditions.
      </p>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[400px] bg-card border border-border rounded-lg p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
        placeholder="Enter Terms and Conditions text..."
        spellCheck="false"
      />
      <div className="mt-4 flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        {message && (
          <Alert
            type={message.startsWith('Failed') ? 'error' : 'success'}
            message={message}
            onDismiss={() => setMessage(null)}
            className="flex-1"
          />
        )}
      </div>
    </div>
  );
}
