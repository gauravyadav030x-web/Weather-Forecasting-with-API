const form = document.getElementById("prediction-form");

const predictionOutput = document.getElementById("prediction-output");
const confidenceContainer = document.getElementById("confidence-container");
const confidenceValue = document.getElementById("confidence-value");
const confidenceFill = document.getElementById("confidence-fill");
const loadingState = document.getElementById("loading-state");
const resultState = document.getElementById("result-state");
const logList = document.getElementById("log-list");

// Slider sync
function connectSlider(inputId, sliderId) {
    const input = document.getElementById(inputId);
    const slider = document.getElementById(sliderId);

    slider.addEventListener("input", () => {
        input.value = slider.value;
    });

    input.addEventListener("input", () => {
        slider.value = input.value;
    });
}

connectSlider("temperature", "temp-slider");
connectSlider("humidity", "hum-slider");
connectSlider("pressure", "pres-slider");
connectSlider("wind_speed", "wind-slider");

// Form submit
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    loadingState.classList.remove("hidden");

    const data = {
        temperature: document.getElementById("temperature").value,
        humidity: document.getElementById("humidity").value,
        pressure: document.getElementById("pressure").value,
        wind_speed: document.getElementById("wind_speed").value
    };

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        loadingState.classList.add("hidden");

        if (result.error) {
            predictionOutput.innerText = result.error;
            return;
        }

        predictionOutput.innerText = result.prediction;

        confidenceContainer.classList.remove("hidden");

        const confidence = result.confidence.toFixed(2);

        confidenceValue.innerText = confidence + "%";
        confidenceFill.style.width = confidence + "%";

        logList.innerHTML += `
            <li>
                <i class="fa-solid fa-check-circle"></i>
                Prediction completed successfully.
            </li>
        `;

    } catch (error) {
        loadingState.classList.add("hidden");

        predictionOutput.innerText = "Server Error!";
        console.error(error);
    }
});