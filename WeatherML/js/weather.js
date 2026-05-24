/* ============================================
   WeatherML — js/weather.js
   Weather data engine & city simulation
   ============================================ */

const weatherDB = {
  "mumbai":    { country:"IN", lat:19.08, lon:72.88 },
  "london":    { country:"GB", lat:51.51, lon:-0.13 },
  "tokyo":     { country:"JP", lat:35.69, lon:139.69 },
  "new york":  { country:"US", lat:40.71, lon:-74.01 },
  "dubai":     { country:"AE", lat:25.20, lon:55.27 },
  "sydney":    { country:"AU", lat:-33.87, lon:151.21 },
  "paris":     { country:"FR", lat:48.86, lon:2.35 },
  "berlin":    { country:"DE", lat:52.52, lon:13.41 },
  "singapore": { country:"SG", lat:1.29,  lon:103.85 },
  "cairo":     { country:"EG", lat:30.06, lon:31.25 },
  "raipur":    { country:"IN", lat:21.25, lon:81.62 },
  "delhi":     { country:"IN", lat:28.61, lon:77.21 },
  "bangalore": { country:"IN", lat:12.97, lon:77.59 },
};

const weatherConditions = [
  { icon:"☀️",  desc:"Clear sky",             cloud:5  },
  { icon:"🌤️", desc:"Few clouds",             cloud:20 },
  { icon:"⛅",  desc:"Partly cloudy",          cloud:45 },
  { icon:"🌦️", desc:"Light rain showers",     cloud:65 },
  { icon:"🌧️", desc:"Moderate rain",          cloud:80 },
  { icon:"⛈️", desc:"Thunderstorm",           cloud:90 },
  { icon:"🌫️", desc:"Misty / foggy",          cloud:70 },
  { icon:"🌩️", desc:"Heavy thunderstorm",     cloud:95 },
];

const DAYS = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

/**
 * Seeded pseudo-random number in [min, max]
 */
function seededRand(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.floor(r * (max - min + 1)) + min;
}

/**
 * Generate full weather dataset for a given city name.
 * Returns a plain object consumed by ui.js and charts.js
 */
function generateCityWeather(city) {
  const key  = city.toLowerCase().trim();
  const info = weatherDB[key] || { country:"?", lat:0, lon:0 };
  const seed = [...city].reduce((s, c) => s + c.charCodeAt(0), 0);

  // Base temperature (latitude-adjusted)
  const baseTemp = 40 - Math.abs(info.lat) * 0.5 + seededRand(seed, -5, 10);

  const cond     = weatherConditions[seededRand(seed + 1, 0, weatherConditions.length - 1)];
  const humidity = seededRand(seed + 2, 30, 95);
  const wind     = seededRand(seed + 3, 5, 55);
  const pressure = seededRand(seed + 4, 985, 1030);
  const visibility = seededRand(seed + 5, 5, 20);
  const uvi      = seededRand(seed + 6, 1, 11);
  const feels    = baseTemp - seededRand(seed + 7, 0, 5);

  // Sunrise / Sunset
  const srH    = seededRand(seed + 8, 5, 7);
  const ssH    = seededRand(seed + 9, 17, 20);
  const srMin  = seededRand(seed + 10, 0, 59).toString().padStart(2, "0");
  const ssMin  = seededRand(seed + 11, 0, 59).toString().padStart(2, "0");
  const sunrise = `${srH}:${srMin} AM`;
  const sunset  = `${ssH > 12 ? ssH - 12 : ssH}:${ssMin} PM`;

  // 7-day forecast
  const today    = new Date();
  const forecast = Array.from({ length: 7 }, (_, d) => {
    const dt   = new Date(today);
    dt.setDate(dt.getDate() + d);
    const fc   = weatherConditions[seededRand(seed + d * 7, 0, weatherConditions.length - 1)];
    const high = Math.round(baseTemp + seededRand(seed + d * 3, -3, 6));
    const low  = Math.round(high - seededRand(seed + d * 5, 4, 12));
    const rain = seededRand(seed + d * 11, 0, 80);
    return { day: DAYS[dt.getDay()], icon: fc.icon, desc: fc.desc, high, low, rain, isToday: d === 0 };
  });

  // 24-hour breakdown
  const now    = new Date();
  const hourly = Array.from({ length: 24 }, (_, h) => {
    const t    = new Date(now);
    t.setHours(t.getHours() + h);
    const hc   = weatherConditions[seededRand(seed + h * 13, 0, weatherConditions.length - 1)];
    const htemp = baseTemp + Math.sin((h + 6) * Math.PI / 12) * 4 + seededRand(seed + h, -2, 2);
    return {
      time: t.getHours().toString().padStart(2, "0") + ":00",
      icon: hc.icon,
      temp: Math.round(htemp),
    };
  });

  // ML confidence scores
  const confT = seededRand(seed + 99, 78, 96);
  const confP = seededRand(seed + 98, 65, 90);
  const confW = seededRand(seed + 97, 70, 92);

  // Chart data
  const chartLabels = forecast.map(f => f.day);
  const mlPred      = forecast.map(f => f.high);
  const historical  = forecast.map((f, i) => f.high - seededRand(seed + i * 17, -4, 4));
  const precipData  = forecast.map(f => f.rain);

  // Formatted city name
  const cityName = city.split(" ").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");

  return {
    city: cityName,
    country: info.country,
    temp: Math.round(baseTemp),
    feels: Math.round(feels),
    icon: cond.icon,
    desc: cond.desc,
    humidity, wind, pressure, visibility, uvi,
    sunrise, sunset,
    forecast, hourly,
    chartLabels, mlPred, historical, precipData,
    confT, confP, confW,
  };
}
