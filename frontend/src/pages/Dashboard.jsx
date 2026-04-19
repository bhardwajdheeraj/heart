import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePredictionHistory } from "../hooks/usePredictionHistory";
import { motion } from "framer-motion";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart
} from "recharts";
import { 
  Activity, AlertCircle, HeartPulse, ShieldCheck, 
  Plus, MessageSquare, ChevronRight, Clock, ArrowRight, ActivitySquare 
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, history, loading } = usePredictionHistory();

  // Recharts colored cells
  const COLORS = {
    high: "#ef4444", // red-500
    moderate: "#f59e0b", // amber-500
    low: "#22c55e" // green-500
  };

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case "high risk": return "text-red-600 bg-red-100 dark:bg-red-900/30";
      case "moderate risk": return "text-amber-600 bg-amber-100 dark:bg-amber-900/30";
      case "low risk": return "text-green-600 bg-green-100 dark:bg-green-900/30";
      default: return "text-gray-600 bg-gray-100 dark:bg-gray-800";
    }
  };

  const lineDataForRecharts = useMemo(() => {
    if (!history) return [];
    return history
      .map(item => ({
        date: new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        probability: Number((item.probability * 100).toFixed(2)),
        timestamp: new Date(item.timestamp).getTime()
      }))
      .sort((a, b) => a.timestamp - b.timestamp) // Sort chronological
      .slice(-10); // Last 10 predictions
  }, [history]);

  const recentActivity = useMemo(() => {
    if (!history) return [];
    return [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 4);
  }, [history]);

  // Handle empty or loading state for pie chart
  const hasHistory = history && history.length > 0;
  const pieData = hasHistory ? [
    { name: "High Risk", value: stats.highRisk || 0 },
    { name: "Moderate Risk", value: stats.moderateRisk || 0 },
    { name: "Low Risk", value: stats.lowRisk || 0 },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hello, {user?.email?.split('@')[0]} 👋
            </h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Here is what's happening with your heart health today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/chatbot')}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4" /> Chat AI
            </button>
            <button 
              onClick={() => navigate('/predict')}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white transition shadow-md flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" /> New Prediction
            </button>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Predictions" 
            value={loading ? "..." : stats.total} 
            icon={<ActivitySquare className="w-6 h-6 text-red-500" />} 
          />
          <StatCard 
            title="High Risks" 
            value={loading ? "..." : stats.highRisk} 
            icon={<AlertCircle className="w-6 h-6 text-red-500" />} 
            color="border-l-4 border-red-500"
          />
          <StatCard 
            title="Moderate Risks" 
            value={loading ? "..." : stats.moderateRisk} 
            icon={<Activity className="w-6 h-6 text-amber-500" />} 
            color="border-l-4 border-amber-500"
          />
          <StatCard 
            title="Low Risks" 
            value={loading ? "..." : stats.lowRisk} 
            icon={<ShieldCheck className="w-6 h-6 text-green-500" />} 
            color="border-l-4 border-green-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* MAIN CHARTS SECTION */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 relative overflow-hidden transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-red-500" /> Prediction Trends
                </h3>
                <p className="text-sm text-gray-500">Your calculated risk probability over time</p>
              </div>
              
              <div className="w-full h-[250px] md:h-[300px]">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl">
                    Loading chart data...
                  </div>
                ) : !hasHistory ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    Not enough data to display trend
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
                    <AreaChart data={lineDataForRecharts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorProb" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.2)" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                      <Area 
                        type="monotone" 
                        dataKey="probability" 
                        stroke="#dc2626" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorProb)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            
            {/* Quick Actions Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 shadow-md p-6 rounded-2xl flex items-start gap-4 hover:border-red-500/50 transition-colors" onClick={() => navigate('/predict')}>
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <HeartPulse className="w-7 h-7 text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Run Analysis</h4>
                    <p className="text-sm text-gray-500 mt-1">Check new risk parameters</p>
                  </div>
               </motion.div>
               <motion.div whileHover={{ scale: 1.02 }} className="cursor-pointer bg-white dark:bg-gray-900 border border-transparent dark:border-gray-800 shadow-md p-6 rounded-2xl flex items-start gap-4 hover:border-blue-500/50 transition-colors" onClick={() => navigate('/chatbot')}>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <MessageSquare className="w-7 h-7 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h4>
                    <p className="text-sm text-gray-500 mt-1">Ask questions about health</p>
                  </div>
               </motion.div>
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="space-y-8">
            {/* Risk Distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Risk Distribution</h3>
              
              <div className="w-full h-[250px] md:h-[300px]">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl">
                    Loading chart data...
                  </div>
                ) : !hasHistory ? (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    No risk data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
                    <PieChart>
                      <Pie 
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        stroke="none"
                      >
                        <Cell fill={COLORS.high} />
                        <Cell fill={COLORS.moderate} />
                        <Cell fill={COLORS.low} />
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none' }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              {hasHistory && !loading && (
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-red-500" /> High 
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-amber-500" /> Mod
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-green-500" /> Low
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 transition-all duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                <button onClick={() => navigate('/prediction-history')} className="text-red-500 text-sm font-medium hover:underline">
                  View all
                </button>
              </div>
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg flex items-center justify-center ${
                        item.risk_level?.includes('High') ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        item.risk_level?.includes('Moderate') ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                      }`}>
                         <HeartPulse className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Analysis Result</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(item.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getRiskColor(item.risk_level)}`}>
                      {(item.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity found.</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color = "" }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`bg-white dark:bg-gray-900 shadow-lg p-6 rounded-2xl transition-all duration-300 ${color}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-xl">
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </motion.div>
  );
}