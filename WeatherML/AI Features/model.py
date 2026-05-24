import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

def create_and_train_model():
    print("Generating synthetic weather dataset...")
    # Generate synthetic data for training
    np.random.seed(42)
    n_samples = 2000

    # Features
    # Temperature (C): -10 to 45
    temperature = np.random.uniform(-10, 45, n_samples)
    # Humidity (%): 10 to 100
    humidity = np.random.uniform(10, 100, n_samples)
    # Pressure (hPa): 980 to 1050
    pressure = np.random.uniform(980, 1050, n_samples)
    # Wind Speed (km/h): 0 to 100
    wind_speed = np.random.uniform(0, 100, n_samples)

    # Logic to determine weather condition based on features
    conditions = []
    for i in range(n_samples):
        t = temperature[i]
        h = humidity[i]
        p = pressure[i]
        w = wind_speed[i]

        if p < 1005 and h > 70:
            if t < 0:
                conditions.append('Snowy')
            else:
                conditions.append('Rainy')
        elif p > 1015 and h < 60:
            if w > 40:
                conditions.append('Windy')
            else:
                conditions.append('Sunny')
        elif h > 80:
            conditions.append('Cloudy')
        else:
            if t > 30:
                conditions.append('Sunny')
            elif t < 5:
                conditions.append('Cold')
            else:
                conditions.append('Partly Cloudy')

    # Create DataFrame
    df = pd.DataFrame({
        'temperature': temperature,
        'humidity': humidity,
        'pressure': pressure,
        'wind_speed': wind_speed,
        'condition': conditions
    })

    X = df[['temperature', 'humidity', 'pressure', 'wind_speed']]
    y = df['condition']

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Train model
    print("Training Random Forest Classifier...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train_scaled, y_train)

    # Save model and scaler
    print("Saving model and scaler...")
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/weather_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    
    print("Model training complete and saved successfully!")

if __name__ == "__main__":
    create_and_train_model()
