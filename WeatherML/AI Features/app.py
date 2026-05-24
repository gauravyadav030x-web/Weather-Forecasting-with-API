from flask import Flask, request, jsonify, render_template
import joblib
import os
import numpy as np

app = Flask(__name__, template_folder='.', static_folder='.', static_url_path='')

# Load model and scaler
model_path = 'models/weather_model.pkl'
scaler_path = 'models/scaler.pkl'

model = None
scaler = None

if os.path.exists(model_path) and os.path.exists(scaler_path):
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print("Model and scaler loaded successfully.")
else:
    print("Warning: Model files not found. Please run model.py first.")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or scaler is None:
        return jsonify({'error': 'Model not trained yet. Please run model.py.'}), 500
        
    try:
        data = request.json
        
        # Extract features
        temp = float(data.get('temperature', 0))
        humidity = float(data.get('humidity', 0))
        pressure = float(data.get('pressure', 0))
        wind = float(data.get('wind_speed', 0))
        
        # Prepare input
        features = np.array([[temp, humidity, pressure, wind]])
        
        # Scale input
        features_scaled = scaler.transform(features)
        
        # Predict
        prediction = model.predict(features_scaled)[0]
        
        # Get probability
        probabilities = model.predict_proba(features_scaled)[0]
        confidence = float(max(probabilities)) * 100
        
        return jsonify({
            'prediction': prediction,
            'confidence': confidence,
            'features_used': {
                'temperature': temp,
                'humidity': humidity,
                'pressure': pressure,
                'wind_speed': wind
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
