import os
import joblib
import shap
import numpy as np

# Load model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "Model", "best_rf_model.pkl")
model = joblib.load(MODEL_PATH)

explainer = shap.TreeExplainer(model)
dummy_input = np.array([[35, 1, 0, 120, 180, 0, 0, 170, 0, 0.0, 2, 0, 2]])
shap_values = explainer.shap_values(dummy_input)

if isinstance(shap_values, list):
    shap_values = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
else:
    shap_values = shap_values[0]
    if len(shap_values.shape) == 2 and shap_values.shape[1] == 2:
        shap_values = shap_values[:, 1]

feature_scores = [float(value) for value in shap_values]
print("feature_scores length:", len(feature_scores))
print(feature_scores)
