import requests
import json

url = "http://127.0.0.1:5000/predict"
payload = {
    "age": 35,
    "sex": 1,
    "cp": 0,
    "trestbps": 120,
    "chol": 180,
    "fbs": 0,
    "restecg": 0,
    "thalach": 170,
    "exang": 0,
    "oldpeak": 0.0,
    "slope": 2,
    "ca": 0,
    "thal": 2,
    "entryId": "12345"
}

try:
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response Body:", json.dumps(response.json(), indent=2))
except Exception as e:
    print("Failed to connect:", e)
