/* ===========================================================
   ReliefMap
   Live Weather Module (Open-Meteo — free, no API key)
=========================================================== */

"use strict";

/* ===========================================================
   CHENNAI COORDINATES
=========================================================== */

const CHENNAI = {
    lat: 13.0827,
    lon: 80.2707,
    name: "Chennai"
};

/* ===========================================================
   WEATHER CODE → LABEL + ICON
=========================================================== */

function weatherDetails(code) {

    const map = {
        0:  ["Clear Sky", "fa-sun"],
        1:  ["Mainly Clear", "fa-sun"],
        2:  ["Partly Cloudy", "fa-cloud-sun"],
        3:  ["Overcast", "fa-cloud"],
        45: ["Foggy", "fa-smog"],
        48: ["Icy Fog", "fa-smog"],
        51: ["Light Drizzle", "fa-cloud-rain"],
        53: ["Drizzle", "fa-cloud-rain"],
        55: ["Heavy Drizzle", "fa-cloud-showers-heavy"],
        61: ["Light Rain", "fa-cloud-rain"],
        63: ["Rain", "fa-cloud-rain"],
        65: ["Heavy Rain", "fa-cloud-showers-heavy"],
        66: ["Freezing Rain", "fa-snowflake"],
        67: ["Freezing Rain", "fa-snowflake"],
        71: ["Light Snow", "fa-snowflake"],
        73: ["Snow", "fa-snowflake"],
        75: ["Heavy Snow", "fa-snowflake"],
        80: ["Light Showers", "fa-cloud-rain"],
        81: ["Showers", "fa-cloud-showers-heavy"],
        82: ["Violent Showers", "fa-cloud-showers-heavy"],
        95: ["Thunderstorm", "fa-cloud-bolt"],
        96: ["Thunderstorm", "fa-cloud-bolt"],
        99: ["Severe Storm", "fa-tornado"]
    };

    const [label, icon] = map[code] || ["Unknown", "fa-cloud"];

    return { label, icon };

}

/* ===========================================================
   LOAD LIVE WEATHER
=========================================================== */

async function loadWeather() {

    const url =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${CHENNAI.lat}` +
        `&longitude=${CHENNAI.lon}` +
        "&current_weather=true" +
        "&daily=temperature_2m_max,temperature_2m_min,weathercode" +
        "&timezone=auto&forecast_days=7";

    try {

        const controller = new AbortController();

        const timer = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(url, {
            signal: controller.signal
        });

        clearTimeout(timer);

        if (!res.ok) throw new Error("Weather fetch failed");

        const data = await res.json();

        renderWeather(data);

        return true;

    }

    catch (error) {

        console.warn("Weather offline:", error.message);

        // Update the navbar weather text
        const weatherText = document.getElementById("nbWeatherText");
        if (weatherText) weatherText.textContent = "Chennai • Weather unavailable";

        return false;

    }

}

/* ===========================================================
   RENDER WEATHER
=========================================================== */

function renderWeather(data) {

    const current = data.current_weather || data.current;

    if (!current) {
        return;
    }

    const temperature = current.temperature ?? current.temperature_2m ?? null;
    const weatherCode = current.weathercode ?? current.weather_code ?? null;
    const humidity = current.relativehumidity_2m ?? current.relative_humidity_2m ?? null;
    const windSpeed = current.windspeed ?? current.wind_speed_10m ?? null;
    const precipitation = current.precipitation ?? current.precip ?? null;

    const { label, icon } = weatherDetails(weatherCode);

    /* Main temperature + condition */
    const tempEl = document.querySelector(".temperature");
    if (tempEl && typeof temperature === "number") {
        tempEl.textContent = `${Math.round(temperature)}°`;
    }

    const condEl = document.querySelector(".weather-main h3 + p");
    if (condEl) condEl.textContent = label;

    /* Stats */
    setStat("Humidity", humidity !== null ? `${Math.round(humidity)}%` : "N/A");
    setStat("Wind", windSpeed !== null ? `${Math.round(windSpeed)} km/h` : "N/A");
    setStat("Rain", precipitation !== null ? `${Math.round(precipitation)} mm` : "N/A");
    setStat("Visibility", "OK");

    /* Navbar weather status text */
    const weatherText = document.getElementById("nbWeatherText");
    if (weatherText) {
        weatherText.textContent = typeof temperature === "number"
            ? `Chennai • ${label} • ${Math.round(temperature)}°C`
            : `Chennai • ${label}`;
    }

    /* 7-day forecast */
    renderForecast(data.daily);

}

/* ===========================================================
   SET STAT VALUE
=========================================================== */

function setStat(label, value) {

    const stats = document.querySelectorAll(".weather-stats div");

    stats.forEach(stat => {

        const span = stat.querySelector("span");

        const strong = stat.querySelector("strong");

        if (span && strong && span.textContent.trim() === label) {

            strong.textContent = value;

        }

    });

}

/* ===========================================================
   RENDER 7-DAY FORECAST
=========================================================== */

function renderForecast(daily) {

    const days = daily.time.map((date, i) => ({
        date,
        max: daily.temperature_2m_max[i],
        min: daily.temperature_2m_min[i],
        code: daily.weather_code[i]
    }));

    const forecastDays = document.querySelectorAll(".forecast-day");

    forecastDays.forEach((dayEl, i) => {

        if (!days[i]) return;

        const d = days[i];

        const dayName = new Date(d.date + "T00:00:00")
            .toLocaleDateString("en-IN", { weekday: "short" });

        const { icon } = weatherDetails(d.code);

        const span = dayEl.querySelector("span");
        const iconEl = dayEl.querySelector("i");
        const strongEl = dayEl.querySelector("strong");

        if (span) span.textContent = dayName;

        if (iconEl) iconEl.className = `fa-solid ${icon}`;

        if (strongEl) strongEl.textContent = `${Math.round(d.max)}°`;

    });

}

/* ===========================================================
   INIT
=========================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const weatherText = document.getElementById("nbWeatherText");

    if (weatherText) {
        loadWeather();
        setInterval(loadWeather, 10 * 60 * 1000);
    }

});

/* ===========================================================
   END
=========================================================== */

console.log("✅ Live Weather Module Loaded");
