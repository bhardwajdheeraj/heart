import joblib
import numpy as np
import os

FEATURE_ORDER = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal"
]

try:
    print("Testing model load...")
    model_path = "Model/best_rf_model.pkl"
    if not os.path.exists(model_path):
        # try lowercase if uppercase fails
        model_path = "model/best_rf_model.pkl"
    
    model = joblib.load(model_path)
    print("Model loaded successfully.")
    
    # Sample input (Low risk)
    features = [35.0, 1.0, 0.0, 120.0, 180.0, 0.0, 0.0, 170.0, 0.0, 0.0, 2.0, 0.0, 2.0]
    final = np.array([features])
    
    print("Testing predict...")
    pred = model.predict(final)[0]
    print(f"Prediction: {pred}")
    
    print("Testing predict_proba...")
    prob = model.predict_proba(final)[0][1]
    print(f"Probability: {prob}")
    
    print("Success!")
except Exception as e:
    import traceback
    traceback.print_exc()
