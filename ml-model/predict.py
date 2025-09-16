"""
predict.py - Flask API for Fitness Model
----------------------------------------
Endpoints:
- GET  /          -> Health check
- POST /predict   -> Predict performance from JSON input
- GET  /metrics   -> Show model evaluation metrics (RMSE, MAE, R²)
"""

from flask import Flask, request, jsonify
import joblib
import pandas as pd
import os

app = Flask(__name__)

MODEL_PATH = 'fitness_pipeline.pkl'
METRICS_PATH = 'model_metrics.txt'

# ----------------------------
# Load model
# ----------------------------
if not os.path.exists(MODEL_PATH):
    raise RuntimeError(
        "❌ Model not found. Run train_model.py first or ensure Dockerfile builds it."
    )

model = joblib.load(MODEL_PATH)


# ----------------------------
# Routes
# ----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "ok",
        "message": "Fitness Prediction API is running",
        "endpoints": ["/predict", "/metrics"]
    })


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        # Convert to DataFrame for model
        df = pd.DataFrame([data])
        pred = model.predict(df)[0]

        return jsonify({
            "input": data,
            "predicted_performance": float(pred)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/metrics", methods=["GET"])
def metrics():
    if not os.path.exists(METRICS_PATH):
        return jsonify({"error": "Metrics file not found. Run train_model.py first."}), 404

    with open(METRICS_PATH, "r") as f:
        metrics_text = f.read().strip()

    # Convert metrics file into JSON
    metrics_json = {}
    for line in metrics_text.splitlines():
        if ":" in line:
            k, v = line.split(":")
            metrics_json[k.strip()] = float(v.strip())

    return jsonify(metrics_json)


# ----------------------------
# Run server
# ----------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
