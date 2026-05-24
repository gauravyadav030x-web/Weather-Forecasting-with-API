/* ============================================
   WeatherML — js/charts.js
   Chart.js temperature & precipitation charts
   ============================================ */

let tempChartInst  = null;
let precipChartInst = null;

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#6b8faa",
        font: { family: "JetBrains Mono", size: 11 },
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#6b8faa", font: { family: "JetBrains Mono", size: 11 } },
      grid:  { color: "rgba(99,179,237,0.06)" },
    },
    y: {
      ticks: { color: "#6b8faa", font: { family: "JetBrains Mono", size: 11 } },
      grid:  { color: "rgba(99,179,237,0.06)" },
    },
  },
};

/**
 * Render (or re-render) both charts with fresh data.
 * @param {object} data - output of generateCityWeather()
 */
function renderCharts(data) {
  // Destroy old instances to avoid canvas conflicts
  if (tempChartInst)   tempChartInst.destroy();
  if (precipChartInst) precipChartInst.destroy();

  // ── Temperature trend ──────────────────────────
  const tCtx = document.getElementById("tempChart").getContext("2d");
  tempChartInst = new Chart(tCtx, {
    type: "line",
    data: {
      labels: data.chartLabels,
      datasets: [
        {
          label: "ML Prediction (°C)",
          data: data.mlPred,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.08)",
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#3b82f6",
          pointRadius: 4,
          borderWidth: 2,
        },
        {
          label: "Historical Avg (°C)",
          data: data.historical,
          borderColor: "#8b5cf6",
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          pointBackgroundColor: "#8b5cf6",
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    },
    options: { ...CHART_DEFAULTS },
  });

  // ── Precipitation probability ──────────────────
  const pCtx = document.getElementById("precipChart").getContext("2d");
  precipChartInst = new Chart(pCtx, {
    type: "bar",
    data: {
      labels: data.chartLabels,
      datasets: [
        {
          label: "Rain Probability (%)",
          data: data.precipData,
          backgroundColor: data.precipData.map(v =>
            v > 60 ? "rgba(59,130,246,0.7)"
            : v > 30 ? "rgba(6,182,212,0.5)"
            : "rgba(99,179,237,0.3)"
          ),
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    },
    options: {
      ...CHART_DEFAULTS,
      plugins: {
        ...CHART_DEFAULTS.plugins,
        legend: { display: false },
      },
    },
  });
}
