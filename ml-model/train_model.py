"""
train_model.py - Train an XGBoost regression model on fitness data
--------------------------------------------------------------
- Reads fitness_data.csv
- Preprocesses numeric + categorical features
- Trains an XGBoost regression model
- Evaluates performance (RMSE, R², MAE + CV scores)
- Saves the trained pipeline to fitness_pipeline.pkl
- Saves metrics to model_metrics.txt and model_metrics.json
"""

import numpy as np
import pandas as pd
import joblib
import json
import argparse
from xgboost import XGBRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error


def main(args):
    # 1. Load dataset
    print("📂 Loading dataset...")
    df = pd.read_csv("fitness_data.csv")
    X = df[["workout_type", "duration_minutes", "calories_intake", "sleep_hours"]]
    y = df["performance"]

    # 2. Define feature transformations
    numeric_features = ["duration_minutes", "calories_intake", "sleep_hours"]
    categorical_features = ["workout_type"]

    preprocessor = ColumnTransformer([
        ("num", "passthrough", numeric_features),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features)
    ])

    # 3. Define pipeline with preprocessing + model
    pipeline = Pipeline([
        ("pre", preprocessor),
        ("model", XGBRegressor(
            objective="reg:squarederror",
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            random_state=args.seed,
            verbosity=0
        ))
    ])

    # 4. Split dataset
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=args.seed
    )

    # 5. Train model
    print("🚀 Training model...")
    pipeline.fit(X_train, y_train)

    # 6. Evaluate performance
    preds = pipeline.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)

    # Cross-validation (5-fold on whole dataset)
    cv_rmse = -cross_val_score(
        pipeline, X, y, cv=5, scoring="neg_root_mean_squared_error"
    ).mean()
    cv_r2 = cross_val_score(pipeline, X, y, cv=5, scoring="r2").mean()

    print("✅ Model trained successfully!")
    print(f"📊 RMSE (holdout): {rmse:.3f}")
    print(f"📊 MAE  (holdout): {mae:.3f}")
    print(f"📊 R²   (holdout): {r2:.3f}")
    print(f"📊 CV RMSE (5-fold): {cv_rmse:.3f}")
    print(f"📊 CV R²   (5-fold): {cv_r2:.3f}")

    # 7. Save trained pipeline
    joblib.dump(pipeline, "fitness_pipeline.pkl")
    print("💾 Saved model to fitness_pipeline.pkl")

    # 8. Save metrics (TXT + JSON)
    metrics = {
        "RMSE": round(rmse, 3),
        "MAE": round(mae, 3),
        "R2": round(r2, 3),
        "CV_RMSE": round(cv_rmse, 3),
        "CV_R2": round(cv_r2, 3)
    }

    with open("model_metrics.txt", "w") as f:
        for k, v in metrics.items():
            f.write(f"{k}: {v}\n")

    with open("model_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print("📄 Metrics written to model_metrics.txt & model_metrics.json")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train fitness prediction model")
    parser.add_argument("--seed", type=int, default=42,
                        help="Random seed for reproducibility")
    parser.add_argument("--test-size", type=float, default=0.2,
                        help="Test size fraction (default 0.2)")
    args = parser.parse_args()

    main(args)
