const API_KEY = "Tu API_KEY VA AQUI";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherCard = document.getElementById("weatherCard");
const errorMsg = document.getElementById("errorMsg");

// Canvas
const canvas = document.getElementById("bgCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

// Eventos
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) getWeather(city);
});
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchBtn.click();
});

// Obtener clima
async function getWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ciudad no encontrada");

    const data = await response.json();
    showWeather(data);
    changeBackground(data.weather[0].main, data.timezone);
  } catch (error) {
    weatherCard.classList.add("hidden");
    errorMsg.classList.remove("hidden");
    errorMsg.textContent = "⚠️ " + error.message;
  }
}

// Mostrar datos
function showWeather(data) {
  errorMsg.classList.add("hidden");
  weatherCard.classList.remove("hidden");

  document.getElementById("cityName").textContent = `${data.name}, ${data.sys.country}`;
  document.getElementById("date").textContent = new Date().toLocaleDateString("es-ES", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  document.getElementById("temperature").textContent = Math.round(data.main.temp);
  document.getElementById("description").textContent = data.weather[0].description;
  document.getElementById("wind").textContent = data.wind.speed;
  document.getElementById("humidity").textContent = data.main.humidity;

  const icon = data.weather[0].icon;
  document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${icon}@2x.png`;
}

// Cambiar fondo (día/noche + clima)
function changeBackground(weather, timezone) {
  particles = [];

  // Calcular hora local con timezone
  const localTime = new Date(Date.now() + timezone * 1000);
  const hours = localTime.getUTCHours();
  const isNight = hours < 6 || hours > 19;

  if (weather.includes("Rain")) {
    createParticles("rain");
    canvas.style.background = isNight
      ? "linear-gradient(135deg, #2c3e50, #34495e)"
      : "linear-gradient(135deg, #2c3e50, #3498db)";
  } else if (weather.includes("Snow")) {
    createParticles("snow");
    canvas.style.background = "linear-gradient(135deg, #e6f7ff, #bdc3c7)";
  } else if (weather.includes("Cloud")) {
    canvas.style.background = isNight
      ? "linear-gradient(135deg, #3a3a52, #2c3e50)"
      : "linear-gradient(135deg, #636363, #a2ab58)";
  } else if (weather.includes("Clear")) {
    if (isNight) {
      createParticles("stars");
      canvas.style.background = "linear-gradient(135deg, #0f2027, #203a43, #2c5364)";
    } else {
      canvas.style.background = "linear-gradient(135deg, #2980b9, #6dd5fa, #ffffff)";
    }
  } else {
    canvas.style.background = "linear-gradient(135deg, #1e3c72, #2a5298)";
  }
}

// Partículas (lluvia, nieve, estrellas)
function createParticles(type) {
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: type === "snow" ? 1 : 4,
      size: type === "snow" ? 3 : (type === "rain" ? 2 : 1),
      type
    });
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";

  particles.forEach(p => {
    if (p.type === "rain") {
      ctx.fillRect(p.x, p.y, 2, 10);
      p.y += p.speed;
    } else if (p.type === "snow") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      p.y += p.speed;
    } else if (p.type === "stars") {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    if (p.y > canvas.height) p.y = 0;
  });

  requestAnimationFrame(animateParticles);
}

animateParticles();
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});