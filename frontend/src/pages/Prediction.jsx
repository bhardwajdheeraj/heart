import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";
import api from "../api";
import RiskMeter from "../components/RiskMeter";
import ProbabilityChart from "../components/ProbabilityChart";
import ShapBarChart from "../components/ShapBarChart";
import { usePredict } from "../hooks/usePredict";
import bgImage from "../assets/predict-bg.png";
import { motion } from "framer-motion";
import { 
  Calendar, User, HeartPulse, Activity, Stethoscope, Droplet, 
  Zap, AlertCircle, TrendingUp, HelpCircle, Loader2, Download, History, X 
} from "lucide-react";

const NORMAL_RANGES = {
  age: { min: 18, max: 60, unit: "years", label: "Age 18–60 (low risk)" },
  trestbps: { min: 90, max: 120, unit: "mmHg", label: "Resting BP 90–120 mmHg" },
  chol: { min: 0, max: 200, unit: "mg/dL", label: "Cholesterol <200 mg/dL" },
  fbs: { min: 0, max: 120, unit: "mg/dL", label: "FBS <120 mg/dL" },
  thalach: { isDynamic: true, unit: "bpm", label: "Max HR = 220 - age" },
  oldpeak: { min: 0, max: 1, unit: "", label: "Oldpeak 0–1 (normal)" },
  ca: { min: 0, max: 0, unit: "", label: "CA = 0 (best)" },
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
};

const calculateExpectedMaxHR = (age) => 220 - age;

const isOutOfRange = (fieldName, value, age) => {
  const range = NORMAL_RANGES[fieldName];
  if (!range) return false;
  
  if (fieldName === "thalach") {
    const expected = calculateExpectedMaxHR(age);
    return Math.abs(value - expected) > 30;
  }
  
  if (range.min !== undefined && value < range.min) return true;
  if (range.max !== undefined && value > range.max) return true;
  return false;
};

const getWarningMessage = (fieldName, value, age) => {
  const range = NORMAL_RANGES[fieldName];
  if (!range) return "";

  if (fieldName === "trestbps") {
    if (value < 90) return "⚠️ Low BP";
    if (value > 120) return "⚠️ High BP detected";
  } else if (fieldName === "chol") {
    if (value > 200) return "⚠️ Cholesterol is above normal";
  } else if (fieldName === "age") {
    if (value < 18) return "⚠️ Patient must be 18+";
    if (value > 60) return "⚠️ Above ideal risk zone";
  } else if (fieldName === "fbs") {
    if (value > 120) return "⚠️ FBS above normal";
  } else if (fieldName === "thalach") {
    const expected = calculateExpectedMaxHR(age);
    if (Math.abs(value - expected) > 30) return "⚠️ Unusual for this age";
  } else if (fieldName === "oldpeak") {
    if (value > 1) return "⚠️ Above normal range";
  } else if (fieldName === "ca") {
    if (value !== 0) return "⚠️ Vessels detected";
  }
  return "";
};

export default function Prediction() {
  const { loading, result, error, predict, setResult } = usePredict();

  const [formData, setFormData] = useState({
    dob: "",
    age: 35,
    sex: 1,
    cp: 0,
    trestbps: 120,
    chol: 180,
    fbs: 0,
    restecg: 0,
    thalach: 170,
    exang: 0,
    oldpeak: 0.0,
    slope: 2,
    ca: 0,
    thal: 2,
  });

  const [ageSource, setAgeSource] = useState("manual");
  const [history, setHistory] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("predictionHistory") || "[]");
    setHistory(stored);
    
    // ADDED: Force re-fetch of fresh data from API to sync both pages
    api.get("/prediction-history").then((res) => {
      const apiData = res.data || [];
      // Map API data to the format expected by Recent Assessments
      const formattedApiData = apiData.map(item => ({
        id: item.id || item.entry_id,
        date: item.timestamp,
        patientData: item.input_data || { 
          age: item.age, sex: item.sex, cp: item.cp, trestbps: item.trestbps, 
          chol: item.chol, fbs: item.fbs, restecg: item.restecg, thalach: item.thalach, 
          exang: item.exang, oldpeak: item.oldpeak, slope: item.slope, ca: item.ca, thal: item.thal 
        },
        result: { prediction: item.prediction, probability: item.probability, risk_level: item.risk_level },
        riskLevel: item.risk_level
      }));
      setHistory(formattedApiData);
      localStorage.setItem("predictionHistory", JSON.stringify(formattedApiData));
    }).catch(console.error);

    const syncLocal = () => setHistory(JSON.parse(localStorage.getItem("predictionHistory") || "[]"));
    window.addEventListener("localHistorySync", syncLocal);
    return () => window.removeEventListener("localHistorySync", syncLocal);
  }, []);

  const saveHistory = (entry) => {
    const existing = JSON.parse(localStorage.getItem("predictionHistory") || "[]");
    const updated = [entry, ...existing];
    localStorage.setItem("predictionHistory", JSON.stringify(updated));
    setHistory(updated);
  };

  const loadHistory = () => {
    const stored = JSON.parse(localStorage.getItem("predictionHistory") || "[]");
    setHistory(stored);

    // ADDED: Force re-fetch of fresh data from API
    api.get("/prediction-history").then((res) => {
      const apiData = res.data || [];
      const formattedApiData = apiData.map(item => ({
        id: item.id || item.entry_id,
        date: item.timestamp,
        patientData: item.input_data || {},
        result: { prediction: item.prediction, probability: item.probability, risk_level: item.risk_level },
        riskLevel: item.risk_level
      }));
      setHistory(formattedApiData);
      localStorage.setItem("predictionHistory", JSON.stringify(formattedApiData));
    }).catch(console.error);
  };

  const downloadPDF = (entry) => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("HeartSense Intelligence", 40, 50);
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Heart Disease Prediction Report", 40, 74);
    doc.setTextColor("#6b7280");
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 94);

    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(40, 104, 560, 104);

    const data = entry.patientData;
    const fields = [
      ["Age", "18–60 years", data.age],
      ["Gender", "0=Female / 1=Male", data.sex],
      ["Chest Pain", "0–3", data.cp],
      ["BP", "90–120 mmHg", data.trestbps],
      ["Cholesterol", "<200 mg/dL", data.chol],
      ["FBS", "<120 mg/dL", data.fbs],
      ["Rest ECG", "0–2", data.restecg],
      ["Max HR", "220 - age", data.thalach],
      ["Exang", "0 or 1", data.exang],
      ["Oldpeak", "0–1", data.oldpeak],
      ["Slope", "0–2", data.slope],
      ["CA", "0–3", data.ca],
      ["Thal", "1–3", data.thal],
    ];

    let y = 130;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Parameters", 40, y);
    y += 18;

    doc.setFont("helvetica", "bold");
    doc.text("Parameter", 40, y);
    doc.text("Normal Range", 220, y);
    doc.text("Patient Value", 420, y);
    y += 12;
    doc.setLineWidth(0.4);
    doc.line(40, y, 560, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    fields.forEach(([name, range, value]) => {
      if (y > 700) {
        doc.addPage();
        y = 60;
      }
      doc.text(name, 40, y);
      doc.text(range, 220, y);
      doc.text(String(value), 420, y);
      y += 16;
    });

    y += 12;
    doc.setFont("helvetica", "bold");
    doc.text("Prediction Summary", 40, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.text(`Result: ${entry.result.prediction}`, 40, y);
    y += 14;
    doc.text(`Probability: ${(entry.result.probability * 100).toFixed(2)}%`, 40, y);
    y += 14;
    doc.text(`Risk Level: ${entry.result.risk_level || entry.riskLevel}`, 40, y);

    y += 24;
    doc.setFontSize(10);
    doc.setTextColor("#374151");
    doc.text(
      "Disclaimer: This report is for educational purposes only and does not substitute for professional medical advice.",
      40,
      y,
      { maxWidth: 520 }
    );

    doc.save(`HeartSense_Report_${new Date().getTime()}.pdf`);
  };

  const handleDOBChange = (e) => {
    const dob = e.target.value;
    setFormData({ ...formData, dob });
    
    if (dob) {
      const calculatedAge = calculateAge(dob);
      if (calculatedAge !== null && calculatedAge >= 18) {
        setFormData((prev) => ({ ...prev, dob, age: calculatedAge }));
        setAgeSource("dob");
      }
    }
  };

  const handleAgeChange = (e) => {
    let ageValue = e.target.value;
    if (ageValue !== "" && Number(ageValue) > 120) {
      ageValue = "120";
    }
    const age = Number(ageValue);
    setFormData({ ...formData, age });
    setAgeSource("manual");
  };

  const handleChange = (e) => {
    let { name, value, type, max } = e.target;
    
    if (type === "number" && max !== "" && value !== "") {
      if (Number(value) > Number(max)) {
        value = max;
      }
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // ✅ FIXED SUBMIT FUNCTION - Excludes DOB from API payload
  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    try {
      const { dob, ...modelData } = formData;
      const payload = Object.fromEntries(
        Object.entries(modelData).map(([key, value]) => [key, Number(value)])
      );

      const entryId = String(Date.now());
      const predictionResult = await predict({ ...payload, entryId });
      toast.success("Prediction complete");

      const riskLevel = predictionResult.risk_level || predictionResult.riskLevel || "Unknown";
      const newEntry = {
        id: Number(entryId),
        date: new Date().toISOString(),
        patientData: {
          age: formData.age,
          sex: formData.sex,
          cp: formData.cp,
          trestbps: formData.trestbps,
          chol: formData.chol,
          fbs: formData.fbs,
          restecg: formData.restecg,
          thalach: formData.thalach,
          exang: formData.exang,
          oldpeak: formData.oldpeak,
          slope: formData.slope,
          ca: formData.ca,
          thal: formData.thal,
          dob: formData.dob
        },
        result: predictionResult,
        riskLevel: riskLevel
      };

      saveHistory(newEntry);
      setSelectedEntry(newEntry);
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please login to continue");
        window.location.href = "/login";
      } else {
        toast.error(err.response?.data?.error || "Prediction failed");
      }
    }
  };

  const getRiskColor = (risk) => {
    if (risk === "High Risk") return "text-red-600";
    if (risk === "Moderate Risk") return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto animate-fadeIn space-y-8">

        {/* HEADER */}
        <div className="text-center space-y-3">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 mx-auto bg-gradient-to-tr from-primary to-rose-400 rounded-2xl flex items-center justify-center shadow-lg"
          >
            <HeartPulse className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
            Heart Risk Analysis
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Enter clinical parameters below for an AI-powered assessment of cardiovascular risk.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* SECTION: PERSONAL INFO */}
            <motion.div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-6 transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <User className="w-5 h-5 text-red-500" /> Personal Information
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" /> Date of Birth
                  </label>
                  <input type="date" value={formData.dob} onChange={handleDOBChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300" />
                  {ageSource === "dob" && formData.dob && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">✓ Age auto-calculated</p>}
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" /> Age
                    </label>
                    <input type="number" name="age" min="1" max="120" value={formData.age} onChange={handleAgeChange} className={`w-full bg-white dark:bg-gray-800 border ${isOutOfRange("age", formData.age, formData.age) ? "border-red-500" : "border-gray-300 dark:border-gray-600"} text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300`} required />
                    {isOutOfRange("age", formData.age, formData.age) && <p className="text-xs text-red-600 mt-1">{getWarningMessage("age", formData.age, formData.age)}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                      Gender
                    </label>
                    <select name="sex" value={formData.sex} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300">
                      <option value="1">Male</option>
                      <option value="0">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SECTION: CLINICAL VITALS */}
            <motion.div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-6 transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
                <Activity className="w-5 h-5 text-red-500" /> Clinical Vitals
              </h3>
              
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-gray-400" /> Resting BP
                  </label>
                  <input type="number" name="trestbps" min="80" max="220" value={formData.trestbps} onChange={handleChange} className={`w-full bg-white dark:bg-gray-800 border ${isOutOfRange("trestbps", formData.trestbps, formData.age) ? "border-red-500" : "border-gray-300 dark:border-gray-600"} text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300`} />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">mmHg</span>
                </div>
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <Droplet className="w-4 h-4 text-gray-400" /> Cholesterol
                  </label>
                  <input type="number" name="chol" min="100" max="600" value={formData.chol} onChange={handleChange} className={`w-full bg-white dark:bg-gray-800 border ${isOutOfRange("chol", formData.chol, formData.age) ? "border-red-500" : "border-gray-300 dark:border-gray-600"} text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300`} />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">mg/dL</span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gray-400" /> Fasting Blood Sugar
                  </label>
                  <select name="fbs" value={formData.fbs} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300">
                    <option value="0">&lt;120 mg/dL (Normal)</option>
                    <option value="1">≥120 mg/dL</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" /> Max Heart Rate
                  </label>
                  <input type="number" name="thalach" min="40" max="220" value={formData.thalach} onChange={handleChange} className={`w-full bg-white dark:bg-gray-800 border ${isOutOfRange("thalach", formData.thalach, formData.age) ? "border-red-500" : "border-gray-300 dark:border-gray-600"} text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300`} />
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">bpm</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* SECTION: CARDIOLOGY TESTS */}
          <motion.div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-6 transition-all duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-800 pb-3">
              <Stethoscope className="w-5 h-5 text-red-500" /> Cardiology Diagnostics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Chest Pain Type</label>
                <select name="cp" value={formData.cp} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300">
                  <option value="0">Typical Angina (TA)</option>
                  <option value="1">Atypical Angina (ATA)</option>
                  <option value="2">Non-anginal Pain (NAP)</option>
                  <option value="3">Asymptomatic (ASY)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Resting ECG</label>
                <select name="restecg" value={formData.restecg} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300">
                  <option value="0">Normal</option>
                  <option value="1">ST-T Wave Abnormality</option>
                  <option value="2">Left Ventricular Hypertrophy</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Exercise Induced Angina</label>
                <select name="exang" value={formData.exang} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300">
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">ST Depression (Oldpeak)</label>
                <input type="number" step="0.1" min="0" max="10" name="oldpeak" value={formData.oldpeak} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300" />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">ST Segment Slope</label>
                <select name="slope" value={formData.slope} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300">
                  <option value="0">Upsloping</option>
                  <option value="1">Flat</option>
                  <option value="2">Downsloping</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Number of Major Vessels (CA)</label>
                <select name="ca" value={formData.ca} onChange={handleChange} className={`w-full bg-white dark:bg-gray-800 border ${formData.ca !== "0" ? "border-red-500" : "border-gray-300 dark:border-gray-600"} text-gray-900 dark:text-white px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300`}>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 block">Thalassemia</label>
                <select name="thal" value={formData.thal} onChange={handleChange} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white px-4 py-3 rounded-xl shadow-sm hover:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-300">
                  <option value="1">Normal</option>
                  <option value="2">Fixed Defect</option>
                  <option value="3">Reversable Defect</option>
                </select>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-center pt-4 pb-8">
            <button
              type="submit"
              disabled={loading}
              className="group relative flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:shadow-red-500/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 overflow-hidden"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Analyzing Parameters...
                </>
              ) : (
                <>
                  <Activity className="w-6 h-6 group-hover:animate-pulse" /> Run AI Risk Analysis
                </>
              )}
            </button>
          </div>
        </form>

        {/* RESULTS SECTION */}
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-3xl p-8 border-t-8 border-t-primary shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 text-gray-100 dark:text-gray-800 opacity-20 pointer-events-none">
                <HeartPulse style={{ width: '300px', height: '300px' }} />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="text-center md:text-left space-y-4 flex-1">
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
                    Prediction: {result.prediction}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <span className={`px-4 py-1.5 rounded-full font-bold text-lg inline-flex items-center gap-2 ${
                      result.risk_level === "High Risk" 
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                        : result.risk_level === "Moderate Risk" 
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}>
                      <AlertCircle className="w-5 h-5" /> {result.risk_level}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300 font-medium">
                      {(result.probability * 100).toFixed(1)}% confidence score
                    </span>
                  </div>
                </div>

                <div className="w-full md:w-1/3">
                  <ProbabilityChart probability={result.probability} />
                </div>
              </div>

              <div className="flex justify-center md:justify-start mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => downloadPDF({ patientData: formData, result })}
                  className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900 text-white px-6 py-2.5 rounded-xl font-medium transition shadow-sm"
                >
                  <Download className="w-4 h-4" /> Export Report (PDF)
                </button>
              </div>
            </div>

            {/* EXPLANATION SECTION */}
            {result.top_features && result.top_features.length > 0 && (
              <div className="glass-card rounded-3xl p-8">
                <div className="mb-6">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-primary" /> Why this result?
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Factors with the strongest impact on your risk assessment (SHAP values).
                    <br />
                    <span className="text-sm font-medium text-red-500">Red: Increases Risk</span> | <span className="text-sm font-medium text-green-500">Green: Decreases Risk</span>
                  </p>
                </div>
                
                <ShapBarChart topFeatures={result.top_features} />
              </div>
            )}
            
            <RiskMeter probability={result.probability} />
          </motion.div>
        )}

        {/* COMPACT PREDICTION HISTORY */}
        <div className="mt-12 glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Recent Assessments
            </h3>
            <button onClick={() => { loadHistory(); toast.success("Refreshed"); }} className="text-sm text-primary hover:underline font-medium">
              Refresh
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No history available. Run an analysis to save your first record.</p>
            </div>
          ) : (
            <div className="grid gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
               {history.map((entry) => (
                 <div key={entry.id} className="bg-white/60 dark:bg-gray-800/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-colors">
                   <div className="flex items-center gap-4">
                     <div className={`w-3 h-3 rounded-full ${entry.riskLevel === "High Risk" || entry.riskLevel === "High" ? "bg-red-500" : entry.riskLevel === "Moderate Risk" || entry.riskLevel === "Moderate" ? "bg-amber-500" : "bg-green-500"}`} />
                     <div>
                       <div className="text-sm font-bold text-gray-900 dark:text-white">Analysis {new Date(entry.date).toLocaleDateString()}</div>
                       <div className="text-xs text-gray-500 mt-0.5">Parameters: {entry.patientData.age}yrs, BP: {entry.patientData.trestbps}, Chol: {entry.patientData.chol}</div>
                     </div>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => setSelectedEntry(entry)} className="px-3 py-1.5 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition">View Values</button>
                     <button onClick={() => downloadPDF(entry)} className="px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition">Download</button>
                   </div>
                 </div>
               ))}
            </div>
          )}
        </div>

        {/* SELECTED ENTRY MODAL */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <button onClick={() => setSelectedEntry(null)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-full transition">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Record Details</h3>
              <p className="text-sm text-gray-500 mb-6">{new Date(selectedEntry.date).toLocaleString()}</p>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 grid grid-cols-2 gap-y-3 mb-6">
                 {Object.entries(selectedEntry.patientData).filter(([key]) => key !== 'dob').map(([key, value]) => (
                   <div key={key} className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-2 mr-4">
                     <span className="text-xs text-gray-500 uppercase font-medium">{key}</span>
                     <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
                   </div>
                 ))}
              </div>

              <div className="flex items-center justify-between bg-primary/5 rounded-2xl p-4 border border-primary/20">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Assessed Risk Level</div>
                  <div className={`text-lg font-bold ${getRiskColor(selectedEntry.riskLevel)}`}>{selectedEntry.riskLevel}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 uppercase font-bold mb-1">Probability</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">{(selectedEntry.result.probability * 100).toFixed(1)}%</div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}