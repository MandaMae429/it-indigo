/**
 * Currency Value History — main.js
 * Validates inputs, fetches forex data from Marketstack (Massive) API,
 * and renders a teal line chart with Chart.js.
 */
 
(function () {
  'use strict';
 
  const API_KEY = 'ep0phpZep9_zp8Je6iB4LorsXdbisOzg';
  let chartInstance = null;
 
  /* ── Currency meta ────────────────────────────────────── */
  const CURRENCIES = {
    USD: 'US Dollar',
    GBP: 'Great Britain Pound',
    EUR: 'Euro',
    JPY: 'Japanese Yen',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    CHF: 'Swiss Franc',
    MXN: 'Mexican Peso',
    CNY: 'Chinese Yuan',
    INR: 'Indian Rupee'
  };
 
  /* ── Helper: show / clear error ───────────────────────── */
  function showError(el, msg) {
    el.textContent = msg;
    el.classList.add('visible');
  }
  function clearError(el) {
    el.textContent = '';
    el.classList.remove('visible');
  }
  function markInvalid(input) { input.classList.add('invalid'); }
  function markValid(input)   { input.classList.remove('invalid'); }
 
  /* ── Date helpers ─────────────────────────────────────── */
  // Parse MM/DD/YYYY → Date object
  function parseDate(str) {
    const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!m) return null;
    const d = new Date(+m[3], +m[1] - 1, +m[2]);
    if (isNaN(d)) return null;
    return d;
  }
 
  // Format Date → YYYY-MM-DD for API
  function toISO(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  }
 
  /* ── Validate ─────────────────────────────────────────── */
  function validate() {
    let valid = true;
 
    const baseSel    = document.getElementById('base-currency');
    const convertSel = document.getElementById('convert-currency');
    const fromInput  = document.getElementById('from-date');
    const toInput    = document.getElementById('to-date');
 
    const baseErr    = document.getElementById('base-currency-error');
    const convertErr = document.getElementById('convert-currency-error');
    const fromErr    = document.getElementById('from-date-error');
    const toErr      = document.getElementById('to-date-error');
    const dateRangeErr = document.getElementById('date-range-error');
 
    // Clear all
    [baseErr, convertErr, fromErr, toErr, dateRangeErr].forEach(clearError);
    [baseSel, convertSel, fromInput, toInput].forEach(markValid);
 
    if (!baseSel.value) {
      showError(baseErr, 'Base Currency is Required');
      markInvalid(baseSel);
      valid = false;
    }
 
    if (!convertSel.value) {
      showError(convertErr, 'Convert to Currency is Required');
      markInvalid(convertSel);
      valid = false;
    }
 
    if (baseSel.value && convertSel.value && baseSel.value === convertSel.value) {
      showError(convertErr, 'Currencies must be different');
      markInvalid(convertSel);
      valid = false;
    }
 
    const fromRaw = fromInput.value.trim();
    const toRaw   = toInput.value.trim();
    let fromDate  = null;
    let toDate    = null;
 
    if (!fromRaw) {
      showError(fromErr, 'From Date is Required');
      markInvalid(fromInput);
      valid = false;
    } else {
      fromDate = parseDate(fromRaw);
      if (!fromDate) {
        showError(fromErr, 'Enter date as MM/DD/YYYY');
        markInvalid(fromInput);
        valid = false;
      }
    }
 
    if (!toRaw) {
      showError(toErr, 'To Date is Required');
      markInvalid(toInput);
      valid = false;
    } else {
      toDate = parseDate(toRaw);
      if (!toDate) {
        showError(toErr, 'Enter date as MM/DD/YYYY');
        markInvalid(toInput);
        valid = false;
      }
    }
 
    if (fromDate && toDate) {
      if (toDate < fromDate) {
        showError(dateRangeErr, 'To Date must be on or after From Date');
        markInvalid(toInput);
        valid = false;
      }
      // Limit to reasonable window (max 365 days) to keep API results manageable
      const diffDays = (toDate - fromDate) / 86400000;
      if (diffDays > 365) {
        showError(dateRangeErr, 'Date range may not exceed 365 days');
        valid = false;
      }
    }
 
    return valid;
  }
 
  /* ── Fetch & render ───────────────────────────────────── */
  function doFetch() {
    if (!validate()) return;
 
    const base    = document.getElementById('base-currency').value;
    const convert = document.getElementById('convert-currency').value;
    const fromDate = parseDate(document.getElementById('from-date').value.trim());
    const toDate   = parseDate(document.getElementById('to-date').value.trim());
 
    const apiError   = document.getElementById('api-error');
    const loadingMsg = document.getElementById('loading-msg');
    const chartSection = document.getElementById('chart-section');
 
    clearError(apiError);
    chartSection.classList.remove('visible');
    loadingMsg.classList.add('visible');
 
    // Marketstack forex endpoint
    // GET /v1/forex/eod?symbols=EURUSD&date_from=...&date_to=...&access_key=...
    const symbol = `${base}${convert}`;
    const url = `https://api.marketstack.com/v1/forex/eod` +
                `?access_key=${API_KEY}` +
                `&symbols=${symbol}` +
                `&date_from=${toISO(fromDate)}` +
                `&date_to=${toISO(toDate)}` +
                `&limit=1000`;
 
    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        loadingMsg.classList.remove('visible');
 
        if (json.error) {
          showError(apiError, 'API Error: ' + (json.error.message || JSON.stringify(json.error)));
          return;
        }
 
        const data = json.data;
        if (!data || data.length === 0) {
          showError(apiError, 'No data returned for the selected currencies and date range.');
          return;
        }
 
        // Sort ascending by date
        data.sort(function (a, b) { return a.date.localeCompare(b.date); });
 
        const labels = data.map(function (d) {
          // Format "YYYY-MM-DDT..." → "Feb 19" style
          const dt = new Date(d.date);
          return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const values = data.map(function (d) { return d.close; });
 
        renderChart(labels, values, base, convert);
      })
      .catch(function (err) {
        loadingMsg.classList.remove('visible');
        showError(apiError, 'Failed to fetch data: ' + err.message);
      });
  }
 
  /* ── Chart.js rendering ───────────────────────────────── */
  function renderChart(labels, values, base, convert) {
    const chartSection = document.getElementById('chart-section');
    const title = document.getElementById('chart-title');
    const canvas = document.getElementById('myChart');
 
    title.textContent = `${base} to ${convert}`;
 
    if (chartInstance) {
      chartInstance.destroy();
    }
 
    const teal = '#4ab3b3';
 
    chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `One ${base} to ${convert}`,
          data: values,
          borderColor: teal,
          backgroundColor: 'transparent',
          pointBackgroundColor: teal,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2.5,
          tension: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'start',
            labels: {
              font: { family: 'Georgia, serif', size: 13 },
              color: '#333',
              boxWidth: 36,
              boxHeight: 14,
              padding: 10
            }
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                return ` ${ctx.parsed.y.toFixed(4)} ${convert}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#e0e0e0' },
            ticks: { font: { family: 'Georgia, serif', size: 12 }, color: '#444' }
          },
          y: {
            grid: { color: '#e0e0e0' },
            ticks: {
              font: { family: 'Georgia, serif', size: 12 },
              color: '#444',
              callback: function (val) { return val.toFixed(3); }
            },
            title: {
              display: true,
              text: convert,
              font: { family: 'Georgia, serif', size: 12 },
              color: '#555'
            }
          }
        }
      }
    });
 
    chartSection.classList.add('visible');
  }
 
  /* ── Clear ────────────────────────────────────────────── */
  function doClear() {
    document.getElementById('base-currency').selectedIndex = 0;
    document.getElementById('convert-currency').selectedIndex = 0;
    document.getElementById('from-date').value = '';
    document.getElementById('to-date').value = '';
 
    document.querySelectorAll('.error-msg').forEach(function (el) {
      el.textContent = '';
      el.classList.remove('visible');
    });
 
    document.querySelectorAll('select, input[type="text"]').forEach(function (el) {
      el.classList.remove('invalid');
    });
 
    document.getElementById('api-error').classList.remove('visible');
    document.getElementById('loading-msg').classList.remove('visible');
    document.getElementById('chart-section').classList.remove('visible');
 
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  }
 
  /* ── Populate selects ─────────────────────────────────── */
  function populateSelects() {
    const baseSel    = document.getElementById('base-currency');
    const convertSel = document.getElementById('convert-currency');
 
    Object.entries(CURRENCIES).forEach(function ([code, name]) {
      const o1 = new Option(name, code);
      const o2 = new Option(name, code);
      if (code === 'USD') { o1.selected = true; }
      if (code === 'GBP') { o2.selected = true; }
      baseSel.add(o1);
      convertSel.add(o2);
    });
  }
 
  /* ── Boot ─────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    populateSelects();
 
    document.getElementById('btn-show').addEventListener('click', doFetch);
    document.getElementById('btn-clear').addEventListener('click', doClear);
 
    // Live clear errors on interaction
    ['base-currency', 'convert-currency'].forEach(function (id) {
      document.getElementById(id).addEventListener('change', function () {
        clearError(document.getElementById(id + '-error'));
        markValid(this);
      });
    });
    ['from-date', 'to-date'].forEach(function (id) {
      document.getElementById(id).addEventListener('input', function () {
        clearError(document.getElementById(id + '-error'));
        clearError(document.getElementById('date-range-error'));
        markValid(this);
      });
    });
  });
 
})();