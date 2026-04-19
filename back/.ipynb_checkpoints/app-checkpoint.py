from flask import Flask, request, jsonify
import numpy as np
import joblib
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow React frontend connection

# -----------------------------
# Load Trained Model
# -----------------------------
model = joblib.load("model/best_rf_model.pkl")

# -----------------------------
# Home Route
# -----------------------------
@app.route("/")
def home():
    return "HeartSense Intelligence API Running"

# -----------------------------
# Prediction Route
# -----------------------------
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # Validate input keys
        required_fields = [
            "age", "sex", "cp", "trestbps", "chol", "fbs",
            "restecg", "thalach", "exang", "oldpeak",
            "slope", "ca", "thal"
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Convert input to float
        features = [
            float(data["age"]),
            float(data["sex"]),
            float(data["cp"]),
            float(data["trestbps"]),
            float(data["chol"]),
            float(data["fbs"]),
            float(data["restecg"]),
            float(data["thalach"]),
            float(data["exang"]),
            float(data["oldpeak"]),
            float(data["slope"]),
            float(data["ca"]),
            float(data["thal"])
        ]

        final_features = np.array([features])

        # Model Prediction
        prediction = model.predict(final_features)[0]
        probability = model.predict_proba(final_features)[0][1]

        # -----------------------------
        # Risk Level Logic
        # -----------------------------
        if probability > 0.6:
            risk_level = "High Risk"
        elif probability > 0.4:
            risk_level = "Moderate Risk"
        else:
            risk_level = "Low Risk"

        result = "Heart Disease Detected" if prediction == 1 else "No Heart Disease"

        return jsonify({
            "prediction": result,
            "probability": round(float(probability), 4),
            "risk_level": risk_level
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    app.run(debug=True)