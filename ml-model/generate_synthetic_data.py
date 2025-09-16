"""
generate_synthetic_data.py - Create synthetic fitness dataset
--------------------------------------------------------------
- Generates random fitness activity logs
- Includes workout type, duration, calories, sleep, and performance
- Saves to fitness_data.csv for model training
"""

import pandas as pd
import random
import numpy as np
import argparse
from datetime import datetime, timedelta

# -------------------------
# Configurations
# -------------------------
DEFAULT_ROWS = 500
WORKOUT_TYPES = ['run', 'strength', 'cycle', 'hiit', 'yoga']
TYPE_BONUS = {
    'run': 3.0,
    'strength': 4.0,
    'cycle': 2.5,
    'hiit': 4.5,
    'yoga': 0.5
}

def generate_data(n_rows=DEFAULT_ROWS, seed=42):
    random.seed(seed)
    np.random.seed(seed)

    rows = []
    start_date = datetime(2025, 1, 1)

    for i in range(n_rows):
        t = random.choice(WORKOUT_TYPES)
        duration = random.randint(15, 90)                   # minutes
        calories = random.randint(1400, 3200)               # kcal
        sleep = round(random.uniform(4.5, 9.0), 1)          # hours

        # performance = base + duration effect + sleep effect + type bias + noise
        base = 10
        type_bonus = TYPE_BONUS[t]
        perf = (
            base
            + 0.08 * duration
            + 0.6 * (sleep - 6)
            + type_bonus
            + random.normalvariate(0, 1.5)
        )

        date = start_date + timedelta(days=i % 90)          # spread across 3 months
        rows.append({
            'date': date.strftime('%Y-%m-%d'),
            'workout_type': t,
            'duration_minutes': duration,
            'calories_intake': calories,
            'sleep_hours': sleep,
            'performance': round(perf, 2)
        })

    return pd.DataFrame(rows)

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic fitness dataset")
    parser.add_argument('--rows', type=int, default=DEFAULT_ROWS, help='Number of rows to generate')
    parser.add_argument('--seed', type=int, default=42, help='Random seed for reproducibility')
    args = parser.parse_args()

    df = generate_data(args.rows, args.seed)
    df.to_csv('fitness_data.csv', index=False)

    print(f"✅ Generated fitness_data.csv with {len(df)} rows")
    print("📊 Dataset stats:")
    print("   - Duration:", df['duration_minutes'].min(), "to", df['duration_minutes'].max())
    print("   - Calories:", df['calories_intake'].min(), "to", df['calories_intake'].max())
    print("   - Sleep   :", df['sleep_hours'].min(), "to", df['sleep_hours'].max())
    print("   - Perf    :", df['performance'].min(), "to", df['performance'].max())

if __name__ == "__main__":
    main()
