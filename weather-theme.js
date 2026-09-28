(() => {
  const widget = document.querySelector('[data-weather-theme]');
  if (!widget) return;

  const status = widget.querySelector('[data-weather-status]');
  const modeButtons = [...widget.querySelectorAll('[data-theme-mode]')];
  const storageKey = 'wpfw-weather-theme-mode';
  const location = {
    name: 'Amsterdam',
    latitude: 52.3676,
    longitude: 4.9041
  };
  const weatherDescriptions = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Heavy drizzle',
    56: 'Freezing drizzle',
    57: 'Heavy freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Light rain showers',
    81: 'Rain showers',
    82: 'Heavy rain showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Heavy thunderstorm'
  };

  let mode = 'auto';
  let automaticTheme = 'light';
  let weatherText = 'Loading weather...';

  try {
    const savedMode = localStorage.getItem(storageKey);
    if (['auto', 'light', 'dark'].includes(savedMode)) mode = savedMode;
  } catch {
    // Keep the automatic mode if browser storage is unavailable.
  }

  const applyTheme = () => {
    const isDark = mode === 'dark' || (mode === 'auto' && automaticTheme === 'dark');
    document.body.classList.toggle('theme-dark', isDark);

    modeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.themeMode === mode));
    });

    const modeText = mode === 'auto'
      ? `Auto: ${isDark ? 'dark' : 'light'}`
      : `Manual: ${mode}`;
    status.textContent = `${location.name} | ${weatherText} | ${modeText}`;
  };

  modeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      mode = button.dataset.themeMode;
      try {
        localStorage.setItem(storageKey, mode);
      } catch {
        // The selection still applies until this page is closed.
      }
      applyTheme();
    });
  });

  const loadWeather = async () => {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: String(location.latitude),
      longitude: String(location.longitude),
      current: 'weather_code',
      timezone: 'Europe/Amsterdam'
    });

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Weather request failed');

      const data = await response.json();
      const weatherCode = data.current?.weather_code;
      if (typeof weatherCode !== 'number') throw new Error('Weather data is unavailable');

      weatherText = weatherDescriptions[weatherCode] ?? 'Current conditions';
      automaticTheme = weatherCode >= 3 ? 'dark' : 'light';
    } catch {
      weatherText = 'Weather unavailable';
      automaticTheme = 'light';
    }

    applyTheme();
  };

  applyTheme();
  loadWeather();
})();
