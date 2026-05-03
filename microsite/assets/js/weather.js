/**
 * weather.js  —  Temperature Forecast Logic
 *
 * Uses:
 *   Open-Meteo Geocoding API: https://geocoding-api.open-meteo.com/v1/search
 *   Open-Meteo Forecast API:  https://api.open-meteo.com/v1/forecast
 */
 
/* ── Element References ── */
const locationForm     = document.getElementById('locationForm');
const locationInput    = document.getElementById('locationInput');
const locationError    = document.getElementById('locationError');
const apiError         = document.getElementById('apiError');
const loadingIndicator = document.getElementById('loadingIndicator');
const locationSection  = document.getElementById('locationSection');
const chartSection     = document.getElementById('chartSection');
const tableSection     = document.getElementById('tableSection');
const searchBtn        = document.getElementById('searchBtn');
 
const locName    = document.getElementById('locName');
const locAdmin1  = document.getElementById('locAdmin1');
const locCountry = document.getElementById('locCountry');
const locLat     = document.getElementById('locLat');
const locLon     = document.getElementById('locLon');
 
const forecastTableBody = document.getElementById('forecastTableBody');
 
let tempChart = null;
 
/* ── API Endpoints ── */
const GEO_API      = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';
 
/* ── Helpers ── */
function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }
 
function showError(el, msg) {
  el.textContent = msg;
  show(el);
}
 
function clearResults() {
  hide(locationSection);
  hide(chartSection);
  hide(tableSection);
  hide(apiError);
  hide(locationError);
  forecastTableBody.innerHTML = '';
  if (tempChart) { tempChart.destroy(); tempChart = null; }
}
 
function tempClass(tempF) {
  if (tempF <= 32) return 'temp-cold';
  if (tempF <= 50) return 'temp-cool';
  if (tempF <= 68) return 'temp-mild';
  if (tempF <= 85) return 'temp-warm';
  return 'temp-hot';
}
 
/* ── Geocoding ── */
async function geocodeLocation(locationStr) {
  const cityOnly = locationStr.split(',')[0].trim();
  const url = new URL(GEO_API);
  url.searchParams.set('name',     cityOnly);
  url.searchParams.set('count',    '10');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format',   'json');
 
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Geocoding request failed (HTTP ${response.status})`);
 
  const data = await response.json();
  if (!data.results || data.results.length === 0) return null;
  return data.results[0];
}
 
/* ── Forecast ── */
async function fetchForecast(latitude, longitude) {
  const url = new URL(FORECAST_API);
  url.searchParams.set('latitude',         latitude);
  url.searchParams.set('longitude',        longitude);
  url.searchParams.set('hourly',           'temperature_2m');
  url.searchParams.set('temperature_unit', 'fahrenheit');
  url.searchParams.set('forecast_days',    '7');
  url.searchParams.set('timezone',         'auto');
 
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Forecast request failed (HTTP ${response.status})`);
  return await response.json();
}
 
/* ── Render: Location Card ── */
function renderLocationCard(geoResult) {
  locName.textContent    = geoResult.name    || '—';
  locAdmin1.textContent  = geoResult.admin1  || '—';
  locCountry.textContent = geoResult.country || '—';
  locLat.textContent     = geoResult.latitude  != null ? geoResult.latitude.toFixed(4)  : '—';
  locLon.textContent     = geoResult.longitude != null ? geoResult.longitude.toFixed(4) : '—';
  show(locationSection);
}
 
/* ── Render: Table ── */
function renderTable(forecastData) {
  const times = forecastData.hourly.time;
  const temps = forecastData.hourly.temperature_2m;
  const fragment = document.createDocumentFragment();
 
  for (let i = 0; i < times.length; i++) {
    const friendlyDate = new Date(Date.parse(times[i])).toLocaleString();
    const tempF = temps[i];
    const tr    = document.createElement('tr');
    const tdNum  = document.createElement('td');
    const tdDate = document.createElement('td');
    const tdTemp = document.createElement('td');
 
    tdNum.textContent  = i + 1;
    tdDate.textContent = friendlyDate;
    tdTemp.textContent = tempF != null ? `${tempF.toFixed(1)} °F` : '—';
    tdTemp.classList.add(tempClass(tempF));
 
    tr.append(tdNum, tdDate, tdTemp);
    fragment.appendChild(tr);
  }
 
  forecastTableBody.appendChild(fragment);
  show(tableSection);
}
 
/* ── Render: Chart ── */
function renderChart(forecastData) {
  const times  = forecastData.hourly.time;
  const temps  = forecastData.hourly.temperature_2m;
  const labels = [];
  const data   = [];
 
  for (let i = 0; i < times.length; i++) {
    labels.push(new Date(Date.parse(times[i])).toLocaleString());
    data.push(temps[i] != null ? parseFloat(temps[i].toFixed(1)) : null);
  }
 
  const ctx = document.getElementById('tempChart').getContext('2d');
  if (tempChart) { tempChart.destroy(); tempChart = null; }
 
  tempChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°F)',
        data,
        borderColor: '#7ECBA0',
        backgroundColor: 'rgba(126,203,160,0.07)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#7ECBA0',
        fill: true,
        tension: 0.3,
        spanGaps: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { family: "'DM Sans', sans-serif", size: 13 },
            color: '#8FB5A0'
          }
        },
        tooltip: {
          backgroundColor: '#162E20',
          titleFont: { family: "'DM Sans', sans-serif", size: 11 },
          bodyFont:  { family: "'DM Sans', sans-serif", size: 13 },
          padding: 10,
          callbacks: {
            title: items => items[0].label,
            label: item  => ` ${item.formattedValue} °F`
          }
        }
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 14,
            maxRotation: 45,
            font: { family: "'DM Sans', sans-serif", size: 11 },
            color: '#5A7A68',
            callback: function(val, index) {
              return index % 24 === 0 ? this.getLabelForValue(val) : '';
            }
          },
          grid: { color: 'rgba(45,102,69,0.12)' }
        },
        y: {
          title: {
            display: true,
            text: 'Temperature (°F)',
            font: { family: "'DM Sans', sans-serif", size: 12 },
            color: '#5A7A68'
          },
          ticks: {
            font: { family: "'DM Sans', sans-serif", size: 11 },
            color: '#5A7A68',
            callback: val => `${val} °F`
          },
          grid: { color: 'rgba(45,102,69,0.12)' }
        }
      }
    }
  });
 
  show(chartSection);
}
 
/* ── Main Handler ── */
async function handleSearch(e) {
  e.preventDefault();
  clearResults();
 
  const locationStr = locationInput.value.trim();
  if (!locationStr) {
    showError(locationError, 'Location is required. Please enter a city, park, or address.');
    locationInput.focus();
    return;
  }
 
  searchBtn.disabled    = true;
  searchBtn.textContent = 'Loading…';
  show(loadingIndicator);
 
  try {
    const geoResult = await geocodeLocation(locationStr);
    if (!geoResult) {
      hide(loadingIndicator);
      showError(apiError, `No location found for "${locationStr}". Please try a different search term.`);
      return;
    }
    renderLocationCard(geoResult);
    const forecastData = await fetchForecast(geoResult.latitude, geoResult.longitude);
    renderChart(forecastData);
    renderTable(forecastData);
  } catch (err) {
    console.error('Weather forecast error:', err);
    showError(apiError, `Something went wrong: ${err.message}. Please check your connection and try again.`);
  } finally {
    hide(loadingIndicator);
    searchBtn.disabled    = false;
    searchBtn.textContent = 'Get Forecast';
  }
}
 
/* ── Init ── */
locationForm.addEventListener('submit', handleSearch);
 
window.addEventListener('DOMContentLoaded', () => {
  locationInput.value = 'Morrilton, Arkansas';
  locationForm.dispatchEvent(new Event('submit'));
});