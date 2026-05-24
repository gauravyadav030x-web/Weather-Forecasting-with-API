# 🌦️ WeatherML — AI-Powered Weather Prediction

A production-grade weather dashboard powered by **Claude AI** and **Chart.js**, built with vanilla HTML, CSS, and JavaScript.

---

## 📁 Project Structure

```
WeatherML/
├── index.html          ← Main entry point
├── README.md           ← You are here
├── css/
│   └── style.css       ← All styles (CSS variables, layout, animations)
└── js/
    ├── weather.js      ← Weather data engine & city simulation
    ├── charts.js       ← Chart.js temperature & precipitation charts
    ├── ai.js           ← Claude API streaming integration
    └── ui.js           ← DOM rendering & interaction handlers
```

---

## 🚀 Getting Started

### Option 1 — Open directly
Just double-click `index.html` in your file manager. It runs entirely in the browser — no build step needed.

### Option 2 — Local dev server (recommended)
```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .

# Then open: http://localhost:8080
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 City Search | Search any city worldwide, press Enter or click the button |
| 🌡️ Current Conditions | Temperature, feels like, humidity, wind, pressure, visibility |
| 📊 ML Confidence Bars | Animated confidence scores for temperature / precipitation / wind |
| 📅 7-Day Forecast | Icon, high/low temps, rain probability for each day |
| ⏰ 24h Hourly Strip | Scrollable hourly temperature and condition breakdown |
| 📈 Temperature Chart | ML prediction vs historical average (Chart.js line chart) |
| 🌧️ Precipitation Chart | Rain probability bar chart colour-coded by intensity |
| 🌅 Atmospheric Data | Pressure, visibility, sunrise/sunset, UV index slider |
| 🤖 Claude AI Insights | Streaming AI analysis — Auto summary, Deep Analysis, Travel Advisory, Health Impact |
| 📱 Fully Responsive | Works on mobile, tablet, and desktop |

---

## 🤖 Claude AI Integration

The app calls the **Anthropic Messages API** with streaming enabled. Three insight modes:

- **📊 Deep Analysis** — Full meteorological breakdown with ML confidence commentary
- **✈️ Travel Advisory** — Practical travel tips for the current conditions
- **💊 Health Impact** — Health-focused guidance (UV, heat stress, air quality)

If the API is unavailable, the app falls back to a local offline analysis.

### API endpoint used
```
POST https://api.anthropic.com/v1/messages
Model: claude-sonnet-4-20250514
Stream: true
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, grid, flexbox, keyframe animations) |
| Logic | Vanilla JavaScript (ES2020+) |
| Charts | [Chart.js 4.4](https://www.chartjs.org/) via CDN |
| Fonts | Syne + JetBrains Mono (Google Fonts) |
| AI | [Anthropic Claude API](https://docs.anthropic.com) |

---

## 📐 Architecture Notes

- **`weather.js`** uses a seeded pseudo-random engine — same city always returns identical data, making the UI predictable during development.
- **`charts.js`** destroys and recreates Chart.js instances on each search to prevent canvas memory leaks.
- **`ai.js`** reads the SSE stream from the Anthropic API and renders tokens progressively into the DOM.
- **`ui.js`** is the orchestrator — it calls functions from all other modules and owns the `currentWeatherData` state.

---

## 🔑 Notes

- No API key is required in the HTML — the Claude API key is handled server-side by the Anthropic platform when running inside Claude.ai artifacts.
- For standalone deployment outside Claude.ai, you would add your API key to the `fetch` headers in `js/ai.js`.

---

## 📄 License

MIT — free to use, modify, and distribute.
