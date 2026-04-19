from flask import Flask, request, jsonify
import numpy as np
import joblib
from flask_cors import CORS
import os
from groq import Groq
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
    set_access_cookies,
    unset_jwt_cookies
)
from pymongo import MongoClient
from datetime import datetime, timedelta
from bson.objectid import ObjectId
import traceback
import secrets

FEATURE_ORDER = [
    "age",
    "sex",
    "cp",
    "trestbps",
    "chol",
    "fbs",
    "restecg",
    "thalach",
    "exang",
    "oldpeak",
    "slope",
    "ca",
    "thal",
]

# -----------------------------
# SHAP Configuration
# -----------------------------
SHAP_ENABLED = False  # Disabled by default to prevent native library crashes on Windows
explainer = None
# try:
#     import shap
#     SHAP_ENABLED = True
# except ImportError:
#     shap = None

# -----------------------------
# Load Environment Variables
# -----------------------------
load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")
jwt_secret = os.getenv("JWT_SECRET_KEY")
mongo_uri = os.getenv("MONGO_URI")

# -----------------------------
# Flask Setup
# -----------------------------
app = Flask(__name__)

#  JWT CONFIG (must be set before JWTManager initialization)
app.config["JWT_SECRET_KEY"] = jwt_secret
# Accept JWT from cookies and Authorization header so frontend can fallback if browser blocks the cookie
app.config["JWT_TOKEN_LOCATION"] = ["cookies", "headers"]
# Use HTTPS only in production
is_production = os.getenv("ENVIRONMENT", "development") == "production"
app.config["JWT_COOKIE_SECURE"] = is_production  # True for HTTPS (production), False for HTTP (development)
app.config["JWT_ACCESS_COOKIE_PATH"] = "/"
app.config["JWT_COOKIE_CSRF_PROTECT"] = False
# For local development, use Lax; for HTTPS production set to None
app.config["JWT_COOKIE_SAMESITE"] = "None" if is_production else "Lax"


# Optional: enforce domain if needed (127.0.0.1 or localhost)
# app.config["JWT_COOKIE_DOMAIN"] = "127.0.0.1"

jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# ✅ CORS Configuration
frontend_urls = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://heart-inky-tau.vercel.app",  # Add your frontend Render URL
    os.getenv("FRONTEND_URL", "")  # Accept URL from environment
]

# Remove empty strings from list
frontend_urls = [url for url in frontend_urls if url]

CORS(
    app,
    supports_credentials=True,
    origins=frontend_urls
)

groq_client = Groq(api_key=groq_api_key)

# -----------------------------
# MongoDB Setup
# -----------------------------
mongo_client = MongoClient(mongo_uri)
db = mongo_client["heart_ai"]

users_collection = db["users"]
chat_collection = db["chat_sessions"]
prediction_collection = db["prediction_history"]

# -----------------------------
# Load ML Model
# -----------------------------
# Get the directory where app.py is located (back folder)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model", "best_rf_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
    print(f"[SUCCESS] Model Loaded Successfully from {MODEL_PATH}")
except Exception as e:
    print(f"[ERROR] Model Load Error: {e}")
    print(f"[ERROR] Attempted path: {MODEL_PATH}")
    print(f"[ERROR] File exists: {os.path.exists(MODEL_PATH)}")
    model = None

if SHAP_ENABLED and model is not None:
    try:
        explainer = shap.TreeExplainer(model)
        print("[SUCCESS] SHAP explainer initialized")
    except Exception as e:
        explainer = None
        print("[WARNING] SHAP explainer initialization failed:", e)

# -----------------------------
# Home
# -----------------------------
@app.route("/")
def home():
    return "HeartSense API Running"

# -----------------------------
# REGISTER
# -----------------------------
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")

    users_collection.insert_one({
        "email": email,
        "password": hashed_pw,
        "created_at": datetime.utcnow()
    })

    return jsonify({"message": "User registered successfully"})

# -----------------------------
# LOGIN
# -----------------------------
@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"error": "User not found"}), 404

    if not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user["_id"]))

    response = jsonify({
        "message": "Login successful",
        "email": email,
        "access_token": access_token
    })

    # ✅ SET COOKIE
    set_access_cookies(response, access_token)

    return response

# -----------------------------
# LOGOUT
# -----------------------------
@app.route("/logout", methods=["POST"])
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)
    return response

# -----------------------------
# GET CURRENT USER (/me)
# -----------------------------
@app.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()

        user = users_collection.find_one({"_id": ObjectId(user_id)})

        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "email": user["email"]
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# FORGOT PASSWORD
# -----------------------------
@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email required"}), 400

    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    reset_expiry = datetime.utcnow() + timedelta(minutes=15)

    # Update user with reset token
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"reset_token": reset_token, "reset_expiry": reset_expiry}}
    )

    # For now, return the reset link (no email service)
    reset_link = f"http://localhost:5173/reset-password/{reset_token}"

    return jsonify({
        "message": "Reset link generated",
        "reset_link": reset_link
    })

# -----------------------------
# RESET PASSWORD
# -----------------------------
@app.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json()
    token = data.get("token")
    new_password = data.get("password")

    if not token or not new_password:
        return jsonify({"error": "Token and password required"}), 400

    user = users_collection.find_one({"reset_token": token})
    if not user:
        return jsonify({"error": "Invalid token"}), 400

    if datetime.utcnow() > user["reset_expiry"]:
        return jsonify({"error": "Token expired"}), 400

    # Hash new password
    hashed_pw = bcrypt.generate_password_hash(new_password).decode("utf-8")

    # Update password and clear reset token
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"password": hashed_pw}, "$unset": {"reset_token": "", "reset_expiry": ""}}
    )

    return jsonify({"message": "Password reset successfully"})

# -----------------------------
# PREDICT
# -----------------------------
@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    try:
        if not model:
            return jsonify({"error": "Model not loaded"}), 500

        user_id = get_jwt_identity()
        data = request.get_json() or {}
        print(f"[PREDICT] Received request from user {user_id}")
        
        entry_id = data.get("entryId") or data.get("entry_id") or str(datetime.now().timestamp())


        cleaned_input = {
            k: float(v) if k not in {"entryId", "entry_id"} else v
            for k, v in data.items()
            if k not in {"entryId", "entry_id"}
        }

        features = [float(cleaned_input.get(key, 0.0)) for key in FEATURE_ORDER]
        final = np.array([features])

        print(f"[PREDICT] Running model prediction for entry {entry_id}...")
        pred = model.predict(final)[0]
        prob = model.predict_proba(final)[0][1]
        print(f"[PREDICT] Result: {pred}, Probability: {prob}")

        if prob > 0.6:
            risk = "High Risk"
        elif prob > 0.4:
            risk = "Moderate Risk"
        else:
            risk = "Low Risk"

        result = "Heart Disease Detected" if pred == 1 else "No Heart Disease"

        top_features = []
        if explainer is not None:
            try:
                shap_values = explainer.shap_values(final)
                if isinstance(shap_values, list):
                    shap_values = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
                else:
                    shap_values = shap_values[0]

                feature_scores = [float(value) for value in shap_values]
                top_features = sorted(
                    [
                        {"feature": FEATURE_ORDER[index], "impact": feature_scores[index]}
                        for index in range(len(FEATURE_ORDER))
                    ],
                    key=lambda item: abs(item["impact"]),
                    reverse=True,
                )[:5]
            except Exception as inner_error:
                print("⚠️ SHAP explanation error:", inner_error)
                top_features = []

        prediction_collection.insert_one({
            "user_id": user_id,
            "entry_id": entry_id,
            "input_data": cleaned_input,
            "prediction": result,
            "probability": float(prob),
            "risk_level": risk,
            "timestamp": datetime.now(),
            "top_features": top_features,
        })


        return jsonify({
            "prediction": result,
            "probability": float(prob),
            "risk_level": risk,
            "top_features": top_features,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -----------------------------
# DELETE PREDICTION
# -----------------------------
@app.route("/delete-prediction/<id>", methods=["DELETE"])
@jwt_required()
def delete_prediction(id):
    try:
        user_id = get_jwt_identity()
        query = {"user_id": user_id}

        try:
            query["_id"] = ObjectId(id)
        except Exception:
            query["entry_id"] = id

        deleted = prediction_collection.delete_one(query)

        if deleted.deleted_count == 0 and "entry_id" not in query and id.isdigit():
            try:
                timestamp = datetime.utcfromtimestamp(int(id) / 1000.0)
                deleted = prediction_collection.delete_one({
                    "user_id": user_id,
                    "timestamp": {
                        "$gte": timestamp - timedelta(seconds=1),
                        "$lte": timestamp + timedelta(seconds=1),
                    },
                })
            except Exception:
                deleted = deleted

        if deleted.deleted_count == 0:
            return jsonify({"error": "Prediction not found"}), 404

        return jsonify({"message": "Deleted successfully"})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -----------------------------
# CHAT
# -----------------------------
@app.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        message = data.get("message")
        
        if not message or not message.strip():
            return jsonify({"error": "Message cannot be empty"}), 400

        try:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a helpful medical assistant specialized in heart health and cardiovascular disease. Provide accurate, evidence-based medical information while always recommending users consult healthcare professionals."},
                    {"role": "user", "content": message}
                ],
                temperature=0.7,
                max_tokens=512,
            )

            reply = response.choices[0].message.content

            chat_collection.insert_one({
                "user_id": user_id,
                "message": message,
                "reply": reply,
                "timestamp": datetime.utcnow()
            })

            return jsonify({"reply": reply})
        
        except Exception as groq_error:
            print(f"Groq API Error: {str(groq_error)}")
            return jsonify({"error": f"AI service error: {str(groq_error)}"}), 503

    except Exception as e:
        print(f"Chat Error: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -----------------------------
# HISTORY
# -----------------------------
@app.route("/history", methods=["GET"])
@jwt_required()
def history():
    data = list(chat_collection.find({"user_id": get_jwt_identity()}, {"_id": 0}))
    return jsonify(data)

# -----------------------------
# PREDICTION HISTORY
# -----------------------------
@app.route("/prediction-history", methods=["GET"])
@jwt_required()
def prediction_history():
    data = list(prediction_collection.find({"user_id": get_jwt_identity()}, {"_id": 0}))
    return jsonify(data)

# -----------------------------
# STATS
@app.route("/stats", methods=["GET"])
@jwt_required()
def stats():
    user_id = get_jwt_identity()
    total = prediction_collection.count_documents({"user_id": user_id})
    high_risk = prediction_collection.count_documents({"user_id": user_id, "risk_level": "High Risk"})
    moderate_risk = prediction_collection.count_documents({"user_id": user_id, "risk_level": "Moderate Risk"})
    low_risk = prediction_collection.count_documents({"user_id": user_id, "risk_level": "Low Risk"})

    return jsonify({
        "total": int(total),
        "highRisk": int(high_risk),
        "moderateRisk": int(moderate_risk),
        "lowRisk": int(low_risk),
    })

# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug_mode = os.getenv("FLASK_ENV", "development") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
