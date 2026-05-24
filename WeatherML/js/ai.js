/* ============================================
   WeatherML — js/ai.js
   Claude API streaming integration
   ============================================ */

/**
 * Build the prompt text for each insight type.
 * @param {string} type   - "auto" | "detailed" | "travel" | "health"
 * @param {object} d      - weather data object
 * @returns {string}
 */
function buildPrompt(type, d) {
  const forecastHighs = d.forecast.map(f => f.high + "°").join(", ");
  const trendArrow    = d.forecast.map(f => f.high + "°").join("→");

  const prompts = {
    auto: `You are WeatherML, an AI meteorologist. Analyze this weather data for ${d.city} and provide a concise, insightful 3-4 sentence summary covering current conditions, what to expect today, and any notable weather patterns.

Data: Temp ${d.temp}°C (feels ${d.feels}°C), ${d.desc}, Humidity ${d.humidity}%, Wind ${d.wind} km/h, Pressure ${d.pressure} hPa, UV ${d.uvi}.
7-day forecast highs: ${forecastHighs}.

Be professional, specific, and helpful. No markdown or bullet points.`,

    detailed: `You are an advanced ML meteorological system. Provide a detailed weather analysis for ${d.city}. Include:
1) Current atmospheric analysis — ${d.temp}°C temp, ${d.pressure} hPa pressure, ${d.humidity}% humidity.
2) Pattern recognition from 7-day trend: ${trendArrow}.
3) ML model confidence — Temp: ${d.confT}%, Precip: ${d.confP}%, Wind: ${d.confW}%.
4) Meteorological explanation of current "${d.desc}" conditions.
5) Forecast reliability assessment.

Keep under 200 words. Professional tone. No markdown.`,

    travel: `You are a travel weather advisor. Weather in ${d.city}: ${d.temp}°C, ${d.desc}, ${d.humidity}% humidity, UV index ${d.uvi}, wind ${d.wind} km/h.

Give a 150-word travel advisory covering: best activities today, what to pack, ideal outdoor times, and any weather warnings. Practical and enthusiastic. No markdown.`,

    health: `You are a health meteorologist. Analyze health implications of ${d.city}'s weather: ${d.temp}°C (feels ${d.feels}°C), ${d.humidity}% humidity, UV ${d.uvi}, ${d.desc}, pressure ${d.pressure} hPa.

Provide 150-word health guidance covering: heat/cold stress risk, UV protection, exercise recommendations, and who should take precautions (elderly, children, respiratory conditions). Practical and evidence-based. No markdown.`,
  };

  return prompts[type] || prompts.auto;
}

/**
 * Call Claude API with streaming and render tokens into #aiOutput.
 * @param {string} type          - insight type
 * @param {object} weatherData   - current weather dataset
 */
async function getAIInsight(type, weatherData) {
  if (!weatherData) return;

  const output = document.getElementById("aiOutput");
  output.innerHTML = '<span class="ai-cursor"></span>';

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        stream: true,
        messages: [{ role: "user", content: buildPrompt(type, weatherData) }],
      }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);

    const reader  = response.body.getReader();
    const decoder = new TextDecoder();
    let text = "";
    output.innerHTML = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;
        try {
          const ev = JSON.parse(jsonStr);
          if (ev.type === "content_block_delta" && ev.delta?.text) {
            text += ev.delta.text;
            output.innerHTML = text + '<span class="ai-cursor"></span>';
            output.scrollTop = output.scrollHeight;
          }
        } catch (_) { /* skip malformed chunks */ }
      }
    }

    // Remove blinking cursor when done
    output.innerHTML = text;

  } catch (err) {
    // Graceful fallback when API is unavailable
    const d = weatherData;
    output.innerHTML =
      `[Offline Mode — Local Analysis]\n\n` +
      `Current conditions in ${d.city}: ${d.temp}°C with ${d.desc}. ` +
      `Humidity is ${d.humidity}% and wind is ${d.wind} km/h. ` +
      `UV index is ${d.uvi}/11. ` +
      `ML model shows ${d.confT}% confidence in temperature prediction and ` +
      `${d.confP}% in precipitation. ` +
      `Pressure at ${d.pressure} hPa indicates ${d.pressure < 1010 ? "low pressure — expect dynamic weather" : "stable high-pressure conditions"}.`;
  }
}
