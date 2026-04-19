import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import LoadingSpinner from "../components/LoadingSpinner";
import { toast } from "react-hot-toast";
import { deletePrediction } from "../api";
import { usePredictionHistory } from "../hooks/usePredictionHistory";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Filter, Trash2, Download, Eye, AlertCircle, X, ShieldAlert, HeartPulse } from "lucide-react";

const riskColors = {
  "High Risk": "#ef4444",
  "Moderate Risk": "#f59e0b",
  "Low Risk": "#22c55e",
};

export default function PredictionHistory() {
  const { history, loading, refreshHistory, stats, lineChartData, pieChartData } = usePredictionHistory();
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filters
  const [filterRisk, setFilterRisk] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      const matchRisk = filterRisk === "All" || item.risk_level === filterRisk;
      const matchDate = !filterDate || new Date(item.timestamp).toISOString().split('T')[0] === filterDate;
      return matchRisk && matchDate;
    });
  }, [history, filterRisk, filterDate]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setActionLoading(true);

    try {
      await deletePrediction(deleteTarget.entry_id || deleteTarget.timestamp || deleteTarget.id);
      toast.success("Prediction deleted successfully.");
      setSelectedEntry((current) => (current?.entry_id === deleteTarget.entry_id ? null : current));
      
      const targetIdStr = String(deleteTarget.entry_id || deleteTarget.timestamp || deleteTarget.id);
      const storedHistory = JSON.parse(localStorage.getItem("predictionHistory") || "[]");
      const syncedHistory = storedHistory.filter(item => 
        String(item.id) !== targetIdStr && 
        String(item.entry_id) !== targetIdStr && 
        String(item.timestamp) !== targetIdStr
      );
      localStorage.setItem("predictionHistory", JSON.stringify(syncedHistory));
      window.dispatchEvent(new Event("localHistorySync"));

      await refreshHistory();
    } catch (error) {
      console.error("Delete prediction failed", error);
      toast.error(error.response?.data?.error || error.message || "Failed to delete prediction");
    } finally {
      setActionLoading(false);
      setDeleteTarget(null);
    }
  };

  const downloadPDF = (entry) => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#e11d48"); // Primary red
    doc.text("HeartSense Intelligence", 40, 50);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("#111827");
    doc.text("Cardiovascular Risk Assessment Report", 40, 74);
    
    doc.setFontSize(10);
    doc.setTextColor("#6b7280");
    doc.text(`Date of Assessment: ${new Date(entry.timestamp).toLocaleString()}`, 40, 94);
    doc.text(`Report ID: ${entry.entry_id || new Date().getTime()}`, 420, 94);

    doc.setDrawColor(226, 232, 240); // gray-200
    doc.setLineWidth(1);
    doc.line(40, 104, 560, 104);

    // Prediction Summary Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(40, 120, 520, 90, 8, 8, 'FD');
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#111827");
    doc.text("AI Prediction Result", 55, 145);
    
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    const riskColor = entry.risk_level === "High Risk" ? "#ef4444" : entry.risk_level === "Moderate Risk" ? "#f59e0b" : "#22c55e";
    doc.setTextColor(riskColor);
    doc.text(`Result: ${entry.prediction} (${entry.risk_level})`, 55, 170);
    
    doc.setFontSize(12);
    doc.setTextColor("#4b5563");
    doc.text(`Confidence Score: ${(entry.probability * 100).toFixed(1)}%`, 55, 190);

    const data = entry.input_data || {};
    const rows = [
      ["Age", "18–60 years", data.age],
      ["Gender", "0=Female / 1=Male", data.sex],
      ["Chest Pain", "0–3", data.cp],
      ["Resting BP", "90–120 mmHg", data.trestbps],
      ["Cholesterol", "<200 mg/dL", data.chol],
      ["Fasting Blood Sugar", "<120 mg/dL", data.fbs],
      ["Rest ECG", "0–2", data.restecg],
      ["Max Heart Rate", "220 - age", data.thalach],
      ["Exercise Angina", "0 or 1", data.exang],
      ["ST Depression", "0–1", data.oldpeak],
      ["ST Slope", "0–2", data.slope],
      ["Major Vessels", "0–3", data.ca],
      ["Thalassemia", "1–3", data.thal],
    ];

    let y = 240;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("#111827");
    doc.text("Clinical Parameters", 40, y);
    y += 20;

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(40, y, 520, 24, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Parameter", 50, y + 16);
    doc.text("Reference Range", 250, y + 16);
    doc.text("Patient Value", 450, y + 16);
    y += 24;

    doc.setFont("helvetica", "normal");
    rows.forEach(([name, normal, value], index) => {
      if (y > 700) {
        doc.addPage();
        y = 60;
      }
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(40, y, 520, 24, 'F');
      }
      doc.text(name, 50, y + 16);
      doc.text(normal, 250, y + 16);
      doc.setFont("helvetica", "bold");
      doc.text(String(value ?? "-"), 450, y + 16);
      doc.setFont("helvetica", "normal");
      y += 24;
    });

    y += 40;
    doc.setFontSize(10);
    doc.setTextColor("#6b7280");
    doc.text(
      "Disclaimer: This report is generated by HeartSense AI and is intended for educational and informational purposes only. It does not replace professional medical advice, diagnosis, or treatment.",
      40,
      y,
      { maxWidth: 520 }
    );

    doc.save(`HeartSense_Report_${entry.entry_id || new Date().getTime()}.pdf`);
    toast.success("PDF Report Downloaded");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10 bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
              Analysis History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Track your cardiovascular risk assessments over time.</p>
          </div>
          <button
            type="button"
            onClick={() => { refreshHistory(); toast.success("Refreshed"); }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary/50 text-gray-700 dark:text-gray-200 rounded-xl shadow-sm transition-all"
          >
             Refresh Data
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-3xl p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Total Assesments</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="glass-card rounded-3xl p-6 border-b-4 border-b-red-500">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">High Risk</p>
            <p className="text-4xl font-bold text-red-600">{stats.highRisk}</p>
          </div>
          <div className="glass-card rounded-3xl p-6 border-b-4 border-b-amber-500">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Moderate Risk</p>
            <p className="text-4xl font-bold text-amber-500">{stats.moderateRisk}</p>
          </div>
          <div className="glass-card rounded-3xl p-6 border-b-4 border-b-green-500">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 font-medium">Low Risk</p>
            <p className="text-4xl font-bold text-green-500">{stats.lowRisk}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-80"><LoadingSpinner message="Loading your history..." /></div>
        ) : history.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center">
             <HeartPulse className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-lg">No risk assessments found.</p>
            <p className="text-sm mt-2">Run your first AI prediction to start tracking your health.</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                       Probability Trend
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your risk score evolution.</p>
                  </div>
                </div>
                <div className="w-full h-[250px] md:h-[300px]">
                  {!lineChartData || !lineChartData.labels || lineChartData.labels.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                      Not enough data to display trend
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
                      <LineChart data={lineChartData.labels.map((label, idx) => ({ name: label, probability: lineChartData.data[idx] }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis unit="%" tick={{ fill: "#6B7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line type="monotone" dataKey="probability" stroke="#e11d48" strokeWidth={4} dot={{ r: 4, fill: '#e11d48', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                       Risk Distribution
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Segmentation of all assessments.</p>
                  </div>
                </div>
                <div className="w-full h-[250px] md:h-[300px]">
                  {!pieChartData || pieChartData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                      No risk data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1} debounce={50}>
                      <PieChart>
                        <Pie data={pieChartData} dataKey="value" nameKey="name" outerRadius={90} innerRadius={50} paddingAngle={2} stroke="none">
                          {pieChartData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={riskColors[entry.name] || "#60A5FA"} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* List and Filters */}
            <div className="glass-card rounded-3xl p-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-primary" /> Assessment Log
                </h2>
                
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl px-3 border border-gray-200 dark:border-gray-700">
                    <Filter className="w-4 h-4 text-gray-400 mr-2" />
                    <select 
                      value={filterRisk} 
                      onChange={(e) => setFilterRisk(e.target.value)}
                      className="bg-transparent py-2 text-sm focus:outline-none dark:text-gray-200 cursor-pointer"
                    >
                      <option value="All">All Risk Levels</option>
                      <option value="High Risk">High Risk</option>
                      <option value="Moderate Risk">Moderate Risk</option>
                      <option value="Low Risk">Low Risk</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-xl px-3 border border-gray-200 dark:border-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <input 
                      type="date" 
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="bg-transparent py-2 text-sm focus:outline-none dark:text-gray-200 [color-scheme:light] dark:[color-scheme:dark]"
                    />
                    {filterDate && (
                      <button onClick={() => setFilterDate("")} className="ml-2 text-gray-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {filteredHistory.length === 0 ? (
                 <div className="text-center py-10 text-gray-500">
                   No assessments match your filters.
                 </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {filteredHistory.map((item, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        key={item.entry_id || item.timestamp} 
                        className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-gray-100 dark:border-gray-700 rounded-2xl p-5 hover:shadow-lg hover:border-primary/30 transition-all flex flex-col group"
                      >
                         <div className="flex justify-between items-start mb-3">
                           <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                             item.risk_level === "High Risk" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                             item.risk_level === "Moderate Risk" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                             "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                           }`}>
                              <AlertCircle className="w-3 h-3" />
                              {item.risk_level}
                           </div>
                           <span className="text-xs text-gray-400 font-medium bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-lg">
                             {(item.probability * 100).toFixed(1)}% Conf.
                           </span>
                         </div>
                         
                         <div className="mb-4">
                           <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.prediction}</h3>
                           <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                             <Calendar className="w-3 h-3" />
                             {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                         </div>

                         <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                            <button 
                              onClick={() => setSelectedEntry(item)} 
                              className="flex-1 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                            >
                              <Eye className="w-3.5 h-3.5" /> Details
                            </button>
                            <button 
                              onClick={() => downloadPDF(item)} 
                              className="flex-1 bg-primary/10 hover:bg-primary hover:text-white text-primary text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 transition"
                            >
                              <Download className="w-3.5 h-3.5" /> Report
                            </button>
                            <button 
                              onClick={() => setDeleteTarget(item)} 
                              className="p-2 text-gray-400 hover:text-white hover:bg-red-500 bg-gray-50 dark:bg-gray-700 rounded-xl transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Entry Details Modal */}
            {selectedEntry && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
                  
                  <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assessment Details</h2>
                      <p className="text-sm text-gray-500">{new Date(selectedEntry.timestamp).toLocaleString()}</p>
                    </div>
                    <button onClick={() => setSelectedEntry(null)} className="p-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-full transition text-gray-600 dark:text-gray-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1 bg-primary/5 border border-primary/20 rounded-2xl p-4">
                        <p className="text-xs font-bold text-primary uppercase mb-1">Assessed Need</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedEntry.prediction}</p>
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Confidence Score</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{(selectedEntry.probability * 100).toFixed(1)}%</p>
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                       Clinical Parameters Provided
                    </h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-1 border border-gray-100 dark:border-gray-800">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                        {Object.entries(selectedEntry.input_data || {}).map(([key, value]) => (
                          <div key={key} className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm">
                            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                              {key.replace(/([A-Z])/g, " $1")}
                            </span>
                            <span className="block text-sm font-bold text-gray-900 dark:text-white">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                     <button onClick={() => downloadPDF(selectedEntry)} className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/20 flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export Full Report
                     </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-2xl transform scale-100 animate-fadeIn">
             <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6" />
             </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Assessment?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Are you sure you want to remove this record? This will permanently delete the assessment from your history.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setDeleteTarget(null)} 
                className="px-5 py-2.5 rounded-xl font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition"
              >
                Keep Record
              </button>
              <button 
                onClick={handleDeleteConfirm} 
                disabled={actionLoading} 
                className="px-5 py-2.5 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50 shadow-lg shadow-red-500/20"
              >
                {actionLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
