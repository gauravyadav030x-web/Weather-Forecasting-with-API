/* ============================================
   WeatherML — js/ui.js
   DOM rendering & user interaction handlers
   ============================================ */

/** Currently loaded weather dataset (shared across modules) */
let currentWeatherData = null;

// ── DOM refs ──────────────────────────────────────────────────────────
const cityInput    = document.getElementById("cityInput");
const searchBtn    = document.getElementById("searchBtn");
const btnText      = document.getElementById("btnText");
const btnSpinner   = document.getElementById("btnSpinner");
const dashboard    = document.getElementById("dashboard");
const emptyState   = document.getElementById("emptyState");

// ── Search ────────────────────────────────────────────────────────────

async function fetchWeather() {
  const city = cityInput.value.trim();
  if (!city) return;

  // Loading state
  searchBtn.disabled = true;
  btnText.textContent = "Analyzing...";
  btnSpinner.classList.remove("hidden");

  // Simulate async API latency
  await new Promise(r => setTimeout(r, 700));

  const data = generateCityWeather(city);
  currentWeatherData = data;

  emptyState.classList.add("hidden");
  dashboard.classList.remove("hidden");

  renderDashboard(data);

  // Reset button
  searchBtn.disabled = false;
  btnText.textContent = "Predict Weather";
  btnSpinner.classList.add("hidden");
}

function quickCity(name) {
  cityInput.value = name;
  fetchWeather();
}

cityInput.addEventListener("keydown", e => {
  if (e.key === "Enter") fetchWeather();
});

// ── Dashboard renderer ────────────────────────────────────────────────

function renderDashboard(d) {
  // Current weather
  document.getElementById("wIcon").textContent = d.icon;
  document.getElementById("wTemp").innerHTML   = `${d.temp}<span class="temp-unit">°C</span>`;
  document.getElementById("wCity").textContent = `${d.city}, ${d.country}`;
  document.getElementById("wDesc").textContent = d.desc;

  // Stats
  document.getElementById("sHumidity").textContent = `${d.humidity}%`;
  document.getElementById("sWind").textContent     = `${d.wind} km/h`;
  document.getElementById("sFeels").textContent    = `${d.feels}°`;

  // Atmospheric extras
  document.getElementById("ePressure").textContent = `${d.pressure} hPa`;
  document.getElementById("eVis").textContent      = `${d.visibility} km`;
  document.getElementById("eSunrise").textContent  = d.sunrise;
  document.getElementById("eSunset").textContent   = d.sunset;

  // UV index
  document.getElementById("uviVal").textContent    = d.uvi;
  document.getElementById("uviMarker").style.left  = Math.min(d.uvi / 12 * 100, 100) + "%";

  // ML confidence bars (animated)
  setTimeout(() => {
    setBar("confT", "barT", d.confT);
    setBar("confP", "barP", d.confP);
    setBar("confW", "barW", d.confW);
  }, 200);

  // 7-day forecast cards
  document.getElementById("forecastRow").innerHTML = d.forecast.map(f => `
    <div class="forecast-day ${f.isToday ? "today" : ""}">
      <div class="day-name">${f.isToday ? "TODAY" : f.day}</div>
      <div class="day-icon">${f.icon}</div>
      <div class="day-high">${f.high}°</div>
      <div class="day-low">${f.low}°</div>
      <div class="day-rain">💧 ${f.rain}%</div>
    </div>
  `).join("");

  // Hourly strip
  document.getElementById("hourlyScroll").innerHTML = d.hourly.map(h => `
    <div class="hourly-item">
      <div class="hourly-time">${h.time}</div>
      <div class="hourly-icon">${h.icon}</div>
      <div class="hourly-temp">${h.temp}°</div>
    </div>
  `).join("");

  // Charts
  renderCharts(d);

  // Auto AI summary
  getAIInsight("auto", d);
}

// ── Helpers ───────────────────────────────────────────────────────────

function setBar(labelId, barId, pct) {
  document.getElementById(labelId).textContent  = pct + "%";
  document.getElementById(barId).style.width    = pct + "%";
}

// ── AI button wrappers (called from HTML) ─────────────────────────────

function triggerAI(type) {
  getAIInsight(type, currentWeatherData);
}
