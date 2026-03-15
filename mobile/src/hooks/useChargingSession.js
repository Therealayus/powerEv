/**
 * Poll active charging session for live updates (timer, units, cost)
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useChargingSession(hasActiveSession) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchActiveSession = useCallback(async () => {
    if (!hasActiveSession) {
      setSession(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get('/charging/active');
      setSession(data || null);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [hasActiveSession]);

  useEffect(() => {
    fetchActiveSession();
    if (!hasActiveSession) return;
    const interval = setInterval(fetchActiveSession, 5000);
    return () => clearInterval(interval);
  }, [hasActiveSession, fetchActiveSession]);

  return { session, loading, refresh: fetchActiveSession };
}
