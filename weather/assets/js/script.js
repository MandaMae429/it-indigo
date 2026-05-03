/**
 * Petit Jean State Park — Temperature Forecast
 * app.js
 *
 * Uses:
 *   - Open-Meteo Geocoding API: https://geocoding-api.open-meteo.com/v1/search
 *   - Open-Meteo Forecast API:  https://api.open-meteo.com/v1/forecast
 */
 
/* ───────── Element References ───────── */
const locationForm      = document.getElementById('locationForm');
const locationInput     = document.getElementById('locationInput');
const locationError     = document.getElementById('locationError');
const apiError          = document.getElementById('apiError');
const loadingIndicator  = document.getElementById('loadingIndicator');
const locationSection   = document.getElementById('locationSection');
const chartSection      = document.getElementById('chartSection');
const tableSection      = document.getElementById('tableSection');
const searchBtn         = document.getElementById('searchBtn');
 
// Location detail fields
const locName    = document.getElementById('locName');
const locAdmin1  = document.getElementById('locAdmin1');
const locCountry = document.getElementById('locCountry');
const locLat     = document.getElementById('locLat');
const locLon     = document.getElementById('locLon');
 
// Table body
const forecastTableBody = document.getElementById('forecastTableBody');
 
// Chart.js instance reference
let tempChart = null;
 
/* ───────── API Endpoints ───────── */
const GEO_API      = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';
 
/* ───────── Helpers ───────── */
 
/**
 * Show an element by removing the 'hidden' class.
 * @param {HTMLElement} el
 */
function show(el) { el.classList.remove('hidden'); }
 
/**
 * Hide an element by adding the 'hidden' class.
 * @param {HTMLElement} el
 */
function hide(el) { el.classList.add('hidden'); }
 
/**
 * Display an inline error message in the given element.
 * @param {HTMLElement} el  - the error paragraph element
 * @param {string}      msg - message to display
 */
function showError(el, msg) {
  el.textContent = msg;
  show(el);
}
 
/** Clear and hide all result sections. */
function clearResults() {
  hide(locationSection);
  hide(chartSection);
  hide(tableSection);
  hide(apiError);
  hide(locationError);
  forecastTableBody.innerHTML = '';
  if (tempChart) {
    tempChart.destroy();
    tempChart = null;
  }
}
 
/**
 * Return a CSS class based on temperature for color coding.
 * @param {number} tempF
 * @returns {string}
 */
function tempClass(tempF) {
  if (tempF <= 32)  return 'temp-cold';
  if (tempF <= 50)  return 'temp-cool';
  if (tempF <= 68)  return 'temp-mild';
  if (tempF <= 85)  return 'temp-warm';
  return 'temp-hot';
}
 
/* ───────── Geocoding ───────── */
 
/**
 * Fetch geocoding results for the given location string.
 * Returns the first match or null if none found.
 * @param {string} locationStr
 * @returns {Promise<object|null>}
 */
async function geocodeLocation(locationStr) {
  // Open-Meteo geocoding works best with just the city name.
  // Strip anything after a comma: "Morrilton, Arkansas" -> "Morrilton"
  const cityOnly = locationStr.split(',')[0].trim();
 
  const url = new URL(GEO_API);
  url.searchParams.set('name', cityOnly);
  url.searchParams.set('count', '10');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
 
  console.log('Geocoding URL:', url.toString());
  const response = await fetch(url.toString());
  console.log('Geocoding status:', response.status);
 
  if (!response.ok) {
    throw new Error(`Geocoding request failed (HTTP ${response.status})`);
  }
 
  const data = await response.json();
  console.log('Geocoding data:', data);
 
  if (!data.results || data.results.length === 0) {
    return null;
  }
 
  return data.results[0];
}
 
/* ───────── Forecast ───────── */
 
/**
 * Fetch hourly temperature forecast (2m above ground, °F) for a given lat/lon.
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<object>} Open-Meteo forecast JSON
 */
async function fetchForecast(latitude, longitude) {
  const url = new URL(FORECAST_API);
  url.searchParams.set('latitude',        latitude);
  url.searchParams.set('longitude',       longitude);
  url.searchParams.set('hourly',          'temperature_2m');
  url.searchParams.set('temperature_unit','fahrenheit');
  url.searchParams.set('forecast_days',   '7');
  url.searchParams.set('timezone',        'auto');
 
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Forecast request failed (HTTP ${response.status})`);
  }
 
  return await response.json();
}
 
/* ───────── Render: Location Card ───────── */
 
/**
 * Populate and display the location details card.
 * @param {object} geoResult - first geocoding result
 */
function renderLocationCard(geoResult) {
  locName.textContent    = geoResult.name    || '—';
  locAdmin1.textContent  = geoResult.admin1  || '—';
  locCountry.textContent = geoResult.country || '—';
  locLat.textContent     = geoResult.latitude  != null ? geoResult.latitude.toFixed(4)  : '—';
  locLon.textContent     = geoResult.longitude != null ? geoResult.longitude.toFixed(4) : '—';
  show(locationSection);
}
 
/* ───────── Render: Table ───────── */
 
/**
 * Build and display the hourly forecast table.
 * @param {object} forecastData - Open-Meteo forecast response
 */
function renderTable(forecastData) {
  const times = forecastData.hourly.time;
  const temps = forecastData.hourly.temperature_2m;
 
  const fragment = document.createDocumentFragment();
 
  for (let i = 0; i < times.length; i++) {
    // Convert date to unix milliseconds
    let unixmillsec = Date.parse(times[i]);
    // Create temporary date variable
    let tmpdate = new Date(unixmillsec);
    // Extract the date/time string for a more friendly format
    const friendlyDate = tmpdate.toLocaleString();
 
    const tempF = temps[i];
    const tr = document.createElement('tr');
 
    const tdNum  = document.createElement('td');
    const tdDate = document.createElement('td');
    const tdTemp = document.createElement('td');
 
    tdNum.textContent  = i + 1;
    tdDate.textContent = friendlyDate;
    tdTemp.textContent = tempF != null ? `${tempF.toFixed(1)} °F` : '—';
    tdTemp.classList.add(tempClass(tempF));
 
    tr.appendChild(tdNum);
    tr.appendChild(tdDate);
    tr.appendChild(tdTemp);
    fragment.appendChild(tr);
  }
 
  forecastTableBody.appendChild(fragment);
  show(tableSection);
}
 
/* ───────── Render: Chart ───────── */
 
/**
 * Build and display the Chart.js line chart.
 * @param {object} forecastData - Open-Meteo forecast response
 */
function renderChart(forecastData) {
  const times = forecastData.hourly.time;
  const temps = forecastData.hourly.temperature_2m;
 
  // Build friendly label array and data array
  const labels = [];
  const data   = [];
 
  for (let i = 0; i < times.length; i++) {
    // Convert date to unix milliseconds
    let unixmillsec = Date.parse(times[i]);
    // Create temporary date variable
    let tmpdate = new Date(unixmillsec);
    // Extract the date/time string for a more friendly format
    labels.push(tmpdate.toLocaleString());
    data.push(temps[i] != null ? parseFloat(temps[i].toFixed(1)) : null);
  }
 
  const ctx = document.getElementById('tempChart').getContext('2d');
 
  // Destroy previous chart if it exists
  if (tempChart) {
    tempChart.destroy();
    tempChart = null;
  }
 
  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°F)',
        data: data,
        borderColor: '#3b6d11',
        backgroundColor: 'rgba(59,109,17,0.08)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#27500a',
        fill: true,
        tension: 0.3,
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { family: "'DM Sans', sans-serif", size: 13 },
            color: '#444441'
          }
        },
        tooltip: {
          backgroundColor: '#1a3a2a',
          titleFont: { family: "'DM Sans', sans-serif", size: 11 },
          bodyFont:  { family: "'DM Sans', sans-serif", size: 13 },
          padding: 10,
          callbacks: {
            title: (items) => items[0].label,
            label: (item)  => ` ${item.formattedValue} °F`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 14,
            maxRotation: 45,
            font: { family: "'DM Sans', sans-serif", size: 11 },
            color: '#5f5e5a',
            callback: function(val, index) {
              // Show one label per day (every 24th entry)
              return index % 24 === 0 ? this.getLabelForValue(val) : '';
            }
          },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          title: {
            display: true,
            text: 'Temperature (°F)',
            font: { family: "'DM Sans', sans-serif", size: 12 },
            color: '#5f5e5a'
          },
          ticks: {
            font: { family: "'DM Sans', sans-serif", size: 11 },
            color: '#5f5e5a',
            callback: (val) => `${val} °F`
          },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    }
  });
 
  show(chartSection);
}
 
/* ───────── Main Handler ───────── */
 
/**
 * Handle form submission: validate, geocode, fetch forecast, render.
 * @param {Event} e
 */
async function handleSearch(e) {
  e.preventDefault();
  clearResults();
 
  const locationStr = locationInput.value.trim();
 
  // Validate: location is required
  if (!locationStr) {
    showError(locationError, 'Location is required. Please enter a city, park, or address.');
    locationInput.focus();
    return;
  }
 
  // Disable button and show loader
  searchBtn.disabled = true;
  searchBtn.textContent = 'Loading…';
  show(loadingIndicator);
 
  try {
    // Step 1: Geocode the location
    const geoResult = await geocodeLocation(locationStr);
 
    if (!geoResult) {
      hide(loadingIndicator);
      showError(apiError, `No location found for "${locationStr}". Please try a different search term.`);
      return;
    }
 
    // Step 2: Render location card
    renderLocationCard(geoResult);
 
    // Step 3: Fetch forecast using lat/lon
    const forecastData = await fetchForecast(geoResult.latitude, geoResult.longitude);
 
    // Step 4: Render chart
    renderChart(forecastData);
 
    // Step 5: Render table
    renderTable(forecastData);
 
  } catch (err) {
    console.error('Weather forecast error:', err);
    showError(apiError, `Something went wrong: ${err.message}. Please check your connection and try again.`);
  } finally {
    hide(loadingIndicator);
    searchBtn.disabled = false;
    searchBtn.textContent = 'Get Forecast';
  }
}
 
/* ───────── Init ───────── */
locationForm.addEventListener('submit', handleSearch);
 
// Auto-run on page load with the default location
window.addEventListener('DOMContentLoaded', () => {
  locationInput.value = "Morrilton, Arkansas";
  locationForm.dispatchEvent(new Event('submit'));
});