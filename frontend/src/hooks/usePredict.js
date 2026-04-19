import { useCallback, useState } from "react";
import api from "../api";

export function usePredict() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const predict = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await api.post("/predict", payload);
      setResult(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    result,
    error,
    predict,
    setResult,
  };
}
