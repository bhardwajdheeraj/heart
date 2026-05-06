# HeartSense AI - Project Explanation for Examiner

## 1. Project Overview
**Project Name:** HeartSense AI
**Core Objective:** A full-stack web application that predicts a user's risk of heart disease based on clinical parameters using Machine Learning, and acts as an AI Health Assistant.

The system is built to provide an intuitive interface for users to enter medical data (like age, cholesterol, heart rate), receive an instant AI-driven prediction about their heart health, and consult a dedicated health chatbot for further guidance.

## 2. System Architecture
This project uses a decoupled **Client-Server Architecture**:
- **Frontend (Client):** Built with React.js (using Vite). It handles the User Interface (UI), forms, routing, and data visualization.
- **Backend (Server):** Built with Python Flask. It manages the business logic, handles secure authentication, runs the Machine Learning model, and communicates with the database.
- **Database:** MongoDB (NoSQL) is used to store user credentials, prediction history, and chat logs securely.

## 3. How the Frontend and Backend Integrate
The React frontend and Flask backend communicate via **RESTful APIs**:
1. **API Calls:** The frontend uses the `axios` library to send asynchronous HTTP requests (GET, POST, DELETE) to the backend endpoints (e.g., `/predict`, `/login`).
2. **Data Exchange:** Data is transmitted back and forth in **JSON (JavaScript Object Notation)** format. When a user submits their health data, React packages it into a JSON object and POSTs it to the Flask server.
3. **CORS Handling:** To allow the frontend (running on one port) to securely communicate with the backend (running on another port), we configured `Flask-CORS` in the backend.

## 4. Complete Data Flow (The "Predict" Scenario)
1. **Input:** The user fills out 13 clinical parameters (age, chest pain type, max heart rate, etc.) on the React prediction form and clicks "Predict".
2. **Request:** React uses `axios` to send a POST request with the form data as a JSON payload to the backend's `/predict` endpoint, attaching the user's JWT token for authentication.
3. **Processing (Backend):** 
   - Flask receives the JSON, verifies the user's identity via the JWT token, and extracts the data.
   - The data is formatted into a 2D NumPy array and passed to the pre-loaded Random Forest ML model (`.pkl` file).
4. **Prediction:** The Machine Learning model outputs a prediction (e.g., 1 for High Risk, 0 for Low Risk) along with a probability score.
5. **Storage:** Flask saves this prediction record into the MongoDB database under the user's profile.
6. **Response:** Flask sends the prediction result back to the React frontend as a JSON response.
7. **Display:** React receives the JSON, updates its state variables, and instantly renders the result on the user's screen using charts and risk meters.

## 5. Machine Learning Methodology
- **Dataset:** Cleveland Heart Disease dataset (13 independent features, 1 target variable).
- **Algorithm:** **Random Forest Classifier**. It was chosen because it's an ensemble learning method (combining multiple decision trees), which provides high accuracy, resists overfitting, and handles the complex, non-linear relationships found in medical data much better than linear models (like Logistic Regression).
- **Explainability (SHAP):** We incorporated SHAP (SHapley Additive exPlanations) to make the AI transparent. It explains the prediction by showing exactly which features (e.g., high cholesterol or age) contributed the most to the patient's risk score, building trust with the end user.
- **Deployment:** The trained model was serialized into a `.pkl` file using the `joblib` library. The Flask server loads this file into memory on startup so it can predict instantly without retraining.

## 6. Security and Authentication
- **JWT (JSON Web Tokens):** Used for maintaining secure user sessions. After login, the backend issues a token. The frontend sends this token with every subsequent request to prove the user is authenticated.
- **Password Hashing:** Passwords are never stored as plain text. We use `Bcrypt` to hash and salt user passwords before storing them in MongoDB. This protects user accounts even if the database is compromised.

## 7. Deployment Strategy
- **Frontend:** Hosted on **Vercel**, which serves the built static React files (HTML/CSS/JS) globally.
- **Backend:** Hosted on **Render** as a Python Web Service, utilizing **Gunicorn** (a production-grade WSGI server) to handle multiple concurrent API requests efficiently.
- **Environment Variables:** Sensitive information like API keys (`GROQ_API_KEY`), database URIs (`MONGO_URI`), and secrets (`JWT_SECRET_KEY`) are stored in environment variables, ensuring they are never exposed in the source code.
