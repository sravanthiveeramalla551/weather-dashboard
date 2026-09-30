# WeatherNow — Asynchronous JavaScript & RESTful APIs

## Features
- Fetch API with async/await
- Public REST APIs
- City search
- Geocoding API to find city coordinates
- Weather API to retrieve current weather
- Dynamic rendering from nested JSON objects
- Network/API error handling
- Loading state
- Responsive design
- Temperature, humidity, wind speed and apparent temperature
- Weather condition and icon
- No API key required

## APIs used
Open-Meteo:
- Geocoding: https://geocoding-api.open-meteo.com/
- Forecast: https://api.open-meteo.com/

## Run
Open `index.html` in a modern browser.

If your browser blocks requests when opening local files, use VS Code Live Server or another simple local web server.

## Main JavaScript concepts
1. `fetch()` sends asynchronous HTTP requests.
2. `async/await` makes asynchronous code easier to read.
3. `response.json()` converts the JSON response into JavaScript objects.
4. Nested values are read from objects such as `weather.current.temperature_2m`.
5. `try/catch/finally` handles successful requests, errors and loading completion.
6. DOM methods dynamically update the dashboard.
