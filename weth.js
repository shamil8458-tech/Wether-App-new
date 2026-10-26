



// ✅ OpenWeather API Key
const API_KEY = '66985d235b108dc1284b548dba971a4f';

// ✅ Elements
const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const errorMsg = document.getElementById("errorMsg");
const loading = document.getElementById("loading");
const favoritesList = document.getElementById("favoritesList");
const themeBtn = document.getElementById("themeBtn");

// ✅ 1. Get Current Weather
async function getWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error("City not found");
    }

    const data = await response.json();

    return {
      city: data.name,
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed
    };

  } catch (error) {
    throw error;
  }
}

// ✅ 2. Get 5 Day Forecast
async function getFiveDayForecast(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      throw new Error("Forecast not found");
    }

    const data = await response.json();

    return data.list.filter(item =>
      item.dt_txt.includes("12:00:00")
    );

  } catch (error) {
    throw error;
  }
}

// ✅ 3. Render Forecast
function renderForecast(forecastData) {
  const forecastContainer = document.getElementById("forecastcard");
  forecastContainer.innerHTML = "";

  forecastData.forEach(day => {
    const date = new Date(day.dt_txt).toDateString();
    const temp = Math.round(day.main.temp);
    const desc = day.weather[0].description;
    const icon = day.weather[0].icon;

    const card = document.createElement("div");
    card.className = "forecast-card";

    card.innerHTML = `
      <h4>${date}</h4>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
      <p>${temp}°C</p>
      <p>${desc}</p>
    `;

    forecastContainer.appendChild(card);
  });
}

// ✅ 4. Favorites
function addFavorite(city) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    loadFavorites();
  }
}

function loadFavorites() {
  favoritesList.innerHTML = "";
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  favorites.forEach(city => {
    const div = document.createElement("div");

    div.innerHTML = `
      <span onclick="searchWeather('${city}')">${city}</span>
      <button onclick="removeFavorite('${city}')">❌</button>
    `;

    favoritesList.appendChild(div);
  });
}

function removeFavorite(city) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(c => c !== city);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites();
}

// ✅ 5. Main Search Function
async function searchWeather(city) {
  if (!city) {
    errorMsg.textContent = "Please enter a city name";
    errorMsg.style.display = "block";
    return;
  }

  errorMsg.style.display = "none";
  weatherCard.style.display = "block";
  loading.style.display = "block";

  try {
    const weather = await getWeather(city);

    weatherCard.innerHTML = `
      <div class="weather-content">
        <h2>${weather.city}</h2>
        <p>🌡 Temp: ${weather.temp}°C</p>
        <p>🤗 Feels like: ${weather.feelsLike}°C</p>
        <p>☁ ${weather.description}</p>
        <p>💧 Humidity: ${weather.humidity}%</p>
        <p>💨 Wind: ${weather.windSpeed} m/s</p>

        <button onclick="addFavorite('${weather.city}')">
          ⭐ Add to Favorites
        </button>
      </div>
    `;

    // ✅ Forecast call
    const forecast = await getFiveDayForecast(city);
    renderForecast(forecast);

  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.style.display = "block";
  } finally {
    loading.style.display = "none";
  }
}

// ✅ 6. Theme Toggle
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent =
    document.body.classList.contains("dark") ? "☀ Light" : "🌙 Dark";
});

// ✅ 7. Button Click
document.getElementById("searchBtn").addEventListener("click", () => {
  searchWeather(cityInput.value.trim());
});

// ✅ 8. Enter Key Support
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchWeather(cityInput.value.trim());
  }
});

// ✅ 9. Suggestions
const suggestionsBox = document.getElementById("suggestions");

const cities = [
  "New York", "New Delhi", "London", "Paris",
  "Tokyo", "Dubai", "Kochi", "Mumbai", "Chennai",
  "Bangalore", "Hyderabad", "Kozhikode"
];

cityInput.addEventListener("input", () => {
  const value = cityInput.value.toLowerCase();
  suggestionsBox.innerHTML = "";

  if (!value) {
    suggestionsBox.style.display = "none";
    return;
  }

  const filtered = cities.filter(city =>
    city.toLowerCase().startsWith(value)
  );

  filtered.forEach(city => {
    const div = document.createElement("div");
    div.className = "suggestion-item";
    div.textContent = city;

    div.onclick = () => {
      cityInput.value = city;
      suggestionsBox.style.display = "none";
      searchWeather(city);
    };

    suggestionsBox.appendChild(div);
  });

  suggestionsBox.style.display = filtered.length ? "block" : "none";
});

// ✅ Load favorites on start
document.addEventListener('DOMContentLoaded', loadFavorites);

// ✅ Export functions
window.searchWeather = searchWeather;
window.addFavorite = addFavorite;
window.removeFavorite = removeFavorite;

