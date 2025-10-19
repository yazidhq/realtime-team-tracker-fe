import { useState, useCallback } from "react";

export const useAsyncStatus = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const runAsync = useCallback(async (asyncFunc, successMessage = null) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await asyncFunc();
      if (successMessage) setSuccess(successMessage);
      return { ok: true, result };
    } catch (err) {
      setError(err?.message || String(err));
      return { ok: false, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetStatus = useCallback(() => {
    setError(null);
    setSuccess(null);
    setLoading(false);
  }, []);

  return {
    loading,
    error,
    success,
    setLoading,
    setError,
    setSuccess,
    resetStatus,
    runAsync,
  };
};
