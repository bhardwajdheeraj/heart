import { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api";

const defaultStats = {
  total: 0,
  highRisk: 0,
  moderateRisk: 0,
  lowRisk: 0,
};

export function usePredictionHistory() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await api.get("/prediction-history");
      setHistory(res.data || []);
    } catch (err) {
      setError(err);
      setHistory([]);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.get("/stats");
      setStats(res.data || defaultStats);
    } catch (err) {
      setError(err);
      setStats(defaultStats);
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.allSettled([fetchHistory(), fetchStats()]);
    setLoading(false);
  }, [fetchHistory, fetchStats]);

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const lineChartData = useMemo(() => {
    const sorted = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    return {
      labels: sorted.map((item) => new Date(item.timestamp).toLocaleDateString()),
      data: sorted.map((item) => Number((item.probability * 100).toFixed(2))),
    };
  }, [history]);

  const pieChartData = useMemo(() => {
    return [
      { name: "High Risk", value: stats.highRisk },
      { name: "Moderate Risk", value: stats.moderateRisk },
      { name: "Low Risk", value: stats.lowRisk },
    ];
  }, [stats.highRisk, stats.moderateRisk, stats.lowRisk]);

  return {
    history,
    loading,
    error,
    refreshHistory,
    stats,
    lineChartData,
    pieChartData,
  };
}
