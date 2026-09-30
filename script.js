// =========================================================
// WeatherNow — Asynchronous JavaScript & RESTful APIs
// Fetch API + async/await + error handling + JSON rendering
// =========================================================

const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const searchButton = searchForm.querySelector("button");
const statusElement = document.querySelector("#status");
const weatherContent = document.querySelector("#weatherContent");

// Public APIs:
// 1. Open-Meteo Geocoding API converts a city name to latitude/longitude.
// 2. Open-Meteo Forecast API returns current weather JSON.
// No API key is required.

// Weather codes from Open-Meteo WMO interpretation.
const weatherDescriptions = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Depositing rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Moderate drizzle", "🌦️"],
  55: ["Dense drizzle", "🌧️"],
  56: ["Light freezing drizzle", "🌧️"],
  57: ["Dense freezing drizzle", "🌧️"],
  61: ["Slight rain", "🌦️"],
  63: ["Moderate rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  66: ["Light freezing rain", "🌧️"],
  67: ["Heavy freezing rain", "🌧️"],
  71: ["Slight snow", "🌨️"],
  73: ["Moderate snow", "🌨️"],
  75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "❄️"],
  80: ["Slight rain showers", "🌦️"],
  81: ["Moderate rain showers", "🌧️"],
  82: ["Violent rain showers", "⛈️"],
  85: ["Slight snow showers", "🌨️"],
  86: ["Heavy snow showers", "🌨️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with heavy hail", "⛈️"]
};

// Search city -> coordinates
async function getCoordinates(city) {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search?` +
    `name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Location service failed (${response.status}).`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error(`Could not find "${city}". Please check the spelling.`);
  }

  return data.results[0];
}

// Coordinates -> current weather
async function getWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude,
    longitude,
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    timezone: "auto"
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather service failed (${response.status}).`);
  }

  return response.json();
}

// Fetch both API responses using async/await
async function searchWeather(city) {
  setLoading(true);

  try {
    const location = await getCoordinates(city);
    const weather = await getWeather(location.latitude, location.longitude);

    renderWeather(location, weather);

    setStatus(`Weather loaded for ${location.name}.`, false);
  } catch (error) {
    console.error("Weather request error:", error);
    showError(error.message || "Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
}

// Dynamic rendering of nested JSON data
function renderWeather(location, weather) {
  const current = weather.current;
  const units = weather.current_units;
  const [description, icon] =
    weatherDescriptions[current.weather_code] || ["Unknown conditions", "🌡️"];

  const placeParts = [location.name, location.admin1, location.country]
    .filter(Boolean);

  weatherContent.innerHTML = `
    <div class="weather-result">
      <div class="location">
        <p class="location-label">CURRENT LOCATION</p>
        <h2>${escapeHTML(placeParts.join(", "))}</h2>
        <p class="coordinates">
          ${Number(location.latitude).toFixed(2)}°,
          ${Number(location.longitude).toFixed(2)}°
          · ${escapeHTML(weather.timezone || location.timezone || "")}
        </p>
      </div>

      <div class="current-weather">
        <article class="temperature-card">
          <div class="condition">${icon} ${escapeHTML(description)}</div>
          <div class="temperature">
            ${formatNumber(current.temperature_2m)}
            <sup>${escapeHTML(units.temperature_2m)}</sup>
          </div>
          <p class="updated">
            Feels like ${formatNumber(current.apparent_temperature)}
            ${escapeHTML(units.apparent_temperature)}
          </p>
          <p class="updated">
            Updated: ${formatDateTime(current.time)}
          </p>
        </article>

        <div class="metrics">
          <article class="metric">
            <div class="metric-icon">💧</div>
            <p class="metric-label">HUMIDITY</p>
            <p class="metric-value">
              ${formatNumber(current.relative_humidity_2m)}
              ${escapeHTML(units.relative_humidity_2m)}
            </p>
          </article>

          <article class="metric">
            <div class="metric-icon">💨</div>
            <p class="metric-label">WIND SPEED</p>
            <p class="metric-value">
              ${formatNumber(current.wind_speed_10m)}
              ${escapeHTML(units.wind_speed_10m)}
            </p>
          </article>

          <article class="metric">
            <div class="metric-icon">${icon}</div>
            <p class="metric-label">CONDITION</p>
            <p class="metric-value">${escapeHTML(description)}</p>
          </article>
        </div>
      </div>
    </div>
  `;
}

function formatNumber(value) {
  return Number(value).toFixed(1);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function setLoading(isLoading) {
  searchButton.disabled = isLoading;
  cityInput.disabled = isLoading;

  if (isLoading) {
    searchButton.innerHTML = '<span class="spinner"></span>Loading';
    setStatus("Fetching live weather data...", false, true);
  } else {
    searchButton.textContent = "Search";
    cityInput.disabled = false;
  }
}

function setStatus(message, isError = false, isLoading = false) {
  statusElement.className = "status";

  if (isError) statusElement.classList.add("error");
  if (isLoading) statusElement.classList.add("loading");

  statusElement.textContent = message;
}

function showError(message) {
  weatherContent.innerHTML = `
    <div class="welcome">
      <div class="weather-icon">⚠️</div>
      <h2>Unable to load weather</h2>
      <p>${escapeHTML(message)}</p>
    </div>
  `;

  setStatus(message, true);
}

function escapeHTML(value) {
  const element = document.createElement("div");
  element.textContent = value ?? "";
  return element.innerHTML;
}

// Search form event
searchForm.addEventListener("submit", async event => {
  event.preventDefault();

  const city = cityInput.value.trim();

  if (!city) {
    setStatus("Please enter a city name.", true);
    cityInput.focus();
    return;
  }

  await searchWeather(city);
});
